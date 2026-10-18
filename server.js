const express = require("express");
const path = require("path");
const session = require("express-session");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;
const RIFA_ID = Number(process.env.RIFA_ID || 1);

// ==========================================
// VALIDAR VARIABLES DE ENTORNO
// ==========================================

if (!process.env.SUPABASE_URL) {
  console.error("Falta SUPABASE_URL en el archivo .env");
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Falta SUPABASE_SERVICE_ROLE_KEY en el archivo .env");
  process.exit(1);
}

if (!process.env.ADMIN_USER) {
  console.error("Falta ADMIN_USER en el archivo .env");
  process.exit(1);
}

if (!process.env.ADMIN_PASSWORD) {
  console.error("Falta ADMIN_PASSWORD en el archivo .env");
  process.exit(1);
}

// ==========================================
// SUPABASE
// ==========================================

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

// ==========================================
// MIDDLEWARE
// ==========================================

app.set("trust proxy", 1);

app.use(express.json());

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "rifa-control-session-secret",

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

// ==========================================
// MIDDLEWARE ADMIN
// ==========================================

function requiereAdmin(req, res, next) {
  if (req.session && req.session.admin === true) {
    return next();
  }

  return res.status(401).json({
    error: "Debes iniciar sesión como administrador."
  });
}

// ==========================================
// LOGIN
// ==========================================

app.post("/api/login", (req, res) => {
  const { usuario, password } = req.body;

  if (
    usuario === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.admin = true;

    return res.json({
      ok: true
    });
  }

  return res.status(401).json({
    error: "Usuario o contraseña incorrectos."
  });
});

// ==========================================
// LOGOUT
// ==========================================

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({
      ok: true
    });
  });
});

// ==========================================
// CONSULTAR SESIÓN
// ==========================================

app.get("/api/session", (req, res) => {
  res.json({
    admin: req.session?.admin === true
  });
});

// ==========================================
// OBTENER RIFA
// ==========================================

