let datosPublicos = null;
let datosAdmin = null;
let esAdmin = false;

const TELEFONO_RIFA = "3163237616";

const PAGINA_RIFA = "https://rifa-control.onrender.com/";

const gridNumeros = document.getElementById("gridNumeros");

const panelAdmin = document.getElementById("panelAdmin");

const modalLogin = document.getElementById("modalLogin");

const tablaRegistros = document.getElementById("tablaRegistros");

const numero1 = document.getElementById("numero1");

const numero2 = document.getElementById("numero2");

const oferta = document.getElementById("oferta");

const contenedorNumero2 = document.getElementById("contenedorNumero2");

const valorRegistro = document.getElementById("valorRegistro");

const modalConfirmarGanador = document.getElementById("modalConfirmarGanador");

const selectorGanador = document.getElementById("selectorGanador");

const nombreGanadorConfirmacion = document.getElementById(
  "nombreGanadorConfirmacion",
);

const telefonoGanadorConfirmacion = document.getElementById(
  "telefonoGanadorConfirmacion",
);

const premioGanadorConfirmacion = document.getElementById(
  "premioGanadorConfirmacion",
);

const mensajeGanadorConfirmacion = document.getElementById(
  "mensajeGanadorConfirmacion",
);

const checkConfirmarGanador = document.getElementById("checkConfirmarGanador");

// ==========================================
// UTILIDADES
// ==========================================

function dinero(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));
}

function formatearNumero(numero) {
  return String(numero).padStart(2, "0");
}

function telefonoWhatsApp(telefono) {
  let limpio = String(telefono || "").replace(/\D/g, "");

  if (limpio.length === 10) {
    limpio = "57" + limpio;
  }

  return limpio;
}

async function api(url, opciones = {}) {
  const respuesta = await fetch(url, {
    ...opciones,

    headers: {
      "Content-Type": "application/json",

      ...(opciones.headers || {}),
    },
  });

  let datos = {};

  try {
    datos = await respuesta.json();
  } catch {
    datos = {};
  }

  if (!respuesta.ok) {
    throw new Error(datos.error || "Ocurrió un error.");
  }

  return datos;
}

// ==========================================
// PÚBLICO
// ==========================================

async function cargarPublico() {
  try {
    datosPublicos = await api("/api/publico");

    renderInformacion();
    renderKPIs();
    renderTablero();
    renderResultado();
  } catch (error) {
    console.error(error);

    alert("No fue posible cargar la rifa.");
  }
}

function renderInformacion() {
  if (!datosPublicos) {
    return;
  }

  const rifa = datosPublicos.rifa;

  document.getElementById("tituloPremio").textContent = `Premio de ${dinero(
    rifa.premio,
  )}`;

  document.getElementById("premioPlantilla").textContent = `Premio de ${dinero(
    rifa.premio,
  )}`;

  document.getElementById("precioNormal").textContent = dinero(
    rifa.valor_numero,
  );

  document.getElementById("precioOferta").textContent = `2 x ${dinero(
    rifa.valor_oferta,
  )}`;

  document.getElementById("valorPlantilla").textContent = dinero(
    rifa.valor_numero,
  );

  document.getElementById("ofertaPlantilla").textContent =
    `2 números por ${dinero(rifa.valor_oferta)}`;

  const fecha = new Date(rifa.fecha_sorteo);

  const fechaTexto = fecha.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  });

  document.getElementById("fechaSorteo").textContent = fechaTexto;

  document.getElementById("detalleSorteo").textContent =
    `${rifa.loteria} · Sorteo #${rifa.numero_sorteo}`;

  document.getElementById("textoFechaPlantilla").innerHTML =
    `Sorteo: <strong>${fechaTexto}</strong>.`;
}

function renderKPIs() {
  const kpis = datosPublicos.kpis;

  document.getElementById("kpiTotal").textContent = dinero(kpis.totalRecaudado);

  document.getElementById("kpiPendientes").textContent = kpis.pendientes;

  document.getElementById("kpiPagadas").textContent = kpis.pagadas;

  document.getElementById("kpiVendidas").textContent = kpis.vendidas;

  document.getElementById("kpiDisponibles").textContent = kpis.disponibles;

  document.getElementById("kpiDineroPendiente").textContent = dinero(
    kpis.dineroPendiente,
  );

  document.getElementById("kpiAyudas").textContent = dinero(kpis.ayudas);

  document.getElementById("kpiTotalGeneral").textContent = dinero(
    kpis.totalRecaudado + kpis.dineroPendiente
  );

}

