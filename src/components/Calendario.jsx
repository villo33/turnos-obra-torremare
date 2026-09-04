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

    const diferencia = dia === 0 ? -6 : 1 - dia;

    fecha.setDate(fecha.getDate() + diferencia);

    return fecha;
  });

  /* =====================================================
     DÍAS DEL PERÍODO
     15 DÍAS EXACTOS
  ===================================================== */

  const dias = useMemo(() => {
    return Array.from({ length: 15 }, (_, indice) => {
      const fecha = new Date(fechaInicio);

      fecha.setDate(
        fechaInicio.getDate() + indice
      );

      return fecha;
    });
  }, [fechaInicio]);

  /* =====================================================
     CONVERTIR FECHA A YYYY-MM-DD
  ===================================================== */

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

  /* =====================================================
     SABER SI ES HOY
  ===================================================== */

  const esHoy = (fecha) => {
    const hoy = new Date();

    return (
      hoy.getFullYear() === fecha.getFullYear() &&
      hoy.getMonth() === fecha.getMonth() &&
      hoy.getDate() === fecha.getDate()
    );
  };

  /* =====================================================
     NOMBRE DEL DÍA
  ===================================================== */

  const nombreDia = (fecha) => {
    return fecha
      .toLocaleDateString("es-CO", {
        weekday: "short",
      })
      .replace(".", "")
      .toUpperCase();
  };

  /* =====================================================
     NOMBRE DEL MES
  ===================================================== */

  const nombreMes = (fecha) => {
    return fecha.toLocaleDateString("es-CO", {
      month: "long",
    });
  };

  /* =====================================================
     INFORMACIÓN DEL PERÍODO
  ===================================================== */

  const obtenerTextoPeriodo = () => {
    const inicio = dias[0];
    const fin = dias[dias.length - 1];

    const mismoMes =
      inicio.getMonth() === fin.getMonth() &&
      inicio.getFullYear() === fin.getFullYear();

    if (mismoMes) {
      return (
        <>
          <strong>
            {nombreMes(inicio)}
          </strong>

          <span>
            {" "}
            {inicio.getDate()} — {fin.getDate()}
          </span>
        </>
      );
    }

    return (
      <>
        <strong>
          {nombreMes(inicio)}
        </strong>

        <span>
          {" "}
          {inicio.getDate()} —{" "}
        </span>

        <strong>
          {nombreMes(fin)}
        </strong>

        <span>
          {" "}
          {fin.getDate()}
        </span>
      </>
    );
  };

  /* =====================================================
     CAMBIAR PERÍODO
     AVANZA / RETROCEDE 15 DÍAS
  ===================================================== */

  const cambiarPeriodo = (cantidad) => {
    setFechaInicio((actual) => {
      const nueva = new Date(actual);

      nueva.setDate(
        actual.getDate() + cantidad * 15
      );

      return nueva;
    });
  };

  /* =====================================================
     IR AL PERÍODO ACTUAL
  ===================================================== */

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

  /* =====================================================
     OBTENER TURNO
  ===================================================== */

  const obtenerTurno = (fecha, trabajador) => {
    const claveFecha =
      obtenerClaveFecha(fecha);

    return (
      turnos?.[claveFecha]?.[trabajador.id] ||
      null
    );
  };

  /* =====================================================
     CONTADORES
  ===================================================== */

  const cantidadTurnos = Object.values(
    turnos || {}
  ).reduce(
    (total, dia) =>
      total +
      Object.keys(dia || {}).length,
    0
  );

  const cantidadDias = Object.values(
    turnos || {}
  ).reduce(
    (total, dia) =>
      total +
      Object.values(dia || {}).filter(
        (turno) => turno === "dia"
      ).length,
    0
  );

  const cantidadNoches = Object.values(
    turnos || {}
  ).reduce(
    (total, dia) =>
      total +
      Object.values(dia || {}).filter(
        (turno) => turno === "noche"
      ).length,
    0
  );

  /* =====================================================
     SELECCIONAR CELDA LIBRE
  ===================================================== */

  const seleccionarCelda = (
    fecha,
    trabajador
  ) => {
    if (!puedeEditar) {
      return;
    }

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

  /* =====================================================
     ELIMINAR TURNO
  ===================================================== */

  const eliminarCelda = async (
    fecha,
    trabajador
  ) => {
    if (!puedeEditar) {
      return;
    }

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

  /* =====================================================
     CONFIRMAR ELIMINACIÓN
  ===================================================== */

  const confirmarEliminar = (
    fecha,
    trabajador,
    turno
  ) => {
    if (!puedeEditar) {
      return;
    }

    const nombreTurno =
      turno === "dia"
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

    const confirmar = window.confirm(
      `¿Quieres eliminar este turno?\n\n` +
      `Trabajador: ${trabajador.nombre}\n` +
      `Fecha: ${fechaTexto}\n` +
      `Turno: ${nombreTurno}\n\n` +
      `Esta acción eliminará el turno de la programación.`
    );

    if (!confirmar) {
      return;
    }

    eliminarCelda(
      fecha,
      trabajador
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      {/* =================================================
          ENCABEZADO
      ================================================= */}

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
          >
            ›
          </button>

        </div>

      </div>

      {/* =================================================
          INFORMACIÓN DEL PERÍODO
      ================================================= */}

      <div className="week-info">

        <div>

          {obtenerTextoPeriodo()}

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

      {/* =================================================
          CALENDARIO
      ================================================= */}

      <div className="calendar-container">

        <div className="calendar-grid">

          {/* =============================================
              ESQUINA
          ============================================= */}

          <div className="corner-cell">
            PERSONAL / DÍAS
          </div>

          {/* =============================================
              ENCABEZADOS DE LOS DÍAS
          ============================================= */}

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

          {/* =============================================
              TRABAJADORES
          ============================================= */}

          {trabajadores.map(
            (trabajador) => (

              <div
                className="worker-row"
                key={trabajador.id}
              >

                {/* =======================================
                    INFORMACIÓN DEL TRABAJADOR
                ======================================= */}

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

                {/* =======================================
                    DÍAS
                ======================================= */}

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

                      {/* =================================
                          TURNO ASIGNADO
                      ================================= */}

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

                        /* ===============================
                           CELDA LIBRE
                        =============================== */

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

      {/* =================================================
          RESUMEN
      ================================================= */}

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
