let datosPublicos = null;
let datosAdmin = null;
let esAdmin = false;

// ==========================================
// CONFIGURACIÓN
// ==========================================

const TELEFONO_RIFA =
  "3163237616";

const PAGINA_RIFA =
  "https://rifa-control.onrender.com/";

const LLAVE_PAGO =
  "@QRW940";

const NUMERO_PAGO =
  "1032940369";

// ==========================================
// ELEMENTOS
// ==========================================

const gridNumeros =
  document.getElementById(
    "gridNumeros"
  );

const panelAdmin =
  document.getElementById(
    "panelAdmin"
  );

const modalLogin =
  document.getElementById(
    "modalLogin"
  );

const tablaRegistros =
  document.getElementById(
    "tablaRegistros"
  );

const numero1 =
  document.getElementById(
    "numero1"
  );

const numero2 =
  document.getElementById(
    "numero2"
  );

const oferta =
  document.getElementById(
    "oferta"
  );

const contenedorNumero2 =
  document.getElementById(
    "contenedorNumero2"
  );

const valorRegistro =
  document.getElementById(
    "valorRegistro"
  );

// GANADOR

const modalConfirmarGanador =
  document.getElementById(
    "modalConfirmarGanador"
  );

const selectorGanador =
  document.getElementById(
    "selectorGanador"
  );

const nombreGanadorConfirmacion =
  document.getElementById(
    "nombreGanadorConfirmacion"
  );

const telefonoGanadorConfirmacion =
  document.getElementById(
    "telefonoGanadorConfirmacion"
  );

const premioGanadorConfirmacion =
  document.getElementById(
    "premioGanadorConfirmacion"
  );

const mensajeGanadorConfirmacion =
  document.getElementById(
    "mensajeGanadorConfirmacion"
  );

const checkConfirmarGanador =
  document.getElementById(
    "checkConfirmarGanador"
  );

// MASIVO

const modalMasivo =
  document.getElementById(
    "modalMasivo"
  );

const tituloMasivo =
  document.getElementById(
    "tituloMasivo"
  );

const resumenMasivo =
  document.getElementById(
    "resumenMasivo"
  );

const listaMensajesMasivos =
  document.getElementById(
    "listaMensajesMasivos"
  );

const resumenSeleccionados =
  document.getElementById(
    "resumenSeleccionados"
  );

const checkMensajesRevisados =
  document.getElementById(
    "checkMensajesRevisados"
  );

const textoConfirmacionMasivo =
  document.getElementById(
    "textoConfirmacionMasivo"
  );

let colaMasiva = [];
let tipoMasivoActual = "";

// ==========================================
// UTILIDADES
// ==========================================

function dinero(valor) {
  return new Intl.NumberFormat(
    "es-CO",
    {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }
  ).format(
    Number(valor || 0)
  );
}

function formatearNumero(numero) {
  return String(numero)
    .padStart(2, "0");
}

function telefonoWhatsApp(
  telefono
) {
  let limpio =
    String(
      telefono || ""
    )
      .replace(
        /\D/g,
        ""
      );

  if (
    limpio.length ===
    10
  ) {
    limpio =
      "57" + limpio;
  }

  return limpio;
}

async function api(
  url,
  opciones = {}
) {
  const respuesta =
    await fetch(
      url,
      {
        ...opciones,

        headers: {
          "Content-Type":
            "application/json",

          ...(opciones.headers ||
            {})
        }
      }
    );

  let datos = {};

  try {
    datos =
      await respuesta.json();
  } catch {
    datos = {};
  }

  if (!respuesta.ok) {
    throw new Error(
      datos.error ||
      "Ocurrió un error."
    );
  }

  return datos;
}

// ==========================================
// PÚBLICO
// ==========================================

async function cargarPublico() {
  try {
    datosPublicos =
      await api(
        "/api/publico"
      );

    renderInformacion();
    renderKPIs();
    renderTablero();
    renderResultado();
  } catch (error) {
    console.error(error);
  }
}

