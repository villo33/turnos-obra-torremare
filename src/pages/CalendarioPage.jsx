import { useState } from "react";

import Calendario from "../components/Calendario.jsx";
import ResumenTurnos from "../components/ResumenTurnos.jsx";

function CalendarioPage({
  trabajadores = [],
  turnos = {},
  setTurnos,
}) {
  const [fechaSeleccionada, setFechaSeleccionada] =
    useState(null);

  const [trabajadorSeleccionado, setTrabajadorSeleccionado] =
    useState(null);

  const seleccionarTurno = (
    fecha,
    trabajador
  ) => {
    setFechaSeleccionada(fecha);
    setTrabajadorSeleccionado(trabajador);
  };

  const guardarTurno = (
    fecha,
    trabajadorId,
    tipo
  ) => {
    const fechaKey =
      fecha instanceof Date
        ? `${fecha.getFullYear()}-${String(
            fecha.getMonth() + 1
          ).padStart(2, "0")}-${String(
            fecha.getDate()
          ).padStart(2, "0")}`
        : fecha;

    setTurnos((actuales) => ({
      ...actuales,

      [fechaKey]: {
        ...(actuales[fechaKey] || {}),

        [trabajadorId]: tipo,
      },
    }));
  };

  const eliminarTurno = (
    fecha,
    trabajadorId
  ) => {
    const fechaKey =
      fecha instanceof Date
        ? `${fecha.getFullYear()}-${String(
            fecha.getMonth() + 1
          ).padStart(2, "0")}-${String(
            fecha.getDate()
          ).padStart(2, "0")}`
        : fecha;

    setTurnos((actuales) => {
      const copia = {
        ...actuales,
      };

      if (copia[fechaKey]) {
        const dia = {
          ...copia[fechaKey],
        };

        delete dia[trabajadorId];

        if (Object.keys(dia).length === 0) {
          delete copia[fechaKey];
        } else {
          copia[fechaKey] = dia;
        }
      }

      return copia;
    });
  };

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
            Organiza las jornadas de día y
            noche de todo el equipo.
          </p>
        </div>

        <div className="today-badge">
          <span>PERSONAL</span>

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
        onSeleccionarTurno={
          seleccionarTurno
        }
        onEliminarTurno={
          eliminarTurno
        }
      />


      <ResumenTurnos
        trabajadores={trabajadores}
        turnos={turnos}
      />


      {fechaSeleccionada &&
        trabajadorSeleccionado && (
          <div
            className="modal-overlay"
            onClick={() => {
              setFechaSeleccionada(null);
              setTrabajadorSeleccionado(null);
            }}
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
                  onClick={() => {
                    setFechaSeleccionada(
                      null
                    );

                    setTrabajadorSeleccionado(
                      null
                    );
                  }}
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
                  onClick={() => {
                    guardarTurno(
                      fechaSeleccionada,
                      trabajadorSeleccionado.id,
                      "dia"
                    );

                    setFechaSeleccionada(
                      null
                    );

                    setTrabajadorSeleccionado(
                      null
                    );
                  }}
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
                  onClick={() => {
                    guardarTurno(
                      fechaSeleccionada,
                      trabajadorSeleccionado.id,
                      "noche"
                    );

                    setFechaSeleccionada(
                      null
                    );

                    setTrabajadorSeleccionado(
                      null
                    );
                  }}
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
                  onClick={() => {
                    setFechaSeleccionada(
                      null
                    );

                    setTrabajadorSeleccionado(
                      null
                    );
                  }}
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