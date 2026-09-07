import { useEffect, useState } from "react";

import Calendario from "../components/Calendario.jsx";
import ResumenTurnos from "../components/ResumenTurnos.jsx";

import {
  obtenerTurnos,
  crearTurno,
  actualizarTurno,
  eliminarTurno as eliminarTurnoSupabase,
} from "../services/turnosService";

import {
  crearNotificacionHorario,
  enviarNotificacionPush,
} from "../services/notificacionesService";


/* =====================================================
   CONTROL DE PUSH AGRUPADOS

   Evita enviar una notificación Push por cada turno.

   Si se asignan varios turnos al mismo trabajador
   dentro de 5 minutos, solamente se envía una Push.

   La campanita de la aplicación sigue funcionando
   normalmente.
===================================================== */

const TIEMPO_AGRUPACION_PUSH = 5 * 60 * 1000;

const ultimoPushPorTrabajador = new Map();


/* =====================================================
   COMPROBAR SI SE PUEDE ENVIAR PUSH
===================================================== */

const puedeEnviarPush = (userId) => {
  if (!userId) {
    return false;
  }

  const clave = String(userId);

  const ultimoEnvio =
    ultimoPushPorTrabajador.get(clave);

  if (!ultimoEnvio) {
    return true;
  }

  return (
    Date.now() - ultimoEnvio >=
    TIEMPO_AGRUPACION_PUSH
  );
};


/* =====================================================
   REGISTRAR QUE SE ENVIÓ PUSH
===================================================== */

const registrarEnvioPush = (userId) => {
  if (!userId) {
    return;
  }

  ultimoPushPorTrabajador.set(
    String(userId),
    Date.now()
  );
};


/* =====================================================
   COMPONENTE
===================================================== */