function renderInformacion() {
  if (!datosPublicos) {
    return;
  }

  const rifa =
    datosPublicos.rifa;

  document.getElementById(
    "tituloPremio"
  ).textContent =
    `Premio de ${dinero(
      rifa.premio
    )}`;

  document.getElementById(
    "premioPlantilla"
  ).textContent =
    `Premio de ${dinero(
      rifa.premio
    )}`;

  document.getElementById(
    "precioNormal"
  ).textContent =
    dinero(
      rifa.valor_numero
    );

  document.getElementById(
    "precioOferta"
  ).textContent =
    `2 x ${dinero(
      rifa.valor_oferta
    )}`;

  document.getElementById(
    "valorPlantilla"
  ).textContent =
    dinero(
      rifa.valor_numero
    );

  document.getElementById(
    "ofertaPlantilla"
  ).textContent =
    `2 números por ${dinero(
      rifa.valor_oferta
    )}`;

  const fecha =
    new Date(
      rifa.fecha_sorteo
    );

  const fechaTexto =
    fecha.toLocaleDateString(
      "es-CO",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone:
          "America/Bogota"
      }
    );

  document.getElementById(
    "fechaSorteo"
  ).textContent =
    fechaTexto;

  document.getElementById(
    "detalleSorteo"
  ).textContent =
    `${rifa.loteria} · Sorteo #${rifa.numero_sorteo}`;

  document.getElementById(
    "textoFechaPlantilla"
  ).innerHTML =
    `Sorteo: <strong>${fechaTexto}</strong>.`;
}

function renderKPIs() {
  const kpis =
    datosPublicos.kpis;

  document.getElementById(
    "kpiTotal"
  ).textContent =
    dinero(
      kpis.totalRecaudado
    );

  document.getElementById(
    "kpiPendientes"
  ).textContent =
    kpis.pendientes;

  document.getElementById(
    "kpiPagadas"
  ).textContent =
    kpis.pagadas;

  document.getElementById(
    "kpiVendidas"
  ).textContent =
    kpis.vendidas;

  document.getElementById(
    "kpiDisponibles"
  ).textContent =
    kpis.disponibles;

  document.getElementById(
    "kpiDineroPendiente"
  ).textContent =
    dinero(
      kpis.dineroPendiente
    );

  document.getElementById(
    "kpiAyudas"
  ).textContent =
    dinero(
      kpis.ayudas
    );
}

function buscarBoleta(
  numero
) {
  return (
    datosPublicos
      ?.boletas
      ?.find(
        boleta =>
          boleta.numero ===
          numero
      ) ||
    null
  );
}

function renderTablero() {
  gridNumeros.innerHTML =
    "";

  for (
    let i = 0;
    i < 100;
    i++
  ) {
    const numero =
      formatearNumero(i);

    const boleta =
      buscarBoleta(numero);

    const celda =
      document.createElement(
        "div"
      );

    celda.className =
      "numero-celda";

    if (boleta) {
      celda.classList.add(
        boleta.pagado
          ? "pagado"
          : "pendiente"
      );
    }

    celda.innerHTML = `
      <span class="numero-texto">
        ${numero}
      </span>
    `;

    celda.addEventListener(
      "click",
      () => {
        abrirNumero(
          numero,
          boleta
        );
      }
    );

    gridNumeros.appendChild(
      celda
    );
  }
}

function abrirNumero(
  numero,
  boleta
) {
  const contenido =
    document.getElementById(
      "contenidoNumero"
    );

  if (!boleta) {
    contenido.innerHTML = `
      <span class="etiqueta">
        NÚMERO
      </span>

      <h2>${numero}</h2>

      <p>
        Este número está disponible.
      </p>
    `;
  } else {
    contenido.innerHTML = `
      <span class="etiqueta">
        NÚMERO
      </span>

      <h2>${numero}</h2>

      <p>
        Este número ya fue vendido.
      </p>

      <p>
        Estado:
        <strong>
          ${
            boleta.pagado
              ? "Pagado"
              : "Pendiente"
          }
        </strong>
      </p>
    `;
  }

  document
    .getElementById(
      "modalNumero"
    )
    .classList
    .remove(
      "oculto"
    );
}

function renderResultado() {
  const rifa =
    datosPublicos.rifa;

  const estado =
    document.getElementById(
      "estadoResultado"
    );

  const numero =
    document.getElementById(
      "numeroGanador"
    );

  if (
    !rifa.numero_ganador
  ) {
    estado.textContent =
      "El sorteo todavía no se ha realizado.";

    numero
      .classList
      .add(
        "oculto"
      );

    return;
  }

  estado.textContent =
    "Número ganador de la rifa:";

  numero.textContent =
    rifa.numero_ganador;

  numero
    .classList
    .remove(
      "oculto"
    );
}

// ==========================================
// LOGIN
// ==========================================

async function comprobarSesion() {
  try {
    const sesion =
      await api(
        "/api/session"
      );

    esAdmin =
      sesion.admin;

    if (esAdmin) {
      await mostrarPanelAdmin();
    }
  } catch (error) {
    console.error(error);
  }
}

document
  .getElementById(
    "btnAdministrar"
  )
  .addEventListener(
    "click",
    async () => {
      if (esAdmin) {
        await mostrarPanelAdmin();

        panelAdmin
          .scrollIntoView({
            behavior:
              "smooth"
          });
      } else {
        modalLogin
          .classList
          .remove(
            "oculto"
          );
      }
    }
  );