function buscarBoleta(numero) {
  return (
    datosPublicos?.boletas?.find((boleta) => boleta.numero === numero) || null
  );
}

function renderTablero() {
  gridNumeros.innerHTML = "";

  for (let i = 0; i < 100; i++) {
    const numero = formatearNumero(i);

    const boleta = buscarBoleta(numero);

    const celda = document.createElement("div");

    celda.className = "numero-celda";

    if (boleta) {
      celda.classList.add(boleta.pagado ? "pagado" : "pendiente");
    }

    const texto = document.createElement("span");

    texto.className = "numero-texto";

    texto.textContent = numero;

    celda.appendChild(texto);

    celda.addEventListener("click", () => {
      abrirNumero(numero, boleta);
    });

    gridNumeros.appendChild(celda);
  }
}

function abrirNumero(numero, boleta) {
  const contenido = document.getElementById("contenidoNumero");

  if (!boleta) {
    contenido.innerHTML = `
      <span class="etiqueta">
        NÚMERO
      </span>

      <h2>
        ${numero}
      </h2>

      <p>
        ✅ Este número está disponible.
      </p>
    `;
  } else {
    contenido.innerHTML = `
      <span class="etiqueta">
        NÚMERO
      </span>

      <h2>
        ${numero}
      </h2>

      <p>
        🎟️ Este número ya fue vendido.
      </p>

      <p>
        Estado:
        <strong>
          ${boleta.pagado ? "Pagado" : "Pendiente"}
        </strong>
      </p>
    `;
  }

  document.getElementById("modalNumero").classList.remove("oculto");
}

function renderResultado() {
  const rifa = datosPublicos.rifa;

  const estado = document.getElementById("estadoResultado");

  const numero = document.getElementById("numeroGanador");

  if (!rifa.numero_ganador) {
    estado.textContent = "El sorteo todavía no se ha realizado.";

    numero.classList.add("oculto");

    return;
  }

  estado.textContent = "Número ganador de la rifa:";

  numero.textContent = rifa.numero_ganador;

  numero.classList.remove("oculto");
}

// ==========================================
// SESIÓN
// ==========================================

async function comprobarSesion() {
  try {
    const sesion = await api("/api/session");

    esAdmin = sesion.admin;

    if (esAdmin) {
      await mostrarPanelAdmin();
    }
  } catch (error) {
    console.error(error);
  }
}

document
  .getElementById("btnAdministrar")
  .addEventListener("click", async () => {
    if (esAdmin) {
      await mostrarPanelAdmin();

      panelAdmin.scrollIntoView({
        behavior: "smooth",
      });
    } else {
      modalLogin.classList.remove("oculto");
    }
  });

document
  .getElementById("formLogin")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const usuario = document.getElementById("loginUsuario").value;

    const password = document.getElementById("loginPassword").value;

    const loginError = document.getElementById("loginError");

    loginError.textContent = "";

    try {
      await api("/api/login", {
        method: "POST",

        body: JSON.stringify({
          usuario,
          password,
        }),
      });

      esAdmin = true;

      modalLogin.classList.add("oculto");

      document.getElementById("formLogin").reset();

      await mostrarPanelAdmin();

      panelAdmin.scrollIntoView({
        behavior: "smooth",
      });
    } catch (error) {
      loginError.textContent = error.message;
    }
  });

document.getElementById("cerrarLogin").addEventListener("click", () => {
  modalLogin.classList.add("oculto");
});

