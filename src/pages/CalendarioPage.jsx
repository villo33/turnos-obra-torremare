import { useEffect, useState } from "react";

import Calendario from "../components/Calendario.jsx";
import ResumenTurnos from "../components/ResumenTurnos.jsx";

import {
  obtenerTurnos,
  crearTurno,
  actualizarTurno,
  eliminarTurno as eliminarTurnoSupabase,
} from "../services/turnosService";


function CalendarioPage({
  trabajadores = [],
  turnos = {},
  setTurnos,
  esAdministrador = false,
}) {

  const [fechaSeleccionada, setFechaSeleccionada] =
    useState(null);

  const [trabajadorSeleccionado, setTrabajadorSeleccionado] =
    useState(null);

  const [cargandoTurnos, setCargandoTurnos] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);


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


  useEffect(() => {

    async function cargarTurnos() {

      try {

        setCargandoTurnos(true);

        const datos = await obtenerTurnos();

        console.log(
          "TURNOS DESDE SUPABASE:",
          datos
        );

        const turnosOrganizados = {};

        datos.forEach((turno) => {

          if (!turnosOrganizados[turno.fecha]) {
            turnosOrganizados[turno.fecha] = {};
          }

          turnosOrganizados[turno.fecha][
            turno.trabajador_id
          ] = turno.tipo;

        });

        setTurnos(turnosOrganizados);

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


  const seleccionarTurno = (
    fecha,
    trabajador
  ) => {

    if (!esAdministrador) {
      return;
    }

    setFechaSeleccionada(fecha);

    setTrabajadorSeleccionado(trabajador);

  };


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
          trabajador_id: trabajadorId,
          fecha: fechaKey,
          tipo,
        }
      );

      const turnosExistentes =
        await obtenerTurnos();

      const turnoExistente =
        turnosExistentes.find(
          (turno) =>
            String(turno.trabajador_id) ===
              String(trabajadorId) &&
            turno.fecha === fechaKey
        );


      if (turnoExistente) {

        await actualizarTurno(
          turnoExistente.id,
          {
            tipo,
          }
        );

      } else {

        await crearTurno({
          trabajador_id: trabajadorId,
          fecha: fechaKey,
          tipo,
        });

      }


      setTurnos((actuales) => ({

        ...actuales,

        [fechaKey]: {

          ...(actuales[fechaKey] || {}),

          [trabajadorId]: tipo,

        },

      }));


      cerrarModal();

      console.log(
        "Turno guardado correctamente."
      );

    } catch (error) {

      console.error(
        "ERROR GUARDANDO TURNO:",
        error
      );

      alert(
        `No se pudo guardar el turno.\n\n${
          error?.message || "Error desconocido"
        }`
      );

    } finally {

      setGuardando(false);

    }
  };


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
            String(item.trabajador_id) ===
              String(trabajadorId) &&
            item.fecha === fechaKey
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


      setTurnos((actuales) => {

        const copia = {
          ...actuales,
        };

        if (!copia[fechaKey]) {
          return copia;
        }

        const dia = {
          ...copia[fechaKey],
        };

        delete dia[trabajadorId];

        if (
          Object.keys(dia).length === 0
        ) {

          delete copia[fechaKey];

        } else {

          copia[fechaKey] = dia;

        }

        return copia;

      });


      console.log(
        "Turno eliminado correctamente."
      );

    } catch (error) {

      console.error(
        "ERROR ELIMINANDO TURNO:",
        error
      );

      alert(
        `No se pudo eliminar el turno.\n\n${
          error?.message || "Error desconocido"
        }`
      );

    }
  };


  const cerrarModal = () => {

    setFechaSeleccionada(null);

    setTrabajadorSeleccionado(null);

  };


  if (cargandoTurnos) {

    return (

      <main className="dashboard">

        <div
          style={{
            padding: "60px",
            textAlign: "center",
            color: "#667085",
          }}
        >

          <div
            style={{
              fontSize: "28px",
              marginBottom: "10px",
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


      <Calendario
        trabajadores={trabajadores}
        turnos={turnos}
        onSeleccionarTurno={seleccionarTurno}
        onEliminarTurno={eliminarTurno}
        puedeEditar={esAdministrador}
      />


      <ResumenTurnos
        trabajadores={trabajadores}
        turnos={turnos}
      />


      {esAdministrador &&
        fechaSeleccionada &&
        trabajadorSeleccionado && (

          <div
            className="modal-overlay"
            onClick={cerrarModal}
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
                    {trabajadorSeleccionado.nombre}
                  </h3>

                </div>


                <button
                  type="button"
                  className="modal-close"
                  onClick={cerrarModal}
                  disabled={guardando}
                >
                  ×
                </button>

              </div>


              <div className="modal-person">

                <div className="modal-avatar">

                  {trabajadorSeleccionado.nombre
                    ?.charAt(0)
                    ?.toUpperCase()}

                </div>


                <div>

                  <strong>
                    {trabajadorSeleccionado.nombre}
                  </strong>

                  <span>
                    {trabajadorSeleccionado.cargo ||
                      "Vigilante"}
                  </span>

                </div>

              </div>


              <div className="modal-date">

                <span>
                  FECHA
                </span>

                <strong>

                  {fechaSeleccionada.toLocaleDateString(
                    "es-CO",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    }
                  )}

                </strong>

              </div>


              <div className="turno-options">

                <button
                  type="button"
                  className="turno-option turno-dia"
                  disabled={guardando}
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


                <button
                  type="button"
                  className="turno-option turno-noche"
                  disabled={guardando}
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
                  onClick={cerrarModal}
                  disabled={guardando}
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