document
  .getElementById(
    "formLogin"
  )
  .addEventListener(
    "submit",
    async event => {
      event.preventDefault();

      const usuario =
        document
          .getElementById(
            "loginUsuario"
          )
          .value;

      const password =
        document
          .getElementById(
            "loginPassword"
          )
          .value;

      const loginError =
        document.getElementById(
          "loginError"
        );

      loginError.textContent =
        "";

      try {
        await api(
          "/api/login",
          {
            method:
              "POST",

            body:
              JSON.stringify({
                usuario,
                password
              })
          }
        );

        esAdmin = true;

        modalLogin
          .classList
          .add(
            "oculto"
          );

        document
          .getElementById(
            "formLogin"
          )
          .reset();

        await mostrarPanelAdmin();
      } catch (error) {
        loginError.textContent =
          error.message;
      }
    }
  );

document
  .getElementById(
    "cerrarLogin"
  )
  .addEventListener(
    "click",
    () => {
      modalLogin
        .classList
        .add(
          "oculto"
        );
    }
  );

document
  .getElementById(
    "btnCerrarSesion"
  )
  .addEventListener(
    "click",
    async () => {
      await api(
        "/api/logout",
        {
          method:
            "POST"
        }
      );

      esAdmin = false;
      datosAdmin = null;

      panelAdmin
        .classList
        .add(
          "oculto"
        );
    }
  );

// ==========================================
// ADMIN
// ==========================================

async function mostrarPanelAdmin() {
  panelAdmin
    .classList
    .remove(
      "oculto"
    );

  await cargarAdmin();
}

async function cargarAdmin() {
  try {
    datosAdmin =
      await api(
        "/api/admin/datos"
      );

    renderSelects();
    renderTablaAdmin();
    renderAyudas();
    renderGanadorAdmin();
  } catch (error) {
    console.error(error);
  }
}

function numerosVendidos() {
  return (
    datosPublicos
      ?.boletas
      ?.map(
        boleta =>
          boleta.numero
      ) ||
    []
  );
}

function renderSelects() {
  const vendidos =
    numerosVendidos();

  numero1.innerHTML =
    `<option value="">Seleccionar</option>`;

  numero2.innerHTML =
    `<option value="">Seleccionar</option>`;

  for (
    let i = 0;
    i < 100;
    i++
  ) {
    const numero =
      formatearNumero(i);

    if (
      !vendidos.includes(
        numero
      )
    ) {
      const opcion =
        `<option value="${numero}">${numero}</option>`;

      numero1.innerHTML +=
        opcion;

      numero2.innerHTML +=
        opcion;
    }
  }
}

oferta.addEventListener(
  "change",
  () => {
    if (
      oferta.checked
    ) {
      contenedorNumero2
        .classList
        .remove(
          "oculto"
        );

      numero2.required =
        true;

      valorRegistro.textContent =
        dinero(
          20000
        );
    } else {
      contenedorNumero2
        .classList
        .add(
          "oculto"
        );

      numero2.required =
        false;

      numero2.value =
        "";

      valorRegistro.textContent =
        dinero(
          15000
        );
    }
  }
);

// ==========================================
// REGISTRAR
// ==========================================

document
  .getElementById(
    "formRifa"
  )
  .addEventListener(
    "submit",
    async event => {
      event.preventDefault();

      const nombre =
        document
          .getElementById(
            "nombre"
          )
          .value
          .trim();

      const telefono =
        document
          .getElementById(
            "telefono"
          )
          .value
          .trim();

      const observacion =
        document
          .getElementById(
            "observacion"
          )
          .value
          .trim();

      const primerNumero =
        numero1.value;

      const segundoNumero =
        numero2.value;

      const esOferta =
        oferta.checked;

      const pagado =
        document
          .getElementById(
            "pagado"
          )
          .checked;

      if (
        esOferta &&
        primerNumero ===
          segundoNumero
      ) {
        alert(
          "Selecciona números diferentes."
        );

        return;
      }

      const numeros =
        esOferta
          ? [
              primerNumero,
              segundoNumero
            ]
          : [
              primerNumero
            ];

      try {
        await api(
          "/api/admin/registro",
          {
            method:
              "POST",

            body:
              JSON.stringify({
                nombre,
                telefono,
                numeros,
                oferta:
                  esOferta,
                pagado,
                observacion
              })
          }
        );

        alert(
          "Registro guardado correctamente."
        );

        document
          .getElementById(
            "formRifa"
          )
          .reset();

        contenedorNumero2
          .classList
          .add(
            "oculto"
          );

        await recargarTodo();
      } catch (error) {
        alert(
          error.message
        );
      }
    }
  );