document
  .getElementById("btnCerrarSesion")
  .addEventListener("click", async () => {
    try {
      await api("/api/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error(error);
    }

    esAdmin = false;

    datosAdmin = null;

    panelAdmin.classList.add("oculto");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

// ==========================================
// ADMIN
// ==========================================

async function mostrarPanelAdmin() {
  panelAdmin.classList.remove("oculto");

  await cargarAdmin();
}

async function cargarAdmin() {
  try {
    datosAdmin = await api("/api/admin/datos");

    renderSelects();
    renderTablaAdmin();
    renderAyudas();
    renderGanadorAdmin();
  } catch (error) {
    if (error.message.includes("iniciar sesión")) {
      esAdmin = false;

      panelAdmin.classList.add("oculto");

      return;
    }

    alert(error.message);
  }
}

function numerosVendidos() {
  return datosPublicos?.boletas?.map((boleta) => boleta.numero) || [];
}

function renderSelects() {
  const vendidos = numerosVendidos();

  numero1.innerHTML = `
    <option value="">
      Seleccionar
    </option>
  `;

  numero2.innerHTML = `
    <option value="">
      Seleccionar
    </option>
  `;

  for (let i = 0; i < 100; i++) {
    const numero = formatearNumero(i);

    if (!vendidos.includes(numero)) {
      const opcion = `
        <option value="${numero}">
          ${numero}
        </option>
      `;

      numero1.innerHTML += opcion;

      numero2.innerHTML += opcion;
    }
  }
}

oferta.addEventListener("change", () => {
  if (oferta.checked) {
    contenedorNumero2.classList.remove("oculto");

    numero2.required = true;

    valorRegistro.textContent = dinero(20000);
  } else {
    contenedorNumero2.classList.add("oculto");

    numero2.required = false;

    numero2.value = "";

    valorRegistro.textContent = dinero(15000);
  }
});

document
  .getElementById("formRifa")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();

    const telefono = document.getElementById("telefono").value.trim();

    const primerNumero = numero1.value;

    const segundoNumero = numero2.value;

    const observacion = document.getElementById("observacion").value.trim();

    const esOferta = oferta.checked;

    const pagado = document.getElementById("pagado").checked;

    if (esOferta && !segundoNumero) {
      alert("Selecciona el segundo número.");

      return;
    }

    if (esOferta && primerNumero === segundoNumero) {
      alert("Selecciona dos números diferentes.");

      return;
    }

    const numeros = esOferta ? [primerNumero, segundoNumero] : [primerNumero];

    try {
      await api("/api/admin/registro", {
        method: "POST",

        body: JSON.stringify({
          nombre,
          telefono,
          numeros,
          oferta: esOferta,
          pagado,
          observacion,
        }),
      });

      alert("Registro guardado correctamente.");

      document.getElementById("formRifa").reset();

      contenedorNumero2.classList.add("oculto");

      numero2.required = false;

      valorRegistro.textContent = dinero(15000);

      await recargarTodo();
    } catch (error) {
      alert(error.message);
    }
  });

// ==========================================
// AYUDAS
// ==========================================

document
  .getElementById("formAyuda")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const input = document.getElementById("valorAyuda");

    const valor = Number(input.value);

    try {
      await api("/api/admin/ayudas", {
        method: "POST",

        body: JSON.stringify({
          valor,
        }),
      });

      input.value = "";

      await recargarTodo();
    } catch (error) {
      alert(error.message);
    }
  });

// ==========================================
// COMPRADORES
// ==========================================

function compradoresConBoletas() {
  if (!datosAdmin) {
    return [];
  }

  return datosAdmin.compradores.map((comprador) => {
    const boletas = datosAdmin.boletas.filter(
      (boleta) => boleta.comprador_id === comprador.id,
    );

    return {
      ...comprador,
      boletas,
    };
  });
}

