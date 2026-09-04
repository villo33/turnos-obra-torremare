import { useMemo, useState } from "react";
import TurnoCard from "./TurnoCard";

function Calendario({
  trabajadores = [],
  turnos = {},
  onSeleccionarTurno,
  onEliminarTurno,
  puedeEditar = false,
}) {
  /* =====================================================
     FECHA INICIAL
  ===================================================== */

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

  /* =====================================================
     15 DÍAS DEL PERÍODO
  ===================================================== */

  const dias = useMemo(() => {
    return Array.from(
      { length: 15 },
      (_, indice) => {
        const fecha = new Date(fechaInicio);

        fecha.setDate(
          fechaInicio.getDate() + indice
        );

        fecha.setHours(0, 0, 0, 0);

        return fecha;
      }
    );
  }, [fechaInicio]);

  /* =====================================================
     FECHA → YYYY-MM-DD
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
     CAMBIAR PERÍODO
  ===================================================== */

  const cambiarPeriodo = (cantidad) => {
    setFechaInicio((actual) => {
      const nueva = new Date(actual);

      nueva.setDate(
        actual.getDate() +
          cantidad * 15
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

  /* =====================================================
     RESUMEN GENERAL DEL PERÍODO
  ===================================================== */

  const resumenPeriodo = useMemo(() => {
    let total = 0;
    let dia = 0;
    let noche = 0;

    dias.forEach((fecha) => {
      const claveFecha =
        obtenerClaveFecha(fecha);

      const turnosDelDia =
        turnos?.[claveFecha] || {};

      trabajadores.forEach(
        (trabajador) => {
          const turno =
            turnosDelDia?.[
              trabajador.id
            ];

          if (turno === "dia") {
            total++;
            dia++;
          }

          if (turno === "noche") {
            total++;
            noche++;
          }
        }
      );
    });

    return {
      total,
      dia,
      noche,
      personal: trabajadores.length,
    };
  }, [
    dias,
    trabajadores,
    turnos,
  ]);

  /* =====================================================
     RESUMEN POR DÍA
  ===================================================== */

  const resumenDiario = useMemo(() => {
    return dias.map((fecha) => {
      const claveFecha =
        obtenerClaveFecha(fecha);

      const turnosDelDia =
        turnos?.[claveFecha] || {};

      let total = 0;
      let dia = 0;
      let noche = 0;

      trabajadores.forEach(
        (trabajador) => {
          const turno =
            turnosDelDia?.[
              trabajador.id
            ];

          if (turno === "dia") {
            total++;
            dia++;
          }

          if (turno === "noche") {
            total++;
            noche++;
          }
        }
      );

      return {
        fecha,
        total,
        dia,
        noche,
      };
    });
  }, [
    dias,
    trabajadores,
    turnos,
  ]);

  /* =====================================================
     INFORMACIÓN POR TRABAJADOR
  ===================================================== */

  const resumenPersonal = useMemo(() => {
    return trabajadores.map(
      (trabajador) => {
        let total = 0;
        let dia = 0;
        let noche = 0;
        let libre = 0;

        dias.forEach((fecha) => {
          const claveFecha =
            obtenerClaveFecha(fecha);

          const turno =
            turnos?.[claveFecha]?.[
              trabajador.id
            ];

          if (turno === "dia") {
            total++;
            dia++;
          } else if (
            turno === "noche"
          ) {
            total++;
            noche++;
          } else {
            libre++;
          }
        });

        return {
          trabajador,
          total,
          dia,
          noche,
          libre,
        };
      }
    );
  }, [
    trabajadores,
    turnos,
    dias,
  ]);

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

    const confirmar =
      window.confirm(
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

      {/* =================================================
          CALENDARIO
      ================================================= */}

      <div className="calendar-container">

        <div className="calendar-grid">

          {/* ESQUINA */}

          <div className="corner-cell">
            PERSONAL / DÍAS
          </div>

          {/* DÍAS */}

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

          {/* TRABAJADORES */}

          {trabajadores.map(
            (trabajador) => (

              <div
                className="worker-row"
                key={trabajador.id}
              >

                {/* NOMBRE */}

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

                {/* CELDAS */}

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

      {/* =================================================
          FOOTER DEL CALENDARIO
      ================================================= */}

      <section className="calendar-footer-panel">

        {/* ENCABEZADO DEL FOOTER */}

        <div className="calendar-footer-header">

          <div>

            <span className="calendar-footer-label">
              DISTRIBUCIÓN DE TURNOS
            </span>

            <h3>
              Resumen del período
            </h3>

          </div>

          <span className="calendar-footer-period">
            15 DÍAS
          </span>

        </div>

        {/* ESTADÍSTICAS */}

        <div className="calendar-footer-stats">

          {/* TOTAL */}

          <div className="calendar-stat calendar-stat-total">

            <div className="calendar-stat-icon">
              ✓
            </div>

            <div>

              <strong>
                {resumenPeriodo.total}
              </strong>

              <span>
                turnos totales
              </span>

            </div>

          </div>

          {/* DÍA */}

          <div className="calendar-stat calendar-stat-day">

            <div className="calendar-stat-icon">
              ☀
            </div>

            <div>

              <strong>
                {resumenPeriodo.dia}
              </strong>

              <span>
                turnos de día
              </span>

            </div>

          </div>

          {/* NOCHE */}

          <div className="calendar-stat calendar-stat-night">

            <div className="calendar-stat-icon">
              ☾
            </div>

            <div>

              <strong>
                {resumenPeriodo.noche}
              </strong>

              <span>
                turnos de noche
              </span>

            </div>

          </div>

          {/* PERSONAL */}

          <div className="calendar-stat calendar-stat-personal">

            <div className="calendar-stat-icon">
              👥
            </div>

            <div>

              <strong>
                {resumenPeriodo.personal}
              </strong>

              <span>
                personal
              </span>

            </div>

          </div>

        </div>

        {/* =================================================
            PERSONAL ESTE PERÍODO
        ================================================= */}

        <div className="calendar-footer-section">

          <div className="calendar-footer-section-header">

            <div>

              <span className="calendar-footer-mini-label">
                PERSONAL ESTE PERÍODO
              </span>

              <h4>
                Distribución por trabajador
              </h4>

            </div>

            <span className="calendar-footer-count">
              {trabajadores.length}{" "}
              {trabajadores.length === 1
                ? "persona"
                : "personas"}
            </span>

          </div>

          {resumenPersonal.length === 0 ? (

            <div className="calendar-empty">
              No hay trabajadores registrados.
            </div>

          ) : (

            <div className="calendar-workers-summary">

              {resumenPersonal.map(
                ({
                  trabajador,
                  total,
                  dia,
                  noche,
                  libre,
                }) => (

                  <div
                    className="calendar-worker-summary"
                    key={trabajador.id}
                  >

                    <div className="calendar-worker-person">

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

                    <div className="calendar-worker-stat total">
                      <strong>
                        {total}
                      </strong>
                      <span>
                        turnos
                      </span>
                    </div>

                    <div className="calendar-worker-stat day">
                      <strong>
                        {dia}
                      </strong>
                      <span>
                        día
                      </span>
                    </div>

                    <div className="calendar-worker-stat night">
                      <strong>
                        {noche}
                      </strong>
                      <span>
                        noche
                      </span>
                    </div>

                    <div className="calendar-worker-stat free">
                      <strong>
                        {libre}
                      </strong>
                      <span>
                        libres
                      </span>
                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* =================================================
            DISTRIBUCIÓN DIARIA
        ================================================= */}

        <div className="calendar-footer-section daily-section">

          <div className="calendar-footer-section-header">

            <div>

              <span className="calendar-footer-mini-label">
                DISTRIBUCIÓN DIARIA
              </span>

              <h4>
                Turnos por día
              </h4>

            </div>

          </div>

          <div className="calendar-daily-summary">

            {resumenDiario.map(
              ({
                fecha,
                total,
                dia,
                noche,
              }) => (

                <div
                  className={`calendar-day-summary ${
                    esHoy(fecha)
                      ? "is-today"
                      : ""
                  }`}
                  key={obtenerClaveFecha(
                    fecha
                  )}
                >

                  <div className="calendar-day-summary-date">

                    <span>
                      {nombreDia(fecha)}
