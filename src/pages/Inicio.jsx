import { useMemo } from "react";

function Inicio({
  trabajadores = [],
  turnos = {},
  onIrCalendario,
}) {
  /* =====================================================
     FECHA ACTUAL
  ===================================================== */

  const hoy = new Date();

  hoy.setHours(0, 0, 0, 0);

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
     FORMATEAR FECHA
  ===================================================== */

  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString(
      "es-CO",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
      }
    );
  };

  /* =====================================================
     INICIAL DEL TRABAJADOR
  ===================================================== */

  const obtenerInicial = (nombre) => {
    return (
      nombre
        ?.trim()
        ?.charAt(0)
        ?.toUpperCase() || "?"
    );
  };

  /* =====================================================
     PERÍODO DE 15 DÍAS
     
     El dashboard trabaja con:
     HOY + 14 DÍAS
  ===================================================== */

  const diasPeriodo = useMemo(() => {
    return Array.from(
      { length: 15 },
      (_, indice) => {
        const fecha = new Date(hoy);

        fecha.setDate(
          hoy.getDate() + indice
        );

        fecha.setHours(0, 0, 0, 0);

        return fecha;
      }
    );
  }, []);

  /* =====================================================
     FECHA FINAL DEL PERÍODO
  ===================================================== */

  const fechaFinalPeriodo =
    diasPeriodo[diasPeriodo.length - 1];

  /* =====================================================
     TEXTO DEL PERÍODO
  ===================================================== */

  const textoPeriodo = useMemo(() => {
    const inicio = diasPeriodo[0];
    const fin = diasPeriodo[
      diasPeriodo.length - 1
    ];

    const mismoMes =
      inicio.getMonth() ===
        fin.getMonth() &&
      inicio.getFullYear() ===
        fin.getFullYear();

    if (mismoMes) {
      return `${inicio.getDate()} — ${fin.getDate()} ${fin
        .toLocaleDateString("es-CO", {
          month: "long",
          year: "numeric",
        })
        .replace(/^\w/, (letra) =>
          letra.toUpperCase()
        )}`;
    }

    return `${inicio
      .toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
      })
      .replace(/^\w/, (letra) =>
        letra.toUpperCase()
      )} — ${fin
      .toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      .replace(/^\w/, (letra) =>
        letra.toUpperCase()
      )}`;
  }, [diasPeriodo]);

  /* =====================================================
     TURNOS DE HOY
  ===================================================== */

  const turnoHoy = useMemo(() => {
    const clave =
      obtenerClaveFecha(hoy);

    const resultado = [];

    trabajadores.forEach(
      (trabajador) => {
        const turno =
          turnos?.[clave]?.[
            trabajador.id
          ];

        if (turno) {
          resultado.push({
            trabajador,
            turno,
          });
        }
      }
    );

    return resultado;
  }, [trabajadores, turnos]);

  /* =====================================================
     TURNOS DEL PERÍODO DE 15 DÍAS
     
     IMPORTANTE:
     Solo cuenta los turnos que aparecen
     dentro de estos 15 días.
  ===================================================== */

  const resumenPeriodo = useMemo(() => {
    let total = 0;
    let dia = 0;
    let noche = 0;

    diasPeriodo.forEach((fecha) => {
      const clave =
        obtenerClaveFecha(fecha);

      const turnosDelDia =
        turnos?.[clave] || {};

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
    };
  }, [
    diasPeriodo,
    trabajadores,
    turnos,
  ]);

  /* =====================================================
     PRÓXIMOS TURNOS
     
     Desde mañana hasta completar
     los 15 días del período.
  ===================================================== */

  const proximosTurnos = useMemo(() => {
    const resultado = [];

    for (
      let i = 1;
      i < diasPeriodo.length;
      i++
    ) {
      const fecha =
        diasPeriodo[i];

      const clave =
        obtenerClaveFecha(fecha);

      trabajadores.forEach(
        (trabajador) => {
          const turno =
            turnos?.[clave]?.[
              trabajador.id
            ];

          if (turno) {
            resultado.push({
              fecha: new Date(fecha),
              trabajador,
              turno,
            });
          }
        }
      );
    }

    return resultado.slice(0, 6);
  }, [
    diasPeriodo,
    trabajadores,
    turnos,
  ]);

  /* =====================================================
     CANTIDAD DE DÍAS LIBRES DEL PERÍODO
     
     Un día libre = trabajador sin turno
     en una de las 15 fechas.
  ===================================================== */

  const diasLibresPeriodo =
    useMemo(() => {
      let libres = 0;

      diasPeriodo.forEach((fecha) => {
        const clave =
          obtenerClaveFecha(fecha);

        const turnosDelDia =
          turnos?.[clave] || {};

        trabajadores.forEach(
          (trabajador) => {
            const turno =
              turnosDelDia?.[
                trabajador.id
              ];

            if (!turno) {
              libres++;
            }
          }
        );
      });

      return libres;
    }, [
      diasPeriodo,
      trabajadores,
      turnos,
    ]);

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="dashboard">

      {/* =================================================
          ENCABEZADO
      ================================================= */}

      <section className="welcome">

        <div>

          <span className="eyebrow">
            CONTROL DE TURNOS
          </span>

          <h3>
            Programación de la obra
          </h3>

          <p>
            Consulta y organiza los turnos
            del equipo de vigilancia.
          </p>

          <small
            style={{
              display: "block",
              marginTop: "6px",
              opacity: 0.7,
            }}
          >
            Período: {textoPeriodo}
          </small>

        </div>

        <div className="today-badge">

          <span>
            HOY
          </span>

          <strong>
            {hoy.getDate()}
          </strong>

          <small>
            {hoy
              .toLocaleDateString(
                "es-CO",
                {
                  month: "short",
                }
              )
              .replace(".", "")
              .toUpperCase()}
          </small>

        </div>

      </section>


      {/* =================================================
          ESTADÍSTICAS
      ================================================= */}

      <section className="stats-grid">

        {/* TRABAJADORES */}

        <div className="stat-card">

          <div className="stat-icon blue">
            👥
          </div>

          <div>

            <span>
              TRABAJADORES
            </span>

            <strong>
              {trabajadores.length}
            </strong>

            <small>
              Personal registrado
            </small>

          </div>

        </div>


        {/* TURNOS */}

        <div className="stat-card">

          <div className="stat-icon green">
            📅
          </div>

          <div>

            <span>
              TURNOS
            </span>

            <strong>
              {resumenPeriodo.total}
            </strong>

            <small>
              Programados en 15 días
            </small>

          </div>

        </div>


        {/* DÍA */}

        <div className="stat-card">

          <div className="stat-icon orange">
            ☀
          </div>

          <div>

            <span>
              DÍA
            </span>

            <strong>
              {resumenPeriodo.dia}
            </strong>

            <small>
              Turnos diurnos
            </small>

          </div>

        </div>


        {/* NOCHE */}

        <div className="stat-card">

          <div className="stat-icon purple">
            ☾
          </div>

          <div>

            <span>
              NOCHE
            </span>

            <strong>
              {resumenPeriodo.noche}
            </strong>

            <small>
              Turnos nocturnos
            </small>

          </div>

        </div>

      </section>


      {/* =================================================
          CONTENIDO PRINCIPAL
      ================================================= */}

      <section className="content-grid">

        {/* =================================================
            TURNOS DE HOY
        ================================================= */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <span className="panel-label">
                HOY
              </span>

              <h3>
                Turnos de hoy
              </h3>

            </div>

            <button
              type="button"
              className="text-button"
              onClick={onIrCalendario}
            >
              Ver calendario →
            </button>

          </div>


          <div className="shift-list">

            {turnoHoy.length === 0 ? (

              <div className="empty-section">

                <div className="empty-icon">
                  📅
                </div>

                <h3>
                  Sin turnos para hoy
                </h3>

                <p>
                  No hay trabajadores
                  asignados para esta fecha.
                </p>

              </div>

            ) : (

              turnoHoy.map(
                ({
                  trabajador,
                  turno,
                }) => (

                  <div
                    className="shift-row"
                    key={trabajador.id}
                  >

                    <div className="date-box">

                      <strong>
                        {hoy.getDate()}
                      </strong>

                      <span>
                        HOY
                      </span>

                    </div>


                    <div className="shift-icon">

                      {turno === "dia"
                        ? "☀"
                        : "☾"}

                    </div>


                    <div className="shift-info">

                      <strong>
                        {trabajador.nombre}
                      </strong>

                      <span>
                        {turno === "dia"
                          ? "06:00 — 18:00"
                          : "18:00 — 06:00"}
                      </span>

                    </div>


                    <span
                      className={`shift-status ${
                        turno === "dia"
                          ? "día"
                          : "noche"
                      }`}
                    >

                      {turno === "dia"
                        ? "DÍA"
                        : "NOCHE"}

                    </span>

                  </div>

                )
              )

            )}

          </div>

        </div>


        {/* =================================================
            PERSONAL REGISTRADO
        ================================================= */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <span className="panel-label">
                EQUIPO
              </span>

              <h3>
                Personal registrado
              </h3>

            </div>

            <span className="online-status">

              <i></i>

              Activo

            </span>

          </div>


          <div className="team-list">

            {trabajadores.length === 0 ? (

              <div className="resumen-vacio">
                No hay trabajadores
                registrados.
              </div>

            ) : (

              trabajadores.map(
                (trabajador) => (

                  <div
                    className="person-row"
                    key={trabajador.id}
                  >

                    <div className="avatar">

                      {obtenerInicial(
                        trabajador.nombre
                      )}

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


                    <span className="person-active">
                      ACTIVO
                    </span>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </section>


      {/* =================================================
          RESUMEN DEL PERÍODO
      ================================================= */}

      <section
        className="panel"
        style={{
          marginTop: "20px",
        }}
      >

        <div className="panel-header">

          <div>

            <span className="panel-label">
              RESUMEN
            </span>

            <h3>
              Información de los próximos 15 días
            </h3>

          </div>

          <span className="online-status">
            {resumenPeriodo.total} turnos
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
              {diasLibresPeriodo}
            </strong>

            <span>
              días libres
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          PRÓXIMOS TURNOS
      ================================================= */}

      <section
        className="panel"
        style={{
          marginTop: "20px",
        }}
      >

        <div className="panel-header">

          <div>

            <span className="panel-label">
              PRÓXIMOS TURNOS
            </span>

            <h3>
              Próximas jornadas
            </h3>

          </div>

          <span className="online-status">

            {proximosTurnos.length} programados

          </span>

        </div>


        <div className="shift-list">

          {proximosTurnos.length === 0 ? (

            <div className="resumen-vacio">
              No hay próximos turnos
              programados.
            </div>

          ) : (

            proximosTurnos.map(
              ({
                fecha,
                trabajador,
                turno,
              }) => (

                <div
                  className="shift-row"
                  key={`${obtenerClaveFecha(
                    fecha
                  )}-${trabajador.id}`}
                >

                  <div className="date-box">

                    <strong>
                      {fecha.getDate()}
                    </strong>

                    <span>

                      {fecha
                        .toLocaleDateString(
                          "es-CO",
                          {
                            weekday:
                              "short",
                          }
                        )
                        .replace(".", "")
                        .toUpperCase()}

                    </span>

                  </div>


                  <div className="shift-icon">

                    {turno === "dia"
                      ? "☀"
                      : "☾"}

                  </div>


                  <div className="shift-info">

                    <strong>
                      {trabajador.nombre}
                    </strong>

                    <span>
                      {formatearFecha(
                        fecha
                      )}
                    </span>

                  </div>


                  <span
                    className={`shift-status ${
                      turno === "dia"
                        ? "día"
                        : "noche"
                    }`}
                  >

                    {turno === "dia"
                      ? "DÍA"
                      : "NOCHE"}

                  </span>

                </div>

              )
            )

          )}

        </div>

      </section>

    </main>
  );
}

export default Inicio;