function renderTablaAdmin() {
  tablaRegistros.innerHTML = "";

  const registros = compradoresConBoletas();

  registros.forEach((registro) => {
    const numeros = registro.boletas.map((boleta) => boleta.numero).join(", ");

    const valor = registro.boletas.reduce(
      (total, boleta) => total + Number(boleta.valor),
      0,
    );

    const pagado = registro.boletas.every((boleta) => boleta.pagado);

    const fila = document.createElement("tr");

    fila.innerHTML = `
        <td>
          <strong>
            ${numeros}
          </strong>
        </td>

        <td>
          ${registro.nombre}
        </td>

        <td>
          ${registro.telefono}
        </td>

        <td>
          ${dinero(valor)}
        </td>

        <td>
          <span class="
            badge
            ${pagado ? "badge-pagado" : "badge-pendiente"}
          ">
            ${pagado ? "Pagado" : "Pendiente"}
          </span>
        </td>

        <td>
          <div class="acciones">

            <button
              class="btn-tabla btn-pagar"
              onclick="cambiarPago(
                ${registro.id},
                ${!pagado}
              )"
            >
              ${pagado ? "Pendiente" : "Pagar"}
            </button>

            <button
              class="btn-tabla btn-editar"
              onclick="editarComprador(
                ${registro.id}
              )"
            >
              Editar
            </button>

            <button
              class="btn-tabla btn-whatsapp"
              onclick="contactarComprador(
                ${registro.id}
              )"
            >
              WhatsApp
            </button>

            <button
              class="btn-tabla btn-eliminar"
              onclick="eliminarComprador(
                ${registro.id}
              )"
            >
              Eliminar
            </button>

          </div>
        </td>
      `;

    tablaRegistros.appendChild(fila);
  });
}

window.cambiarPago = async function (id, pagado) {
  try {
    await api(`/api/admin/compradores/${id}/pago`, {
      method: "PATCH",

      body: JSON.stringify({
        pagado,
      }),
    });

    await recargarTodo();
  } catch (error) {
    alert(error.message);
  }
};

window.editarComprador = async function (id) {
  const comprador = datosAdmin.compradores.find(
    (comprador) => comprador.id === id,
  );

  if (!comprador) {
    return;
  }

  const nuevoNombre = prompt("Nombre:", comprador.nombre);

  if (nuevoNombre === null) {
    return;
  }

  const nuevoTelefono = prompt("Teléfono:", comprador.telefono);

  if (nuevoTelefono === null) {
    return;
  }

  const nuevaObservacion = prompt("Observación:", comprador.observacion || "");

  if (nuevaObservacion === null) {
    return;
  }

  try {
    await api(`/api/admin/compradores/${id}`, {
      method: "PATCH",

      body: JSON.stringify({
        nombre: nuevoNombre,

        telefono: nuevoTelefono,

        observacion: nuevaObservacion,
      }),
    });

    await recargarTodo();
  } catch (error) {
    alert(error.message);
  }
};

// ==========================================
// WHATSAPP COMPRADOR
// ==========================================

window.contactarComprador =
  function(id) {
    const comprador =
      compradoresConBoletas()
        .find(
          comprador =>
            comprador.id === id
        );

    if (!comprador) {
      return;
    }

    const telefono =
      telefonoWhatsApp(
        comprador.telefono
      );

    const boletas =
      comprador.boletas || [];

    const numeros =
      boletas
        .map(
          boleta =>
            boleta.numero
        )
        .join(", ");

    const boletasPendientes =
      boletas.filter(
        boleta =>
          !boleta.pagado
      );

    const cantidadPendientes =
      boletasPendientes.length;

    const valorPendiente =
      boletasPendientes.reduce(
        (
          total,
          boleta
        ) =>
          total +
          Number(
            boleta.valor || 0
          ),
        0
      );

    const todasPagadas =
      boletas.length > 0 &&
      boletas.every(
        boleta =>
          boleta.pagado
      );

    let mensaje = "";

    if (todasPagadas) {
      mensaje =
`Hola ${comprador.nombre}

¡Ya falta muy poco para el sorteo!

Tus boletas están pagadas y listas para participar.

Tus números son: ${numeros}

Cuando se publique el resultado podrás consultarlo directamente en:

${PAGINA_RIFA}

Muchas gracias por participar y mucha suerte con tus números.`;
    } else {
      const numerosPendientes =
        boletasPendientes
          .map(
            boleta =>
              boleta.numero
          )
          .join(", ");

      mensaje =
`Hola ${comprador.nombre}

¡Se acerca el día de la rifa!

Recuerda que para participar en el sorteo tus boletas deben estar pagadas.

Actualmente tienes ${cantidadPendientes} boleta(s) pendiente(s).

Número(s) pendiente(s): ${numerosPendientes}

Valor pendiente por pagar: ${dinero(valorPendiente)}

Puedes realizar el pago por Llave a cualquiera de estas opciones:

Llave: @QRW940
Número: 1032940369

Cuando realices el pago, respóndeme este mensaje con el comprobante para actualizar tus boletas como pagadas.

Puedes consultar el estado de la rifa y posteriormente el resultado en:

${PAGINA_RIFA}

Muchas gracias por participar y mucha suerte.`;
    }

    window.open(
      `https://wa.me/${telefono}?text=${encodeURIComponent(
        mensaje
      )}`,
      "_blank"
    );
  };