async function obtenerRifa() {
  const { data, error } = await supabase
    .from("rifas")
    .select("*")
    .eq("id", RIFA_ID)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// ==========================================
// INFORMACIÓN PÚBLICA
// ==========================================

app.get("/api/publico", async (req, res) => {
  try {
    const rifa = await obtenerRifa();

    const {
      data: boletas,
      error: errorBoletas
    } = await supabase
      .from("boletas")
      .select("numero,pagado,valor")
      .eq("rifa_id", RIFA_ID)
      .order("numero", {
        ascending: true
      });

    if (errorBoletas) {
      throw errorBoletas;
    }

    const {
      data: ayudas,
      error: errorAyudas
    } = await supabase
      .from("ayudas")
      .select("valor")
      .eq("rifa_id", RIFA_ID);

    if (errorAyudas) {
      throw errorAyudas;
    }

    const vendidas = boletas.length;

    const pagadas = boletas.filter(
      boleta => boleta.pagado
    ).length;

    const pendientes =
      vendidas - pagadas;

    const disponibles =
      100 - vendidas;

    const dineroPagado = boletas
      .filter(boleta => boleta.pagado)
      .reduce(
        (total, boleta) =>
          total + Number(boleta.valor || 0),
        0
      );

    const dineroPendiente = boletas
      .filter(boleta => !boleta.pagado)
      .reduce(
        (total, boleta) =>
          total + Number(boleta.valor || 0),
        0
      );

    const totalAyudas = ayudas.reduce(
      (total, ayuda) =>
        total + Number(ayuda.valor || 0),
      0
    );

    const totalRecaudado =
      dineroPagado + totalAyudas;

    res.json({
      rifa,
      boletas,
      kpis: {
        totalRecaudado,
        pendientes,
        pagadas,
        vendidas,
        disponibles,
        dineroPendiente,
        ayudas: totalAyudas
      }
    });
  } catch (error) {
    console.error(
      "ERROR /api/publico:",
      error
    );

    res.status(500).json({
      error:
        "No fue posible cargar la información de la rifa."
    });
  }
});

// ==========================================
// DATOS ADMIN
// ==========================================

app.get(
  "/api/admin/datos",
  requiereAdmin,
  async (req, res) => {
    try {
      const rifa = await obtenerRifa();

      const {
        data: compradores,
        error: errorCompradores
      } = await supabase
        .from("compradores")
        .select("*")
        .eq("rifa_id", RIFA_ID)
        .order("fecha_registro", {
          ascending: true
        });

      if (errorCompradores) {
        throw errorCompradores;
      }

      const {
        data: boletas,
        error: errorBoletas
      } = await supabase
        .from("boletas")
        .select("*")
        .eq("rifa_id", RIFA_ID)
        .order("numero", {
          ascending: true
        });

      if (errorBoletas) {
        throw errorBoletas;
      }

      const {
        data: ayudas,
        error: errorAyudas
      } = await supabase
        .from("ayudas")
        .select("*")
        .eq("rifa_id", RIFA_ID)
        .order("fecha_registro", {
          ascending: false
        });

      if (errorAyudas) {
        throw errorAyudas;
      }

      res.json({
        rifa,
        compradores,
        boletas,
        ayudas
      });
    } catch (error) {
      console.error(
        "ERROR /api/admin/datos:",
        error
      );

      res.status(500).json({
        error:
          "No fue posible cargar los datos administrativos."
      });
    }
  }
);

// ==========================================
// REGISTRAR COMPRADOR + BOLETAS
// ==========================================

app.post(
  "/api/admin/registro",
  requiereAdmin,
  async (req, res) => {
    try {
      const {
        nombre,
        telefono,
        numeros,
        oferta,
        pagado,
        observacion
      } = req.body;

      if (
        !nombre ||
        !telefono ||
        !Array.isArray(numeros)
      ) {
        return res.status(400).json({
          error: "Datos incompletos."
        });
      }

      if (
        numeros.length !== 1 &&
        numeros.length !== 2
      ) {
        return res.status(400).json({
          error:
            "Debes registrar uno o dos números."
        });
      }

      if (
        oferta === true &&
        numeros.length !== 2
      ) {
        return res.status(400).json({
          error:
            "La promoción requiere exactamente dos números."
        });
      }

      if (
        oferta !== true &&
        numeros.length !== 1
      ) {
        return res.status(400).json({
          error:
            "Sin promoción solo puedes registrar un número."
        });
      }

      const numerosNormalizados =
        numeros.map(numero =>
          String(numero).padStart(2, "0")
        );

      const sinRepetir =
        new Set(numerosNormalizados);

      if (
        sinRepetir.size !==
        numerosNormalizados.length
      ) {
        return res.status(400).json({
          error:
            "Los números seleccionados deben ser diferentes."
        });
      }

      const numerosValidos =
        numerosNormalizados.every(
          numero =>
            /^[0-9]{2}$/.test(numero) &&
            Number(numero) >= 0 &&
            Number(numero) <= 99
        );

      if (!numerosValidos) {
        return res.status(400).json({
          error: "Número inválido."
        });
      }

      // Verificar que no estén vendidos
      const {
        data: existentes,
        error: errorExistentes
      } = await supabase
        .from("boletas")
        .select("numero")
        .eq("rifa_id", RIFA_ID)
        .in(
          "numero",
          numerosNormalizados
        );

      if (errorExistentes) {
        throw errorExistentes;
      }

      if (
        existentes &&
        existentes.length > 0
      ) {
        return res.status(409).json({
          error:
            `El número ${existentes[0].numero} ya fue vendido.`
        });
      }

      // Crear comprador
      const {
        data: comprador,
        error: errorComprador
      } = await supabase
        .from("compradores")
        .insert({
          rifa_id: RIFA_ID,
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          observacion:
            observacion?.trim() || null
        })
        .select()
        .single();

      if (errorComprador) {
        throw errorComprador;
      }

      // Valor individual de cada boleta
      const valorIndividual =
        oferta === true
          ? 10000
          : 15000;

      const nuevasBoletas =
        numerosNormalizados.map(
          numero => ({
            rifa_id: RIFA_ID,
            comprador_id:
              comprador.id,
            numero,
            pagado:
              Boolean(pagado),
            valor:
              valorIndividual,
            es_oferta:
              Boolean(oferta)
          })
        );

      const {
        data: boletasCreadas,
        error: errorBoletas
      } = await supabase
        .from("boletas")
        .insert(nuevasBoletas)
        .select();

      if (errorBoletas) {
        // si falla la creación de boletas
        // borrar comprador huérfano
        await supabase
          .from("compradores")
          .delete()
          .eq("id", comprador.id);

        if (
          errorBoletas.code ===
          "23505"
        ) {
          return res
            .status(409)
            .json({
              error:
                "Uno de los números ya fue registrado."
            });
        }

        throw errorBoletas;
      }

      res.json({
        ok: true,
        comprador,
        boletas:
          boletasCreadas
      });
    } catch (error) {
      console.error(
        "ERROR registro:",
        error
      );

      res.status(500).json({
        error:
          "No fue posible registrar la venta."
      });
    }
  }
);

// ==========================================
// EDITAR COMPRADOR
// ==========================================

app.patch(
  "/api/admin/compradores/:id",
  requiereAdmin,
  async (req, res) => {
    try {
      const id =
        Number(req.params.id);

      const {
        nombre,
        telefono,
        observacion
      } = req.body;

      if (!nombre || !telefono) {
        return res
          .status(400)
          .json({
            error:
              "Nombre y teléfono son obligatorios."
          });
      }

      const {
        data,
        error
      } = await supabase
        .from("compradores")
        .update({
          nombre:
            nombre.trim(),
          telefono:
            telefono.trim(),
          observacion:
            observacion?.trim() ||
            null
        })
        .eq("id", id)
        .eq("rifa_id", RIFA_ID)
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json({
        ok: true,
        comprador: data
      });
    } catch (error) {
      console.error(
        "ERROR editar comprador:",
        error
      );

      res.status(500).json({
        error:
          "No fue posible editar el comprador."
      });
    }
  }
);

// ==========================================
// CAMBIAR PAGO
// ==========================================

app.patch(
  "/api/admin/compradores/:id/pago",
  requiereAdmin,
  async (req, res) => {
    try {
      const compradorId =
        Number(req.params.id);

      const nuevoEstado =
        Boolean(req.body.pagado);

      const {
        error
      } = await supabase
        .from("boletas")
        .update({
          pagado:
            nuevoEstado
        })
        .eq("rifa_id", RIFA_ID)
        .eq(
          "comprador_id",
          compradorId
        );

      if (error) {
        throw error;
      }

      res.json({
        ok: true
      });
    } catch (error) {
      console.error(
        "ERROR cambiar pago:",
        error
      );

      res.status(500).json({
        error:
          "No fue posible modificar el estado de pago."
      });
    }
  }
);

// ==========================================
// ELIMINAR COMPRADOR
// ==========================================

app.delete(
  "/api/admin/compradores/:id",
  requiereAdmin,
  async (req, res) => {
    try {
      const id =
        Number(req.params.id);

      const {
        error
      } = await supabase
        .from("compradores")
        .delete()
        .eq("id", id)
        .eq("rifa_id", RIFA_ID);

      if (error) {
        throw error;
      }

      res.json({
        ok: true
      });
    } catch (error) {
      console.error(
        "ERROR eliminar comprador:",
        error
      );

      res.status(500).json({
        error:
          "No fue posible eliminar el registro."
      });
    }
  }
);

// ==========================================
// REGISTRAR AYUDA
// ==========================================

app.post(
  "/api/admin/ayudas",
  requiereAdmin,
  async (req, res) => {
    try {
      const valor =
        Number(req.body.valor);

      if (
        !Number.isFinite(valor) ||
        valor <= 0
      ) {
        return res
          .status(400)
          .json({
            error:
              "Ingresa un valor de ayuda válido."
          });
      }

      const {
        data,
        error
      } = await supabase
        .from("ayudas")
        .insert({
          rifa_id:
            RIFA_ID,
          valor:
            Math.round(valor)
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json({
        ok: true,
        ayuda: data
      });
    } catch (error) {
      console.error(
        "ERROR ayuda:",
        error
      );

      res.status(500).json({
        error:
          "No fue posible registrar la ayuda."
      });
    }
  }
);

// ==========================================
// ELIMINAR AYUDA
// ==========================================

app.delete(
  "/api/admin/ayudas/:id",
  requiereAdmin,
  async (req, res) => {
    try {
      const id =
        Number(req.params.id);

      const {
        error
      } = await supabase
        .from("ayudas")
        .delete()
        .eq("id", id)
        .eq("rifa_id", RIFA_ID);

      if (error) {
        throw error;
      }

      res.json({
        ok: true
      });
    } catch (error) {
      console.error(
        "ERROR eliminar ayuda:",
        error
      );

      res.status(500).json({
        error:
          "No fue posible eliminar la ayuda."
      });
    }
  }
);

// ==========================================
// RESULTADO MANUAL
// ==========================================

app.post(
  "/api/admin/resultado",
  requiereAdmin,
  async (req, res) => {
    try {
      let numero =
        String(
          req.body.numero || ""
        ).replace(
          /\D/g,
          ""
        );

      if (
        numero.length !== 2 &&
        numero.length !== 4
      ) {
        return res
          .status(400)
          .json({
            error:
              "Ingresa los 2 últimos dígitos o el número completo de 4 cifras."
          });
      }

      if (
        numero.length === 4
      ) {
        numero =
          numero.slice(-2);
      }

      const {
        error
      } = await supabase
        .from("rifas")
        .update({
          numero_ganador:
            numero,
          estado:
            "finalizada"
        })
        .eq("id", RIFA_ID);

      if (error) {
        throw error;
      }

      res.json({
        ok: true,
        numeroGanador:
          numero
      });
    } catch (error) {
      console.error(
        "ERROR resultado manual:",
        error
      );

      res.status(500).json({
        error:
          "No fue posible guardar el resultado."
      });
    }
  }
);

// ==========================================
// CONSULTAR RESULTADO OFICIAL
// ==========================================

async function consultarResultadoOficial() {
  try {
    const rifa =
      await obtenerRifa();

    if (
      rifa.numero_ganador
    ) {
      return;
    }

    const ahora =
      new Date();

    const fechaSorteo =
      new Date(
        rifa.fecha_sorteo
      );

    if (
      ahora <
      fechaSorteo
    ) {
      return;
    }

    console.log(
      "Buscando resultado de la Lotería de Boyacá..."
    );

    const respuesta =
      await fetch(
        "https://loteriadeboyaca.gov.co/"
      );

    if (!respuesta.ok) {
      return;
    }

    const html =
      await respuesta.text();

    const texto =
      html
        .replace(
          /<script[\s\S]*?<\/script>/gi,
          " "
        )
        .replace(
          /<style[\s\S]*?<\/style>/gi,
          " "
        )
        .replace(
          /<[^>]+>/g,
          " "
        )
        .replace(
          /&nbsp;/g,
          " "
        )
        .replace(
          /\s+/g,
          " "
        );

    const indice =
      texto.indexOf(
        `Sorteo #${rifa.numero_sorteo}`
      );

    if (
      indice === -1
    ) {
      return;
    }

    const fragmento =
      texto.slice(
        indice,
        indice + 1500
      );

    const coincidencia =
      fragmento.match(
        /N[uú]mero\s*([0-9])\s*([0-9])\s*([0-9])\s*([0-9])/i
      );

    if (
      !coincidencia
    ) {
      return;
    }

    const numeroCompleto =
      coincidencia[1] +
      coincidencia[2] +
      coincidencia[3] +
      coincidencia[4];

    const numeroGanador =
      numeroCompleto.slice(-2);

    const {
      error
    } = await supabase
      .from("rifas")
      .update({
        numero_ganador:
          numeroGanador,
        estado:
          "finalizada"
      })
      .eq("id", RIFA_ID);

    if (error) {
      throw error;
    }

    console.log(
      `Resultado encontrado: ${numeroCompleto}. Número ganador: ${numeroGanador}`
    );
  } catch (error) {
    console.error(
      "ERROR consulta automática:",
      error.message
    );
  }
}

setInterval(
  consultarResultadoOficial,
  10 * 60 * 1000
);

consultarResultadoOficial();

// ==========================================
// SERVIDOR
// ==========================================

app.listen(
  PORT,
  () => {
    console.log(
      `RifaControl funcionando en http://localhost:${PORT}`
    );
  }
);