import { useMemo, useState } from "react";
import TurnoCard from "./TurnoCard";

function Calendario({
  trabajadores = [],
  turnos = {},
  onSeleccionarTurno,
  onEliminarTurno,
  puedeEditar = false,
}) {
  const [fechaInicio, setFechaInicio] = useState(() => {
    const fecha = new Date();

    fecha.setHours(0, 0, 0, 0);

    const dia = fecha.getDay();

    const diferencia =
      dia === 0 ? -6 : 1 - dia;

    fecha.setDate(
      fecha.getDate() + diferencia
    );

    return fecha;
  });

  const dias = useMemo(() => {
    return Array.from(
      { length: 7 },
      (_, indice) => {
        const fecha = new Date(fechaInicio);

        fecha.setDate(
          fechaInicio.getDate() + indice
        );

        return fecha;
      }
    );
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

    return (
      hoy.getFullYear() ===
        fecha.getFullYear() &&
      hoy.getMonth() ===
        fecha.getMonth() &&
      hoy.getDate() ===
        fecha.getDate()
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

  const nombreMes = (fecha) => {
    return fecha.toLocaleDateString(
      "es-CO",
      {
        month: "long",
      }
    );
  };

  const cambiarSemana = (cantidad) => {
    setFechaInicio((actual) => {
      const nueva = new Date(actual);

      nueva.setDate(
        actual.getDate() +
          cantidad * 7
      );

      return nueva;
    });
  };

  const irHoy = () => {
    const fecha = new Date();

    fecha.setHours(0, 0, 0, 0);

    const dia = fecha.getDay();

    const diferencia =
      dia === 0 ? -6 : 1 - dia;

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

  const cantidadTurnos =
    Object.values(
      turnos || {}
    ).reduce(
      (total, dia) =>
        total +
        Object.keys(
          dia || {}
        ).length,
      0
    );

  const cantidadDias =
    Object.values(
      turnos || {}
    ).reduce(
      (total, dia) =>
        total +
        Object.values(
          dia || {}
        ).filter(
          (turno) =>
            turno === "dia"
        ).length,
      0
    );

  const cantidadNoches =
    Object.values(
      turnos || {}
    ).reduce(
      (total, dia) =>
        total +
        Object.values(
          dia || {}
        ).filter(
          (turno) =>
            turno === "noche"
        ).length,
      0
    );

  const seleccionarCelda = (
    fecha,
    trabajador
  ) => {
    if (!puedeEditar) {
      return;
    }

    if (onSeleccionarTurno) {
      onSeleccionarTurno(
        fecha,
        trabajador
      );
    }
  };

  const eliminarCelda = (
    fecha,
    trabajador
  ) => {
    if (!puedeEditar) {
      return;
    }

    if (onEliminarTurno) {
      onEliminarTurno(
        fecha,
        trabajador
      );
    }
  };

  return (
    <>
      <div className="calendario-header">

        <div>

          <span className="calendario-label">
            PROGRAMACIÓN SEMANAL
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
              cambiarSemana(-1)
            }
            title="Semana anterior"
          >
            ‹
          </button>

          <button
            type="button"
            className="btn-arrow"
            onClick={() =>
              cambiarSemana(1)
            }
            title="Semana siguiente"
          >
            ›
          </button>

        </div>

      </div>

      <div className="week-info">

        <div>

          <strong>
            {nombreMes(dias[0])}
          </strong>

          <span>
            {" "}
            {dias[0].getDate()} —{" "}
            {dias[6].getDate()}
          </span>

        </div>

        <div className="legend">

          <span>
            <i className="legend-day"></i>
            Día
          </span>

          <span>
            <i className="legend-night"></i>
            Noche
          </span>

          <span>
            <i className="legend-free"></i>
            Libre
          </span>

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
              key={obtenerClaveFecha(fecha)}
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
    onClick={() => {
      if (!puedeEditar) return;

      const confirmar = window.confirm(
        `¿Eliminar el turno de ${trabajador.nombre}?\n\n` +
        `Fecha: ${fecha.toLocaleDateString("es-CO")}\n` +
        `Turno: ${turno === "dia" ? "DÍA" : "NOCHE"}`
      );

      if (confirmar) {
        eliminarCelda(fecha, trabajador);
      }
    }}
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

      <div className="calendar-footer">

        <div>

          <strong>
            {cantidadTurnos}
          </strong>

          <span>
            turnos asignados
          </span>

        </div>

        <div>

          <strong>
            {cantidadDias}
          </strong>

          <span>
            turnos de día
          </span>

        </div>

        <div>

          <strong>
            {cantidadNoches}
          </strong>

          <span>
            turnos de noche
          </span>

        </div>

      </div>
    </>
  );
}

export default Calendario;