window.eliminarComprador = async function (id) {
  const comprador = datosAdmin.compradores.find(
    (comprador) => comprador.id === id,
  );

  if (!comprador) {
    return;
  }

  const confirmar = confirm(
    `¿Eliminar a ${comprador.nombre} y liberar sus números?`,
  );

  if (!confirmar) {
    return;
  }

  try {
    await api(`/api/admin/compradores/${id}`, {
      method: "DELETE",
    });

    await recargarTodo();
  } catch (error) {
    alert(error.message);
  }
};

// ==========================================
// HISTORIAL DE AYUDAS
// ==========================================

function renderAyudas() {
  const contenedor = document.getElementById("listaAyudas");

  contenedor.innerHTML = "";

  if (datosAdmin.ayudas.length === 0) {
    contenedor.innerHTML = `
      <p class="texto-suave">
        Todavía no hay ayudas registradas.
      </p>
    `;

    return;
  }

  datosAdmin.ayudas.forEach((ayuda) => {
    const item = document.createElement("div");

    item.className = "ayuda-item";

    const fecha = new Date(ayuda.fecha_registro).toLocaleString("es-CO");

    item.innerHTML = `
          <div>

            <strong>
              ${dinero(ayuda.valor)}
            </strong>

            <small>
              ${fecha}
            </small>

          </div>

          <button
            class="btn-tabla btn-eliminar"
            onclick="eliminarAyuda(
              ${ayuda.id}
            )"
          >
            Eliminar
          </button>
        `;

    contenedor.appendChild(item);
  });
}

window.eliminarAyuda = async function (id) {
  if (!confirm("¿Eliminar esta ayuda?")) {
    return;
  }

  try {
    await api(`/api/admin/ayudas/${id}`, {
      method: "DELETE",
    });

    await recargarTodo();
  } catch (error) {
    alert(error.message);
  }
};

// ==========================================
// RESULTADO MANUAL
// ==========================================

document
  .getElementById("formResultado")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const input = document.getElementById("resultadoManual");

    const confirmar = confirm(
      `¿Seguro que deseas registrar ${input.value} como resultado de la rifa?`,
    );

    if (!confirmar) {
      return;
    }

    try {
      await api("/api/admin/resultado", {
        method: "POST",

        body: JSON.stringify({
          numero: input.value,
        }),
      });

      input.value = "";

      await recargarTodo();

      alert(
        "Resultado guardado. Revisa cuidadosamente los datos del ganador antes de notificar.",
      );
    } catch (error) {
      alert(error.message);
    }
  });

// ==========================================
// GANADOR
// ==========================================

function obtenerCompradorPorNumero(numero) {
  if (!datosAdmin) {
    return null;
  }

  const boleta = datosAdmin.boletas.find((boleta) => boleta.numero === numero);

  if (!boleta) {
    return null;
  }

  const comprador = datosAdmin.compradores.find(
    (comprador) => comprador.id === boleta.comprador_id,
  );

  if (!comprador) {
    return null;
  }

  return {
    comprador,
    boleta,
  };
}