// ==========================================
// AYUDAS
// ==========================================

document
  .getElementById(
    "formAyuda"
  )
  .addEventListener(
    "submit",
    async event => {
      event.preventDefault();

      const input =
        document.getElementById(
          "valorAyuda"
        );

      try {
        await api(
          "/api/admin/ayudas",
          {
            method:
              "POST",

            body:
              JSON.stringify({
                valor:
                  Number(
                    input.value
                  )
              })
          }
        );

        input.value =
          "";

        await recargarTodo();
      } catch (error) {
        alert(
          error.message
        );
      }
    }
  );

// ==========================================
// COMPRADORES
// ==========================================

function compradoresConBoletas() {
  if (!datosAdmin) {
    return [];
  }

  return datosAdmin
    .compradores
    .map(
      comprador => ({
        ...comprador,

        boletas:
          datosAdmin
            .boletas
            .filter(
              boleta =>
                String(
                  boleta.comprador_id
                ) ===
                String(
                  comprador.id
                )
            )
      })
    );
}

function renderTablaAdmin() {
  tablaRegistros.innerHTML =
    "";

  compradoresConBoletas()
    .forEach(
      registro => {
        const numeros =
          registro.boletas
            .map(
              boleta =>
                boleta.numero
            )
            .join(", ");

        const valor =
          registro.boletas
            .reduce(
              (
                total,
                boleta
              ) =>
                total +
                Number(
                  boleta.valor
                ),
              0
            );

        const pagado =
          registro.boletas
            .length >
              0 &&
          registro.boletas
            .every(
              boleta =>
                boleta.pagado
            );

        const fila =
          document.createElement(
            "tr"
          );

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
              ${
                pagado
                  ? "badge-pagado"
                  : "badge-pendiente"
              }
            ">
              ${
                pagado
                  ? "Pagado"
                  : "Pendiente"
              }
            </span>
          </td>

          <td>

            <div class="acciones">

              <button
                class="btn-tabla btn-pagar"
                onclick="cambiarPago(${registro.id},${!pagado})"
              >
                ${
                  pagado
                    ? "Pendiente"
                    : "Pagar"
                }
              </button>

              <button
                class="btn-tabla btn-editar"
                onclick="editarComprador(${registro.id})"
              >
                Editar
              </button>

              <button
                class="btn-tabla btn-whatsapp"
                onclick="contactarComprador(${registro.id})"
              >
                WhatsApp
              </button>

              <button
                class="btn-tabla btn-eliminar"
                onclick="eliminarComprador(${registro.id})"
              >
                Eliminar
              </button>

            </div>

          </td>
        `;

        tablaRegistros
          .appendChild(
            fila
          );
      }
    );
}

window.cambiarPago =
  async function(
    id,
    pagado
  ) {
    await api(
      `/api/admin/compradores/${id}/pago`,
      {
        method:
          "PATCH",

        body:
          JSON.stringify({
            pagado
          })
      }
    );

    await recargarTodo();
  };

window.editarComprador =
  async function(id) {
    const comprador =
      datosAdmin
        .compradores
        .find(
          comprador =>
            String(
              comprador.id
            ) ===
            String(id)
        );

    if (!comprador) {
      return;
    }

    const nombre =
      prompt(
        "Nombre:",
        comprador.nombre
      );

    if (
      nombre ===
      null
    ) {
      return;
    }

    const telefono =
      prompt(
        "Teléfono:",
        comprador.telefono
      );

    if (
      telefono ===
      null
    ) {
      return;
    }

    const observacion =
      prompt(
        "Observación:",
        comprador.observacion ||
        ""
      );

    if (
      observacion ===
      null
    ) {
      return;
    }

    await api(
      `/api/admin/compradores/${id}`,
      {
        method:
          "PATCH",

        body:
          JSON.stringify({
            nombre,
            telefono,
            observacion
          })
      }
    );

    await recargarTodo();
  };

// ==========================================
// GENERAR MENSAJES
// ==========================================

function crearMensajePendiente(
  comprador
) {
  const pendientes =
    comprador.boletas
      .filter(
        boleta =>
          !boleta.pagado
      );

  const numeros =
    pendientes
      .map(
        boleta =>
          boleta.numero
      )
      .join(", ");

  const valor =
    pendientes
      .reduce(
        (
          total,
          boleta
        ) =>
          total +
          Number(
            boleta.valor ||
            0
          ),
        0
      );

  return `Hola ${comprador.nombre}

Se acerca el día de la rifa.

Recuerda que para participar en el sorteo tus boletas deben estar pagadas.

Actualmente tienes ${pendientes.length} boleta(s) pendiente(s).

Número(s) pendiente(s): ${numeros}

Valor pendiente por pagar: ${dinero(valor)}

Puedes realizar el pago por Llave a cualquiera de estas opciones:

Llave: ${LLAVE_PAGO}
Número: ${NUMERO_PAGO}

Cuando realices el pago, responde este mensaje con el comprobante para actualizar tus boletas como pagadas.

Puedes consultar el estado de la rifa y posteriormente el resultado en:

${PAGINA_RIFA}

Muchas gracias por participar y mucha suerte.`;
}

function crearMensajePagado(
  comprador
) {
  const numeros =
    comprador.boletas
      .map(
        boleta =>
          boleta.numero
      )
      .join(", ");

  return `Hola ${comprador.nombre}

Ya falta muy poco para el sorteo.

Tus boletas están pagadas y listas para participar.

Tus números son: ${numeros}

Puedes consultar el estado de la rifa y ver el resultado cuando se publique en:

${PAGINA_RIFA}

Muchas gracias por participar y mucha suerte con tus números.`;
}

// ==========================================
// WHATSAPP INDIVIDUAL
// ==========================================

window.contactarComprador =
  function(id) {
    const comprador =
      compradoresConBoletas()
        .find(
          comprador =>
            String(
              comprador.id
            ) ===
            String(id)
        );

    if (!comprador) {
      return;
    }

    const tienePendientes =
      comprador.boletas
        .some(
          boleta =>
            !boleta.pagado
        );

    const mensaje =
      tienePendientes
        ? crearMensajePendiente(
            comprador
          )
        : crearMensajePagado(
            comprador
          );

    const telefono =
      telefonoWhatsApp(
        comprador.telefono
      );

    window.open(
      `https://wa.me/${telefono}?text=${encodeURIComponent(
        mensaje
      )}`,
      "_blank"
    );
  };

// ==========================================
// MASIVO - PREPARAR TODOS
// ==========================================

function prepararMasivo(
  tipo
) {
  const compradores =
    compradoresConBoletas();

  tipoMasivoActual =
    tipo;

  if (
    tipo ===
    "pendientes"
  ) {
    colaMasiva =
      compradores
        .filter(
          comprador =>
            comprador.boletas
              .some(
                boleta =>
                  !boleta.pagado
              )
        )
        .map(
          comprador => ({
            comprador,

            mensaje:
              crearMensajePendiente(
                comprador
              ),

            incluir:
              true
          })
        );

    tituloMasivo.textContent =
      "Revisar pendientes por pagar";

    textoConfirmacionMasivo.textContent =
      "Confirmo que revisé todos los mensajes de los pendientes por pagar.";
  } else {
    colaMasiva =
      compradores
        .filter(
          comprador =>
            comprador.boletas
              .length >
              0 &&
            comprador.boletas
              .every(
                boleta =>
                  boleta.pagado
              )
        )
        .map(
          comprador => ({
            comprador,

            mensaje:
              crearMensajePagado(
                comprador
              ),

            incluir:
              true
          })
        );

    tituloMasivo.textContent =
      "Revisar compradores pagados";

    textoConfirmacionMasivo.textContent =
      "Confirmo que revisé todos los mensajes de los compradores pagados.";
  }

  if (
    colaMasiva.length ===
    0
  ) {
    alert(
      tipo ===
        "pendientes"
        ? "No hay compradores con pagos pendientes."
        : "No hay compradores pagados."
    );

    return;
  }

  checkMensajesRevisados.checked =
    false;

  renderMensajesMasivos();

  modalMasivo
    .classList
    .remove(
      "oculto"
    );
}

// ==========================================
// RENDER TODOS LOS MENSAJES
// ==========================================

function renderMensajesMasivos() {
  listaMensajesMasivos.innerHTML =
    "";

  resumenMasivo.textContent =
    `Se encontraron ${colaMasiva.length} personas. Revisa todos los mensajes antes de continuar.`;

  colaMasiva.forEach(
    (
      item,
      indice
    ) => {
      const comprador =
        item.comprador;

      const pendientes =
        comprador.boletas
          .filter(
            boleta =>
              !boleta.pagado
          );

      const numeros =
        comprador.boletas
          .map(
            boleta =>
              boleta.numero
          )
          .join(", ");

      const valorPendiente =
        pendientes.reduce(
          (
            total,
            boleta
          ) =>
            total +
            Number(
              boleta.valor ||
              0
            ),
          0
        );

      const card =
        document.createElement(
          "div"
        );

      card.className =
        "mensaje-masivo-card";

      card.dataset.indice =
        indice;

      card.innerHTML = `
        <div class="mensaje-masivo-superior">

          <div class="mensaje-masivo-info">

            <h3>
              ${indice + 1}. ${comprador.nombre}
            </h3>

            <p>
              WhatsApp:
              ${comprador.telefono}
            </p>

            <p>
              Número(s):
              ${numeros}
            </p>

            ${
              pendientes.length >
              0
                ? `
                  <div class="mensaje-masivo-extra">

                    <strong>
                      Pendiente:
                    </strong>

                    ${pendientes.length}
                    boleta(s) ·
                    ${dinero(
                      valorPendiente
                    )}

                  </div>
                `
                : `
                  <div class="mensaje-masivo-extra">

                    <strong>
                      Estado:
                    </strong>

                    Todo pagado

                  </div>
                `
            }

          </div>

          <label class="excluir-destinatario">

            <input
              type="checkbox"
              class="check-incluir-masivo"
              data-indice="${indice}"
              checked
            >

            Incluir

          </label>

        </div>

        <label>
          Mensaje
        </label>

        <textarea
          class="texto-mensaje-masivo"
          data-indice="${indice}"
          rows="12"
        ></textarea>
      `;

      listaMensajesMasivos
        .appendChild(
          card
        );

      card
        .querySelector(
          ".texto-mensaje-masivo"
        )
        .value =
          item.mensaje;
    }
  );

  document
    .querySelectorAll(
      ".check-incluir-masivo"
    )
    .forEach(
      check => {
        check.addEventListener(
          "change",
          event => {
            const indice =
              Number(
                event.target.dataset.indice
              );

            colaMasiva[
              indice
            ].incluir =
              event.target.checked;

            const card =
              event.target.closest(
                ".mensaje-masivo-card"
              );

            card.classList.toggle(
              "excluido",
              !event.target.checked
            );

            checkMensajesRevisados.checked =
              false;

            actualizarResumenMasivo();
          }
        );
      }
    );

  document
    .querySelectorAll(
      ".texto-mensaje-masivo"
    )
    .forEach(
      textarea => {
        textarea.addEventListener(
          "input",
          event => {
            const indice =
              Number(
                event.target.dataset.indice
              );

            colaMasiva[
              indice
            ].mensaje =
              event.target.value;

            checkMensajesRevisados.checked =
              false;
          }
        );
      }
    );

  actualizarResumenMasivo();
}

// ==========================================
// RESUMEN MASIVO
// ==========================================

function actualizarResumenMasivo() {
  const seleccionados =
    colaMasiva.filter(
      item =>
        item.incluir
    );

  const excluidos =
    colaMasiva.length -
    seleccionados.length;

  resumenSeleccionados.textContent =
    `${seleccionados.length} mensajes serán abiertos en WhatsApp. ${excluidos} excluido(s).`;
}

// ==========================================
// BOTONES MASIVOS
// ==========================================

document
  .getElementById(
    "btnMasivoPendientes"
  )
  .addEventListener(
    "click",
    () => {
      prepararMasivo(
        "pendientes"
      );
    }
  );

document
  .getElementById(
    "btnMasivoPagados"
  )
  .addEventListener(
    "click",
    () => {
      prepararMasivo(
        "pagados"
      );
    }
  );

// ==========================================
// ABRIR TODOS LOS WHATSAPP
// ==========================================

document
  .getElementById(
    "btnAbrirTodosWhatsApp"
  )
  .addEventListener(
    "click",
    () => {
      const seleccionados =
        colaMasiva.filter(
          item =>
            item.incluir
        );

      if (
        seleccionados.length ===
        0
      ) {
        alert(
          "No hay destinatarios seleccionados."
        );

        return;
      }

      if (
        !checkMensajesRevisados.checked
      ) {
        alert(
          "Primero debes confirmar que revisaste todos los mensajes."
        );

        return;
      }

      const confirmar =
        confirm(
`ÚLTIMA CONFIRMACIÓN

Vas a abrir ${seleccionados.length} conversaciones de WhatsApp.

Tipo:
${
  tipoMasivoActual ===
  "pendientes"
    ? "Pendientes por pagar"
    : "Compradores pagados"
}

¿Confirmas que revisaste todos los mensajes?`
        );

      if (!confirmar) {
        return;
      }

      let abiertas = 0;
      let bloqueadas = 0;
      let invalidas = 0;

      seleccionados.forEach(
        item => {
          const telefono =
            telefonoWhatsApp(
              item
                .comprador
                .telefono
            );

          if (
            !telefono ||
            telefono.length <
              10
          ) {
            invalidas++;
            return;
          }

          const url =
            `https://wa.me/${telefono}?text=${encodeURIComponent(
              item.mensaje
            )}`;

          const ventana =
            window.open(
              url,
              "_blank"
            );

          if (ventana) {
            abiertas++;
          } else {
            bloqueadas++;
          }
        }
      );

      if (
        bloqueadas >
        0
      ) {
        alert(
`Se intentaron abrir los mensajes.