function CalendarioPage({
  trabajadores = [],
  turnos = {},
  setTurnos,
  esAdministrador = false,
}) {

  /* =====================================================
     FECHA INICIAL DEL CALENDARIO
  ===================================================== */

  const obtenerLunesActual = () => {
    const fecha = new Date();

    fecha.setHours(0, 0, 0, 0);

    const diaSemana =
      fecha.getDay();

    const diferencia =
      diaSemana === 0
        ? -6
        : 1 - diaSemana;

    fecha.setDate(
      fecha.getDate() + diferencia
    );

    return fecha;
  };


  const [fechaInicio, setFechaInicio] =
    useState(obtenerLunesActual);


  /* =====================================================
     ESTADOS
  ===================================================== */

  const [fechaSeleccionada, setFechaSeleccionada] =
    useState(null);

  const [trabajadorSeleccionado, setTrabajadorSeleccionado] =
    useState(null);

  const [cargandoTurnos, setCargandoTurnos] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);


  /* =====================================================
     CONVERTIR FECHA
  ===================================================== */

  const convertirFecha = (fecha) => {

    if (typeof fecha === "string") {
      return fecha;
    }

    if (!(fecha instanceof Date)) {
      return fecha;
    }

    return `${fecha.getFullYear()}-${String(
      fecha.getMonth() + 1
    ).padStart(2, "0")}-${String(
      fecha.getDate()
    ).padStart(2, "0")}`;
  };


  /* =====================================================
     CARGAR TURNOS DESDE SUPABASE
  ===================================================== */

  useEffect(() => {

    async function cargarTurnos() {

      try {

        setCargandoTurnos(true);

        const datos =
          await obtenerTurnos();

        console.log(
          "TURNOS DESDE SUPABASE:",
          datos
        );

        const turnosOrganizados = {};

        datos.forEach((turno) => {

          if (
            !turnosOrganizados[
              turno.fecha
            ]
          ) {
            turnosOrganizados[
              turno.fecha
            ] = {};
          }

          turnosOrganizados[
            turno.fecha
          ][
            turno.trabajador_id
          ] = turno.tipo;

        });

        setTurnos(
          turnosOrganizados
        );

      } catch (error) {

        console.error(
          "Error cargando turnos desde Supabase:",
          error
        );

        alert(
          "No se pudieron cargar los turnos."
        );

      } finally {

        setCargandoTurnos(false);

      }
    }

    cargarTurnos();

  }, [setTurnos]);


  /* =====================================================
     SELECCIONAR TURNO
  ===================================================== */

  const seleccionarTurno = (
    fecha,
    trabajador
  ) => {

    if (!esAdministrador) {
      return;
    }

    setFechaSeleccionada(fecha);

    setTrabajadorSeleccionado(
      trabajador
    );
  };


  /* =====================================================
     GUARDAR / ACTUALIZAR TURNO
  ===================================================== */

  const guardarTurno = async (
    fecha,
    trabajadorId,
    tipo
  ) => {

    if (!esAdministrador) {
      return;
    }

    const fechaKey =
      convertirFecha(fecha);

    try {

      setGuardando(true);

      console.log(
        "Guardando turno:",
        {
          trabajador_id:
            trabajadorId,

          fecha:
            fechaKey,

          tipo,
        }
      );


      /* =================================================
         BUSCAR SI YA EXISTE EL TURNO
      ================================================= */

      const turnosExistentes =
        await obtenerTurnos();

      const turnoExistente =
        turnosExistentes.find(
          (turno) =>
            String(
              turno.trabajador_id
            ) ===
              String(
                trabajadorId
              ) &&
            turno.fecha ===
              fechaKey
        );


      /* =================================================
         COMPROBAR SI ES EL MISMO TURNO
      ================================================= */

      const eraMismoTurno =
        Boolean(
          turnoExistente &&
          turnoExistente.tipo === tipo
        );


      /* =================================================
         CREAR O ACTUALIZAR TURNO
      ================================================= */

      if (turnoExistente) {

        console.log(
          "🔄 Actualizando turno existente:",
          turnoExistente.id
        );

        await actualizarTurno(
          turnoExistente.id,
          {
            tipo,
          }
        );

      } else {

        console.log(
          "➕ Creando nuevo turno"
        );

        await crearTurno({
          trabajador_id:
            trabajadorId,

          fecha:
            fechaKey,

          tipo,
        });

      }


      /* =================================================
         NOTIFICACIONES

         LA CAMPANITA SE MANTIENE.

         EL PUSH SE AGRUPA POR TRABAJADOR DURANTE
         5 MINUTOS.
      ================================================= */

      if (!eraMismoTurno) {

        const trabajador =
          trabajadores.find(
            (item) =>
              String(item.id) ===
              String(trabajadorId)
          );


        /* =================================================
           COMPROBAR TRABAJADOR
        ================================================= */

        if (!trabajador) {

          console.error(
            "❌ No se encontró el trabajador seleccionado:",
            trabajadorId
          );

        } else if (
          !trabajador.user_id
        ) {

          console.error(
            "❌ El trabajador no tiene user_id:",
            trabajador
          );

        } else {

          console.log(
            "👤 Trabajador para notificación:",
            {
              id:
                trabajador.id,

              nombre:
                trabajador.nombre,

              user_id:
                trabajador.user_id,
            }
          );


          /* =============================================
             🔔 NOTIFICACIÓN DE LA CAMPANA

             ESTA PARTE NO SE MODIFICA.
          ============================================= */

          try {

            await crearNotificacionHorario({

              trabajadorId:
                trabajador.user_id,

              fechaTurno:
                fechaKey,

              tipo:
                tipo,

              nombreTrabajador:
                trabajador.nombre,

            });

            console.log(
              "✅ Notificación de campana creada/actualizada correctamente."
            );

          } catch (
            errorNotificacion
          ) {

            console.error(
              "⚠️ El turno se guardó, pero no se pudo crear la notificación de campana:",
              errorNotificacion
            );

          }


          /* =============================================
             📱 NOTIFICACIÓN PUSH AGRUPADA

             NO SE ENVÍA UNA PUSH POR CADA TURNO.

             El mismo trabajador recibirá como máximo
             una Push cada 5 minutos.
          ============================================= */

          const userId =
            trabajador.user_id;

          if (
            puedeEnviarPush(
              userId
            )
          ) {

            try {

              registrarEnvioPush(
                userId
              );


              const resultadoPush =
                await enviarNotificacionPush({

                  userId:
                    userId,

                  title:
                    "🔔 Torre Mare",

                  message:
                    "Tienes nuevos cambios en tus turnos. Revisa el calendario.",

                  url:
                    "/",

                });


              console.log(
                "✅ Push agrupado enviado correctamente:",
                resultadoPush
              );

            } catch (
              errorPush
            ) {

              console.error(
                "⚠️ El turno se guardó, pero no se pudo enviar el Push:",
                errorPush
              );


              /*
                Si el Push falla, permitimos que el
                siguiente intento vuelva a enviarlo.
              */

              ultimoPushPorTrabajador.delete(
                String(userId)
              );

            }

          } else {

            console.log(
              "🔕 Push agrupado omitido: ya se envió una Push reciente a este trabajador."
            );

          }


          console.log(
            "🔔 Proceso de notificación terminado para:",
            trabajador.nombre
          );

        }

      } else {

        console.log(
          "ℹ️ El turno ya tenía el mismo tipo. No se creó una nueva notificación ni se envió Push."
        );

      }


      /* =================================================
         ACTUALIZAR INMEDIATAMENTE EL ESTADO LOCAL
      ================================================= */

      setTurnos(
        (actuales) => ({
          ...actuales,

          [fechaKey]: {
            ...(actuales[
              fechaKey
            ] || {}),

            [trabajadorId]:
              tipo,
          },
        })
      );


      /* =================================================
         CERRAR MODAL
      ================================================= */

      cerrarModal();


      console.log(
        "✅ Turno guardado correctamente."
      );

    } catch (error) {

      console.error(
        "ERROR GUARDANDO TURNO:",
        error
      );

      alert(
        `No se pudo guardar el turno.\n\n${
          error?.message ||
          "Error desconocido"
        }`
      );

    } finally {

      setGuardando(false);

    }
  };


  /* =====================================================
     ELIMINAR TURNO
  ===================================================== */

  const eliminarTurno = async (
    fecha,
    trabajadorId
  ) => {

    if (!esAdministrador) {
      return;
    }

    const fechaKey =
      convertirFecha(fecha);

    try {

      const datos =
        await obtenerTurnos();

      const turno =
        datos.find(
          (item) =>
            String(
              item.trabajador_id
            ) ===
              String(
                trabajadorId
              ) &&
            item.fecha ===
              fechaKey
        );


      if (!turno) {

        console.warn(
          "No se encontró el turno en Supabase."
        );

        return;
      }


      await eliminarTurnoSupabase(
        turno.id
      );


      /* =================================================
         ACTUALIZAR INMEDIATAMENTE EL ESTADO LOCAL
      ================================================= */

      setTurnos(
        (actuales) => {

          const copia = {
            ...actuales,
          };


          if (
            !copia[fechaKey]
          ) {

            return copia;

          }


          const dia = {
            ...copia[fechaKey],
          };


          delete dia[
            trabajadorId
          ];


          if (
            Object.keys(
              dia
            ).length === 0
          ) {

            delete copia[
              fechaKey
            ];

          } else {

            copia[
              fechaKey
            ] = dia;

          }


          return copia;

        }
      );


      console.log(
        "✅ Turno eliminado correctamente."
      );

    } catch (error) {

      console.error(
        "ERROR ELIMINANDO TURNO:",
        error
      );

      alert(
        `No se pudo eliminar el turno.\n\n${
          error?.message ||
          "Error desconocido"
        }`
      );

    }
  };


  /* =====================================================
     CERRAR MODAL
  ===================================================== */

  const cerrarModal = () => {

    setFechaSeleccionada(
      null
    );

    setTrabajadorSeleccionado(
      null
    );

  };


  /* =====================================================
     CARGANDO
  ===================================================== */

  if (cargandoTurnos) {

    return (

      <main className="dashboard">

        <div
          style={{
            padding:
              "60px",

            textAlign:
              "center",

            color:
              "#667085",
          }}
        >

          <div
            style={{
              fontSize:
                "28px",

              marginBottom:
                "10px",
            }}
          >
            ◌
          </div>

          <strong>
            Cargando calendario...
          </strong>

          <p>
            Consultando programación en Supabase
          </p>

        </div>

      </main>

    );

  }


  /* =====================================================
     PÁGINA
  ===================================================== */

  return (

    <main className="dashboard">

      <div className="welcome">

        <div>

          <span className="eyebrow">
            PROGRAMACIÓN
          </span>

          <h3>
            Calendario de turnos
          </h3>

          <p>

            {esAdministrador
              ? "Organiza y asigna las jornadas de día y noche de todo el equipo."
              : "Consulta las jornadas de día y noche de todo el equipo."
            }

          </p>

        </div>


        <div className="today-badge">

          <span>
            PERSONAL
          </span>

          <strong>
            {trabajadores.length}
          </strong>

          <small>
            ACTIVOS
          </small>

        </div>

      </div>


      {/* =================================================
          CALENDARIO
      ================================================= */}

      <Calendario
        trabajadores={
          trabajadores
        }

        turnos={
          turnos
        }

        fechaInicio={
          fechaInicio
        }

        setFechaInicio={
          setFechaInicio
        }

        onSeleccionarTurno={
          seleccionarTurno
        }

        onEliminarTurno={
          eliminarTurno
        }

        puedeEditar={
          esAdministrador
        }
      />


      {/* =================================================
          RESUMEN
      ================================================= */}

      <ResumenTurnos
        trabajadores={
          trabajadores
        }

        turnos={
          turnos
        }

        fechaInicio={
          fechaInicio
        }
      />


      {/* =================================================
          MODAL
      ================================================= */}

      {esAdministrador &&
        fechaSeleccionada &&
        trabajadorSeleccionado && (

          <div
            className="modal-overlay"
            onClick={
              cerrarModal
            }
          >

            <div
              className="modal-turno"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <div>

                  <span className="modal-label">
                    ASIGNAR TURNO
                  </span>

                  <h3>
                    {
                      trabajadorSeleccionado.nombre
                    }
                  </h3>

                </div>


                <button
                  type="button"
                  className="modal-close"
                  onClick={
                    cerrarModal
                  }
                  disabled={
                    guardando
                  }
                >
                  ×
                </button>

              </div>


              <div className="modal-person">

                <div className="modal-avatar">

                  {
                    trabajadorSeleccionado
                      .nombre
                      ?.charAt(0)
                      ?.toUpperCase()
                  }

                </div>


                <div>

                  <strong>
                    {
                      trabajadorSeleccionado.nombre
                    }
                  </strong>

                  <span>
                    {
                      trabajadorSeleccionado.cargo ||
                      "Vigilante"
                    }
                  </span>

                </div>

              </div>


              <div className="modal-date">

                <span>
                  FECHA
                </span>

                <strong>

                  {
                    fechaSeleccionada.toLocaleDateString(
                      "es-CO",
                      {
                        weekday:
                          "long",

                        day:
                          "numeric",

                        month:
                          "long",
                      }
                    )
                  }

                </strong>

              </div>


              <div className="turno-options">

                {/* =======================================
                    TURNO DE DÍA
                ======================================= */}

                <button
                  type="button"
                  className="turno-option turno-dia"
                  disabled={
                    guardando
                  }
                  onClick={() =>
                    guardarTurno(
                      fechaSeleccionada,
                      trabajadorSeleccionado.id,
                      "dia"
                    )
                  }
                >

                  <div className="turno-option-icon">
                    ☀
                  </div>

                  <div>

                    <strong>
                      Turno de día
                    </strong>

                    <span>
                      06:00 — 18:00
                    </span>

                  </div>

                  <b>
                    ›
                  </b>

                </button>


                {/* =======================================
                    TURNO DE NOCHE
                ======================================= */}

                <button
                  type="button"
                  className="turno-option turno-noche"
                  disabled={
                    guardando
                  }
                  onClick={() =>
                    guardarTurno(
                      fechaSeleccionada,
                      trabajadorSeleccionado.id,
                      "noche"
                    )
                  }
                >

                  <div className="turno-option-icon">
                    ☾
                  </div>

                  <div>

                    <strong>
                      Turno de noche
                    </strong>

                    <span>
                      18:00 — 06:00
                    </span>

                  </div>

                  <b>
                    ›
                  </b>

                </button>

              </div>


              <div className="modal-footer">

                <button
                  type="button"
                  className="modal-cancel"
                  onClick={
                    cerrarModal
                  }
                  disabled={
                    guardando
                  }
                >
                  Cancelar
                </button>

              </div>

            </div>

          </div>

        )}

    </main>

  );
}


export default CalendarioPage;