function renderGanadorAdmin() {
  const contenedor = document.getElementById("ganadorAdmin");

  const numero = datosAdmin?.rifa?.numero_ganador;

  if (!numero) {
    contenedor.classList.add("oculto");

    return;
  }

  const datosGanador = obtenerCompradorPorNumero(numero);

  if (!datosGanador) {
    contenedor.innerHTML = `
      <span class="etiqueta">
        RESULTADO
      </span>

      <h2>
        Número ganador: ${numero}
      </h2>

      <p>
        Este número no fue vendido.
      </p>

      <div class="ganador-acciones">

        <button
          class="btn-secundario"
          onclick="abrirConfirmacionGanador()"
        >
          Revisar / cambiar ganador
        </button>

      </div>
    `;

    contenedor.classList.remove("oculto");

    return;
  }

  const { comprador, boleta } = datosGanador;

  contenedor.innerHTML = `
    <span class="etiqueta">
      🏆 GANADOR
    </span>

    <h2>
      ${comprador.nombre}
    </h2>

    <div class="ganador-datos">

      <p>
        Número ganador:
        <strong>
          ${numero}
        </strong>
      </p>

      <p>
        Teléfono:
        <strong>
          ${comprador.telefono}
        </strong>
      </p>

      <p>
        Estado de la boleta:
        <strong>
          ${boleta.pagado ? "Pagada" : "Pendiente de pago"}
        </strong>
      </p>

    </div>

    <div class="ganador-acciones">

      <button
        class="btn-secundario"
        onclick="abrirConfirmacionGanador()"
      >
        Revisar / cambiar ganador
      </button>

      <button
        class="btn-principal btn-notificar"
        onclick="abrirConfirmacionGanador()"
      >
        📲 Notificar ganador
      </button>

    </div>
  `;

  contenedor.classList.remove("oculto");
}

// ==========================================
// MODAL CONFIRMACIÓN GANADOR
// ==========================================

window.abrirConfirmacionGanador = function () {
  if (!datosAdmin) {
    return;
  }

  selectorGanador.innerHTML = "";

  const boletasOrdenadas = [...datosAdmin.boletas].sort(
    (a, b) => Number(a.numero) - Number(b.numero),
  );

  boletasOrdenadas.forEach((boleta) => {
    const comprador = datosAdmin.compradores.find(
      (comprador) => comprador.id === boleta.comprador_id,
    );

    if (!comprador) {
      return;
    }

    const opcion = document.createElement("option");

    opcion.value = boleta.numero;

    opcion.textContent = `${boleta.numero} — ${comprador.nombre}`;

    selectorGanador.appendChild(opcion);
  });

  const numeroActual = datosAdmin.rifa.numero_ganador;

  if (
    numeroActual &&
    [...selectorGanador.options].some((opcion) => opcion.value === numeroActual)
  ) {
    selectorGanador.value = numeroActual;
  }

  checkConfirmarGanador.checked = false;

  actualizarDatosConfirmacionGanador();

  modalConfirmarGanador.classList.remove("oculto");
};

function actualizarDatosConfirmacionGanador() {
  const numero = selectorGanador.value;

  const datosGanador = obtenerCompradorPorNumero(numero);

  if (!datosGanador) {
    nombreGanadorConfirmacion.value = "";

    telefonoGanadorConfirmacion.value = "";

    mensajeGanadorConfirmacion.value = "";

    return;
  }

  const { comprador } = datosGanador;

  nombreGanadorConfirmacion.value = comprador.nombre;

  telefonoGanadorConfirmacion.value = comprador.telefono;

  premioGanadorConfirmacion.value = dinero(datosAdmin.rifa.premio);

  mensajeGanadorConfirmacion.value = `🎉 ¡Felicitaciones, ${comprador.nombre}!

Has sido el ganador de nuestra Gran Rifa con el número ${numero}.

🏆 Tu premio es de ${dinero(datosAdmin.rifa.premio)}.

Muchas gracias por participar y nuevamente te felicitamos por haber ganado.

Puedes consultar el resultado de la rifa aquí:

🌐 ${PAGINA_RIFA}

Responde este mensaje o escríbenos al ${TELEFONO_RIFA} para coordinar la entrega de tu premio.`;
}

selectorGanador.addEventListener("change", () => {
  checkConfirmarGanador.checked = false;

  actualizarDatosConfirmacionGanador();
});

document
  .getElementById("cerrarConfirmarGanador")
  .addEventListener("click", () => {
    modalConfirmarGanador.classList.add("oculto");
  });