Abiertos: ${abiertas}
Bloqueados por el navegador: ${bloqueadas}
Teléfonos inválidos: ${invalidas}

Permite las ventanas emergentes de esta página y vuelve a intentarlo para los que falten.`
        );
      } else {
        alert(
`Listo.

Se abrieron ${abiertas} conversaciones de WhatsApp.

Teléfonos inválidos: ${invalidas}

Ahora solo debes revisar cada pestaña y pulsar Enviar en WhatsApp.`
        );
      }
    }
  );

document
  .getElementById(
    "cerrarMasivo"
  )
  .addEventListener(
    "click",
    () => {
      modalMasivo
        .classList
        .add(
          "oculto"
        );
    }
  );

// ==========================================
// ELIMINAR COMPRADOR
// ==========================================

window.eliminarComprador =
  async function(id) {
    const comprador =
      datosAdmin
        .compradores
        .find(
          comprador =>
            String(
              comprador.id
            ) ===
            String(id)
        );

    if (!comprador) {
      return;
    }

    if (
      !confirm(
        `¿Eliminar a ${comprador.nombre} y liberar sus números?`
      )
    ) {
      return;
    }

    await api(
      `/api/admin/compradores/${id}`,
      {
        method:
          "DELETE"
      }
    );

    await recargarTodo();
  };

// ==========================================
// AYUDAS
// ==========================================

function renderAyudas() {
  const contenedor =
    document.getElementById(
      "listaAyudas"
    );

  contenedor.innerHTML =
    "";

  if (
    datosAdmin.ayudas.length ===
    0
  ) {
    contenedor.innerHTML =
      `<p class="texto-suave">Todavía no hay ayudas registradas.</p>`;

    return;
  }

  datosAdmin.ayudas.forEach(
    ayuda => {
      const item =
        document.createElement(
          "div"
        );

      item.className =
        "ayuda-item";

      item.innerHTML = `
        <div>

          <strong>
            ${dinero(
              ayuda.valor
            )}
          </strong>

          <small>
            ${new Date(
              ayuda.fecha_registro
            ).toLocaleString(
              "es-CO"
            )}
          </small>

        </div>

        <button
          class="btn-tabla btn-eliminar"
          onclick="eliminarAyuda(${ayuda.id})"
        >
          Eliminar
        </button>
      `;

      contenedor.appendChild(
        item
      );
    }
  );
}

window.eliminarAyuda =
  async function(id) {
    if (
      !confirm(
        "¿Eliminar esta ayuda?"
      )
    ) {
      return;
    }

    await api(
      `/api/admin/ayudas/${id}`,
      {
        method:
          "DELETE"
      }
    );

    await recargarTodo();
  };

// ==========================================
// RESULTADO MANUAL
// ==========================================

document
  .getElementById(
    "formResultado"
  )
  .addEventListener(
    "submit",
    async event => {
      event.preventDefault();

      const input =
        document.getElementById(
          "resultadoManual"
        );

      if (
        !confirm(
          `¿Registrar ${input.value} como resultado?`
        )
      ) {
        return;
      }

      await api(
        "/api/admin/resultado",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              numero:
                input.value
            })
        }
      );

      input.value =
        "";

      await recargarTodo();
    }
  );

// ==========================================
// GANADOR
// ==========================================

function obtenerCompradorPorNumero(
  numero
) {
  if (!datosAdmin) {
    return null;
  }

  const boleta =
    datosAdmin
      .boletas
      .find(
        boleta =>
          boleta.numero ===
          numero
      );

  if (!boleta) {
    return null;
  }

  const comprador =
    datosAdmin
      .compradores
      .find(
        comprador =>
          String(
            comprador.id
          ) ===
          String(
            boleta.comprador_id
          )
      );

  if (!comprador) {
    return null;
  }

  return {
    comprador,
    boleta
  };
}

function renderGanadorAdmin() {
  const contenedor =
    document.getElementById(
      "ganadorAdmin"
    );

  const numero =
    datosAdmin
      ?.rifa
      ?.numero_ganador;

  if (!numero) {
    contenedor
      .classList
      .add(
        "oculto"
      );

    return;
  }

  const datosGanador =
    obtenerCompradorPorNumero(
      numero
    );

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

    contenedor
      .classList
      .remove(
        "oculto"
      );

    return;
  }

  const {
    comprador,
    boleta
  } =
    datosGanador;

  contenedor.innerHTML = `
    <span class="etiqueta">
      GANADOR
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
        Estado:
        <strong>
          ${
            boleta.pagado
              ? "Pagada"
              : "Pendiente"
          }
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
        class="btn-principal"
        onclick="abrirConfirmacionGanador()"
      >
        Notificar ganador
      </button>

    </div>
  `;

  contenedor
    .classList
    .remove(
      "oculto"
    );
}

window.abrirConfirmacionGanador =
  function() {
    selectorGanador.innerHTML =
      "";

    datosAdmin.boletas
      .forEach(
        boleta => {
          const comprador =
            datosAdmin
              .compradores
              .find(
                comprador =>
                  String(
                    comprador.id
                  ) ===
                  String(
                    boleta.comprador_id
                  )
              );

          if (!comprador) {
            return;
          }

          selectorGanador.innerHTML +=
            `<option value="${boleta.numero}">
              ${boleta.numero} — ${comprador.nombre}
            </option>`;
        }
      );

    if (
      datosAdmin
        .rifa
        .numero_ganador
    ) {
      selectorGanador.value =
        datosAdmin
          .rifa
          .numero_ganador;
    }

    checkConfirmarGanador.checked =
      false;

    actualizarDatosConfirmacionGanador();

    modalConfirmarGanador
      .classList
      .remove(
        "oculto"
      );
  };

function actualizarDatosConfirmacionGanador() {
  const numero =
    selectorGanador.value;

  const datos =
    obtenerCompradorPorNumero(
      numero
    );

  if (!datos) {
    return;
  }

  nombreGanadorConfirmacion.value =
    datos.comprador.nombre;

  telefonoGanadorConfirmacion.value =
    datos.comprador.telefono;

  premioGanadorConfirmacion.value =
    dinero(
      datosAdmin.rifa.premio
    );

  mensajeGanadorConfirmacion.value =
`Felicitaciones, ${datos.comprador.nombre}

