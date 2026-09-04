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

          <small>
            {" "}
            {fin.getFullYear()}
          </small>
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

        <small>
          {" "}
          {fin.getFullYear()}
        </small>
      </>
    );
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
     RESUMEN REAL DE LOS 15 DÍAS
     
     SOLO SE ANALIZAN LAS FECHAS VISIBLES
     EN EL CALENDARIO.
  ===================================================== */

  const resumenPeriodo = useMemo(() => {
    let total = 0;
    let dia = 0;
    let noche = 0;
    let libre = 0;

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
          } else if (turno === "noche") {
            total++;
            noche++;
          } else {
            libre++;
          }
        }
      );
    });

    return {
      total,
      dia,
      noche,
      libre,
    };
  }, [
    dias,
    trabajadores,
    turnos,
  ]);

  /* =====================================================
     INFORMACIÓN POR TRABAJADOR
     
     AQUÍ SE CALCULAN LOS DATOS QUE APARECEN
     EN "PERSONAL EN ESTE PERÍODO".
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
          INFORMACIÓN DEL PERÍODO
      ================================================= */}

      <div className="week-info">

        <div>

          <span
            style={{
              marginRight: "8px",
              fontSize: "12px",
              fontWeight: "600",
              opacity: 0.7,
            }}
          >
            PERÍODO:
          </span>

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
          CALENDARIO DE 15 DÍAS
      ================================================= */}

      <div className="calendar-container">

        <div className="calendar-grid">

          {/* ESQUINA */}

          <div className="corner-cell">
            PERSONAL / DÍAS
          </div>


          {/* 15 DÍAS */}

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

                {/* INFORMACIÓN */}

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


                {/* DÍAS */}

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
          RESUMEN GENERAL DE LOS 15 DÍAS
      ================================================= */}

      <section className="panel calendario-resumen">

        <div className="panel-header">

          <div>

            <span className="panel-label">
              RESUMEN DEL PERÍODO
            </span>

            <h3>
              Distribución de turnos
            </h3>

            <p>
              Información de los 15 días
              mostrados en el calendario.
            </p>

          </div>

          <span className="online-status">
            {dias.length} días
          </span>

        </div>


        <div className="calendar-footer">

          <div>

            <strong>
              {resumenPeriodo.total}
            </strong>

            <span>
              turnos asignados
            </span>

          </div>


          <div>

            <strong>
              {resumenPeriodo.dia}
            </strong>

            <span>
              turnos de día
            </span>

          </div>


          <div>

            <strong>
              {resumenPeriodo.noche}
            </strong>

            <span>
              turnos de noche
            </span>

          </div>


          <div>

            <strong>
              {resumenPeriodo.libre}
            </strong>

            <span>
              días libres
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          PERSONAL EN EL PERÍODO
          
          ESTA ES LA PARTE QUE REEMPLAZA
          "PERSONAL ESTA SEMANA".
      ================================================= */}

      <section
        className="panel personal-periodo-panel"
        style={{
          marginTop: "20px",
        }}
      >

        <div className="panel-header">

          <div>

            <span className="panel-label">
              PERSONAL
            </span>

            <h3>
              Personal en este período
            </h3>

            <p>
              Distribución de turnos de cada
              trabajador durante los 15 días.
            </p>

          </div>

          <span className="online-status">

            {trabajadores.length}{" "}
            {trabajadores.length === 1
              ? "trabajador"
              : "trabajadores"}

          </span>

        </div>


        {/* =================================================
            LISTA DEL PERSONAL
        ================================================= */}

        <div className="personal-periodo-list">

          {resumenPersonal.length === 0 ? (

            <div className="resumen-vacio">
              No hay trabajadores
              registrados.
            </div>

          ) : (

            resumenPersonal.map(
              ({
                trabajador,
                total,
                dia,
                noche,
                libre,
              }) => (

                <div
                  className="personal-periodo-row"
                  key={trabajador.id}
                >

                  {/* ================================
                      TRABAJADOR
                  ================================= */}

                  <div className="personal-periodo-person">

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


                  {/* ================================
                      TOTAL
                  ================================= */}

                  <div className="personal-periodo-stat">

                    <strong>
                      {total}
                    </strong>

                    <span>
                      turnos
                    </span>

                  </div>


                  {/* ================================
                      DÍA
                  ================================= */}

                  <div className="personal-periodo-stat">

                    <strong>
                      {dia}
                    </strong>

                    <span>
                      día
                    </span>

                  </div>


                  {/* ================================
                      NOCHE
                  ================================= */}

                  <div className="personal-periodo-stat">

                    <strong>
                      {noche}
                    </strong>

                    <span>
         