modalConfirmarGanador.addEventListener("click", (event) => {
  if (event.target === modalConfirmarGanador) {
    modalConfirmarGanador.classList.add("oculto");
  }
});

// ==========================================
// GUARDAR GANADOR
// ==========================================

document
  .getElementById("btnGuardarGanador")
  .addEventListener("click", async () => {
    const numero = selectorGanador.value;

    if (!numero) {
      alert("Selecciona un número ganador.");

      return;
    }

    if (!checkConfirmarGanador.checked) {
      alert("Debes confirmar que revisaste los datos del ganador.");

      return;
    }

    const datosGanador = obtenerCompradorPorNumero(numero);

    if (!datosGanador) {
      alert("El número seleccionado no pertenece a ningún comprador.");

      return;
    }

    const confirmar = confirm(
      `Vas a guardar el número ${numero} como ganador.\n\nGanador: ${datosGanador.comprador.nombre}\nTeléfono: ${telefonoGanadorConfirmacion.value}\n\n¿Confirmas que los datos son correctos?`,
    );

    if (!confirmar) {
      return;
    }

    try {
      await api("/api/admin/resultado", {
        method: "POST",

        body: JSON.stringify({
          numero,
        }),
      });

      await recargarTodo();

      modalConfirmarGanador.classList.add("oculto");

      alert("Ganador confirmado correctamente.");
    } catch (error) {
      alert(error.message);
    }
  });

// ==========================================
// NOTIFICAR GANADOR POR WHATSAPP
// ==========================================

document
  .getElementById("btnNotificarGanador")
  .addEventListener("click", async () => {
    const numero = selectorGanador.value;

    const datosGanador = obtenerCompradorPorNumero(numero);

    if (!datosGanador) {
      alert("No se encontró un comprador asociado al número seleccionado.");

      return;
    }

    const nombre = datosGanador.comprador.nombre;

    const telefonoIngresado = telefonoGanadorConfirmacion.value.trim();

    if (!telefonoIngresado) {
      alert("Revisa el teléfono del ganador.");

      return;
    }

    if (!checkConfirmarGanador.checked) {
      alert("Debes marcar la casilla confirmando que revisaste los datos.");

      return;
    }

    const telefono = telefonoWhatsApp(telefonoIngresado);

    if (telefono.length < 10) {
      alert(
        "El número de teléfono parece incorrecto. Revísalo antes de continuar.",
      );

      return;
    }

    const mensaje = mensajeGanadorConfirmacion.value.trim();

    if (!mensaje) {
      alert("El mensaje está vacío.");

      return;
    }

    const confirmar = confirm(
      `ÚLTIMA CONFIRMACIÓN

Número ganador: ${numero}

Ganador:
${nombre}

WhatsApp:
${telefonoIngresado}

¿Estás completamente seguro de que deseas abrir WhatsApp para notificar a esta persona?`,
    );

    if (!confirmar) {
      return;
    }

    try {
      await api("/api/admin/resultado", {
        method: "POST",

        body: JSON.stringify({
          numero,
        }),
      });

      await recargarTodo();

      const url = `https://wa.me/${telefono}?text=${encodeURIComponent(
        mensaje,
      )}`;

      window.open(url, "_blank");

      modalConfirmarGanador.classList.add("oculto");
    } catch (error) {
      alert(error.message);
    }
  });

// ==========================================
// RECARGAR
// ==========================================

async function recargarTodo() {
  await cargarPublico();

  if (esAdmin) {
    await cargarAdmin();
  }
}

// ==========================================
// MODALES
// ==========================================

document.getElementById("cerrarNumero").addEventListener("click", () => {
  document.getElementById("modalNumero").classList.add("oculto");
});

modalLogin.addEventListener("click", (event) => {
  if (event.target === modalLogin) {
    modalLogin.classList.add("oculto");
  }
});

document.getElementById("modalNumero").addEventListener("click", (event) => {
  if (event.target.id === "modalNumero") {
    event.currentTarget.classList.add("oculto");
  }
});

// ==========================================
// INICIAR
// ==========================================

async function iniciar() {
  await cargarPublico();
  await comprobarSesion();
}

iniciar();

setInterval(cargarPublico, 60 * 1000);