Has sido el ganador de nuestra Gran Rifa con el número ${numero}.

Tu premio es de ${dinero(
  datosAdmin.rifa.premio
)}.

Puedes consultar el resultado aquí:

${PAGINA_RIFA}

Responde este mensaje o escríbenos al ${TELEFONO_RIFA} para coordinar la entrega de tu premio.`;
}

selectorGanador.addEventListener(
  "change",
  () => {
    checkConfirmarGanador.checked =
      false;

    actualizarDatosConfirmacionGanador();
  }
);

document
  .getElementById(
    "btnGuardarGanador"
  )
  .addEventListener(
    "click",
    async () => {
      if (
        !checkConfirmarGanador.checked
      ) {
        alert(
          "Confirma que revisaste los datos."
        );

        return;
      }

      await api(
        "/api/admin/resultado",
        {
          method:
            "POST",

          body:
            JSON.stringify({
              numero:
                selectorGanador.value
            })
        }
      );

      await recargarTodo();

      modalConfirmarGanador
        .classList
        .add(
          "oculto"
        );
    }
  );

document
  .getElementById(
    "btnNotificarGanador"
  )
  .addEventListener(
    "click",
    async () => {
      if (
        !checkConfirmarGanador.checked
      ) {
        alert(
          "Confirma que revisaste los datos."
        );

        return;
      }

      const telefono =
        telefonoWhatsApp(
          telefonoGanadorConfirmacion.value
        );

      const mensaje =
        mensajeGanadorConfirmacion.value;

      window.open(
        `https://wa.me/${telefono}?text=${encodeURIComponent(
          mensaje
        )}`,
        "_blank"
      );
    }
  );

document
  .getElementById(
    "cerrarConfirmarGanador"
  )
  .addEventListener(
    "click",
    () => {
      modalConfirmarGanador
        .classList
        .add(
          "oculto"
        );
    }
  );

// ==========================================
// MODALES
// ==========================================

document
  .getElementById(
    "cerrarNumero"
  )
  .addEventListener(
    "click",
    () => {
      document
        .getElementById(
          "modalNumero"
        )
        .classList
        .add(
          "oculto"
        );
    }
  );

document
  .getElementById(
    "cerrarMasivo"
  )
  .addEventListener(
    "click",
    () => {
      modalMasivo
        .classList
        .add(
          "oculto"
        );
    }
  );

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
// INICIAR
// ==========================================

async function iniciar() {
  await cargarPublico();
  await comprobarSesion();
}

iniciar();

setInterval(
  cargarPublico,
  60 * 1000
);