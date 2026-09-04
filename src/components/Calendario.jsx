import { useMemo } from "react";
import TurnoCard from "./TurnoCard";

function Calendario({
  trabajadores = [],
  turnos = {},
  fechaInicio,
  setFechaInicio,
  onSeleccionarTurno,
  onEliminarTurno,
  puedeEditar = false,
}) {
  const dias = useMemo(() => {
    return Array.from({ length: 15 }, (_, indice) => {
      const fecha = new Date(fechaInicio);

      fecha.setDate(
        fechaInicio.getDate() + indice
      );

      fecha.setHours(0, 0, 0, 0);

      return fecha;
    });
  }, [fechaInicio]);

  const obtenerClaveFecha = (fecha) => {
    const year = fecha.getFullYear();

    const month = String(
      fecha.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      fecha.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const esHoy = (fecha) => {
    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);

    return (
      hoy.getFullYear() === fecha.getFullYear() &&
      hoy.getMonth() === fecha.getMonth() &&
      hoy.getDate() === fecha.getDate()
    );
  };

  const nombreDia = (fecha) => {
    return fecha
      .toLocaleDateString("es-CO", {
        weekday: "short",
      })
      .replace(".", "")
      .toUpperCase();
  };

  const cambiarPeriodo = (cantidad) => {
    setFechaInicio((actual) => {
      const nueva = new Date(actual);

      nueva.setDate(
        actual.getDate() + cantidad * 15
      );

      return nueva;
    });
  };

  const irHoy = () => {
    const fecha = new Date();

    fecha.setHours(0, 0, 0, 0);

    const dia = fecha.getDay();

    const diferencia =
      dia === 0
        ? -6
        : 1 - dia;

    fecha.setDate(
      fecha.getDate() + diferencia
    );

    setFechaInicio(fecha);
  };

  const obtenerTurno = (
    fecha,
    trabajador
  ) => {
    const claveFecha =
      obtenerClaveFecha(fecha);

    return (
      turnos?.[claveFecha]?.[
        trabajador.id
      ] || null
    );
  };

  const esTurnoDia = (turno) => {
    if (!turno) return false;

    const valor = String(turno)
      .trim()
      .toLowerCase();

    return (
      valor === "dia" ||
      valor === "día"
    );
  };

  const seleccionarCelda = (
    fecha,
    trabajador
  ) => {
    if (!puedeEditar) return;

    if (
      typeof onSeleccionarTurno ===
      "function"
    ) {
      onSeleccionarTurno(
        fecha,
        trabajador
      );
    }
  };

  const eliminarCelda = async (
    fecha,
    trabajador
  ) => {
    if (!puedeEditar) return;

    if (
      typeof onEliminarTurno ===
      "function"
    ) {
      await onEliminarTurno(
        fecha,
        trabajador.id
      );
    }
  };

  const confirmarEliminar = (
    fecha,
    trabajador,
    turno
  ) => {
    if (!puedeEditar) return;

    const nombreTurno =
      esTurnoDia(turno)
        ? "DÍA"
        : "NOCHE";

    const fechaTexto =
      fecha.toLocaleDateString(
        "es-CO",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      );

    const confirmar =
      window.confirm(
        `¿Quieres eliminar este turno?\n\n` +
          `Trabajador: ${trabajador.nombre}\n` +
          `Fecha: ${fechaTexto}\n` +
          `Turno: ${nombreTurno}\n\n` +
          `Esta acción eliminará el turno de la programación.`
      );

    if (!confirmar) return;

    eliminarCelda(
      fecha,
      trabajador
    );
  };

  return (
    <>
      <div className="calendario-header">

        <div>
          <span className="calendario-label">
            PROGRAMACIÓN QUINCENAL
          </span>

          <h3>
            Calendario de turnos
          </h3>

          <p>
            {puedeEditar
              ? "Organiza y asigna los turnos del personal de la obra."
              : "Consulta los turnos programados del personal de la obra."
            }
          </p>
        </div>

        <div className="calendario-actions">

          <button
            type="button"
            className="btn-secondary"
            onClick={irHoy}
          >
            Hoy
          </button>

          <button
            type="button"
            className="btn-arrow"
            onClick={() =>
              cambiarPeriodo(-1)
            }
            title="Período anterior"
            aria-label="Período anterior"
          >
            ‹
          </button>

          <button
            type="button"
            className="btn-arrow"
            onClick={() =>
              cambiarPeriodo(1)
            }
            title="Período siguiente"
            aria-label="Período siguiente"
          >
            ›
          </button>

        </div>

      </div>

      <div className="calendar-container">

        <div className="calendar-grid">

          <div className="corner-cell">
            PERSONAL / DÍAS
          </div>

          {dias.map((fecha) => (
            <div
              className={`day-header ${
                esHoy(fecha)
                  ? "today"
                  : ""
              }`}
              key={obtenerClaveFecha(
                fecha
              )}
            >

              <span>
                {nombreDia(fecha)}
              </span>

              <strong>
                {fecha.getDate()}
              </strong>

              {esHoy(fecha) && (
                <small>
                  HOY
                </small>
              )}

            </div>
          ))}

          {trabajadores.map(
            (trabajador) => (

              <div
                className="worker-row"
                key={trabajador.id}
              >

                <div className="worker-name">

                  <div className="worker-avatar">
                    {trabajador.nombre
                      ?.trim()
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      "?"}
                  </div>

                  <div>

                    <strong>
                      {trabajador.nombre}
                    </strong>

                    <span>
                      {trabajador.cargo ||
                        "Vigilante"}
                    </span>

                  </div>

                </div>

                {dias.map((fecha) => {

                  const turno =
                    obtenerTurno(
                      fecha,
                      trabajador
                    );

                  const clave =
                    `${trabajador.id}-${obtenerClaveFecha(
                      fecha
                    )}`;

                  return (
                    <div
                      className={`shift-cell ${
                        esHoy(fecha)
                          ? "today-cell"
                          : ""
                      }`}
                      key={clave}
                    >

                      {turno ? (

                        <TurnoCard
                          tipo={turno}
                          onClick={() =>
                            confirmarEliminar(
                              fecha,
                              trabajador,
                              turno
                            )
                          }
                        />

                      ) : (

                        <button
                          type="button"
                          className={`free-cell ${
                            !puedeEditar
                              ? "view-only"
                              : ""
                          }`}
                          onClick={() =>
                            seleccionarCelda(
                              fecha,
                              trabajador
                            )
                          }
                          title={
                            puedeEditar
                              ? "Asignar turno"
                              : "Día libre"
                          }
                        >
                          {puedeEditar
                            ? "+"
                            : "—"}
                        </button>

                      )}

                    </div>
                  );
                })}

              </div>

            )
          )}

        </div>

      </div>
    </>
  );
}

export default Calendario;
