import { useMemo } from "react";

function Inicio({
  trabajadores = [],
  turnos = {},
}) {

  /* =====================================================
     FECHA ACTUAL
  ===================================================== */

  const hoy = useMemo(() => {
    const fecha = new Date();

    fecha.setHours(
      0,
      0,
      0,
      0
    );

    return fecha;
  }, []);


  /* =====================================================
     CONVERTIR FECHA A YYYY-MM-DD
  ===================================================== */

  const obtenerClaveFecha = (fecha) => {

    const year =
      fecha.getFullYear();

    const month =
      String(
        fecha.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        fecha.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };


  /* =====================================================
     OBTENER INICIO DE LA QUINCENA ACTUAL

     1 al 15
     16 al último día del mes
  ===================================================== */

  const obtenerInicioQuincena = (fecha) => {

    const inicio =
      new Date(fecha);

    inicio.setHours(
      0,
      0,
      0,
      0
    );

    if (
      inicio.getDate() <= 15
    ) {

      inicio.setDate(1);

    } else {

      inicio.setDate(16);

    }

    return inicio;
  };


  /* =====================================================
     OBTENER FIN DE LA QUINCENA ACTUAL
  ===================================================== */

  const obtenerFinQuincena = (fecha) => {

    const fin =
      new Date(fecha);

    fin.setHours(
      0,
      0,
      0,
      0
    );

    if (
      fin.getDate() <= 15
    ) {

      fin.setDate(15);

    } else {

      fin.setMonth(
        fin.getMonth() + 1,
        0
      );

    }

    return fin;
  };


  /* =====================================================
     INICIO Y FIN DE LA QUINCENA
  ===================================================== */

  const fechaInicioQuincena =
    useMemo(
      () =>
        obtenerInicioQuincena(
          hoy
        ),
      [hoy]
    );


  const fechaFinQuincena =
    useMemo(
      () =>
        obtenerFinQuincena(
          hoy
        ),
      [hoy]
    );


  /* =====================================================
     DÍAS DE LA QUINCENA

     Puede tener:

     15 días → primera quincena
     15/16 días → segunda quincena,
     dependiendo del mes.
  ===================================================== */

  const diasPeriodo =
    useMemo(() => {

      const dias = [];

      const fecha =
        new Date(
          fechaInicioQuincena
        );

      while (
        fecha <=
        fechaFinQuincena
      ) {

        dias.push(
          new Date(fecha)
        );

        fecha.setDate(
          fecha.getDate() + 1
        );

      }

      return dias;

    }, [
      fechaInicioQuincena,
      fechaFinQuincena,
    ]);


  /* =====================================================
     TEXTO DEL PERÍODO
  ===================================================== */

  const textoPeriodo =
    useMemo(() => {

      const inicio =
        fechaInicioQuincena;

      const fin =
        fechaFinQuincena;

      const mismoMes =
        inicio.getMonth() ===
          fin.getMonth() &&
        inicio.getFullYear() ===
          fin.getFullYear();

      if (mismoMes) {

        return `${inicio.getDate()} al ${fin.getDate()} de ${fin.toLocaleDateString(
          "es-CO",
          {
            month: "long",
            year: "numeric",
          }
        )}`;

      }

      return `${inicio.toLocaleDateString(
        "es-CO",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )} al ${fin.toLocaleDateString(
        "es-CO",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )}`;

    }, [
      fechaInicioQuincena,
      fechaFinQuincena,
    ]);


  /* =====================================================
     RESUMEN DE LA QUINCENA

     Cuenta TODOS los trabajadores y TODOS los días
     de la quincena actual.
  ===================================================== */

  const resumenPeriodo =
    useMemo(() => {

      let total = 0;

      let dia = 0;

      let noche = 0;


      diasPeriodo.forEach(
        (fecha) => {

          const clave =
            obtenerClaveFecha(
              fecha
            );

          const turnosDelDia =
            turnos?.[clave] || {};


          trabajadores.forEach(
            (trabajador) => {

              const turno =
                turnosDelDia?.[
                  trabajador.id
                ];


              if (
                turno === "dia"
              ) {

                total++;

                dia++;

              }


              if (
                turno === "noche"
              ) {

                total++;

                noche++;

              }

            }
          );

        }
      );


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

     Muestra los próximos turnos dentro de la
     quincena actual.
  ===================================================== */

  const proximosTurnos =
    useMemo(() => {

      const resultado = [];


      diasPeriodo.forEach(
        (fecha) => {

          /*
             No mostrar fechas anteriores a hoy.
          */

          const fechaComparar =
            new Date(fecha);

          fechaComparar.setHours(
            0,
            0,
            0,
            0
          );


          if (
            fechaComparar <
            hoy
          ) {

            return;

          }


          const clave =
            obtenerClaveFecha(
              fecha
            );

          const turnosDelDia =
            turnos?.[clave] || {};


          trabajadores.forEach(
            (trabajador) => {

              const turno =
                turnosDelDia?.[
                  trabajador.id
                ];


              if (
                turno !== "dia" &&
                turno !== "noche"
              ) {

                return;

              }


              resultado.push({

                fecha:
                  new Date(fecha),

                trabajador,

                turno,

              });

            }
          );

        }
      );


      return resultado.slice(
        0,
        6
      );

    }, [
      diasPeriodo,
      hoy,
      trabajadores,
      turnos,
    ]);


  /* =====================================================
     TURNO DE HOY
  ===================================================== */

  const turnoHoy =
    useMemo(() => {

      const clave =
        obtenerClaveFecha(
          hoy
        );

      const turnosDelDia =
        turnos?.[clave] || {};


      const resultado = [];


      trabajadores.forEach(
        (trabajador) => {

          const turno =
            turnosDelDia?.[
              trabajador.id
            ];


          if (
            turno === "dia" ||
            turno === "noche"
          ) {

            resultado.push({

              trabajador,

              turno,

            });

          }

        }
      );


      return resultado;

    }, [
      hoy,
      trabajadores,
      turnos,
    ]);


  /* =====================================================
     FORMATO DE FECHA
  ===================================================== */

  const formatearFecha = (
    fecha
  ) => {

    return fecha.toLocaleDateString(
      "es-CO",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
      }
    )
      .replace(".", "")
      .toUpperCase();

  };


  /* =====================================================
     FORMATO DE HORA DEL TURNO
  ===================================================== */

  const obtenerHorario =
    (turno) => {

      if (
        turno === "dia"
      ) {

        return "06:00 — 18:00";

      }

      if (
        turno === "noche"
      ) {

        return "18:00 — 06:00";

      }

      return "";

    };


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <main className="dashboard">

      {/* =================================================
          ENCABEZADO
      ================================================= */}

      <div className="welcome">

        <div>

          <span className="eyebrow">
            PANEL PRINCIPAL
          </span>

          <h3>
            Control de turnos
          </h3>

          <p>
            Resumen de la programación de tu equipo.
          </p>

        </div>


        <div className="today-badge">

          <span>
            HOY
          </span>

          <strong>
            {hoy.getDate()}
          </strong>

          <small>
            {hoy.toLocaleDateString(
              "es-CO",
              {
                month: "short",
              }
            )
              .replace(".", "")
              .toUpperCase()}
          </small>

        </div>

      </div>


      {/* =================================================
          PERÍODO ACTUAL
      ================================================= */}

      <div
        className="periodo-info"
        style={{
          marginBottom: "20px",
          padding: "14px 18px",
          background: "#f8fafc",
          border: "1px solid #e4e7ec",
          borderRadius: "12px",
        }}
      >

        <span
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: "700",
            color: "#667085",
            letterSpacing: "0.08em",
            marginBottom: "4px",
          }}
        >
          QUINCENA ACTUAL
        </span>

        <strong
          style={{
            fontSize: "16px",
            color: "#101828",
            textTransform: "capitalize",
          }}
        >
          {textoPeriodo}
        </strong>

      </div>


      {/* =================================================
          ESTADÍSTICAS
      ================================================= */}

      <div className="stats-grid">

        <div className="stat-card">

          <span>
            TRABAJADORES
          </span>

          <strong>
            {trabajadores.length}
          </strong>

          <small>
            Personal activo
          </small>

        </div>


        <div className="stat-card">

          <span>
            TURNOS
          </span>

          <strong>
            {resumenPeriodo.total}
          </strong>

          <small>
            Programados en la quincena
          </small>

        </div>


        <div className="stat-card">

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


        <div className="stat-card">

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


      {/* =================================================
          TURNO DE HOY
      ================================================= */}

      <section className="dashboard-section">

        <div className="section-header">

          <div>

            <span className="eyebrow">
              PROGRAMACIÓN
            </span>

            <h3>
              Turnos de hoy
            </h3>

          </div>

          <span className="section-count">
            {turnoHoy.length}{" "}
            {turnoHoy.length === 1
              ? "turno"
              : "turnos"}
          </span>

        </div>


        {turnoHoy.length === 0 ? (

          <div className="empty-state">

            <div>
              📅
            </div>

            <strong>
              No hay turnos para hoy
            </strong>

            <span>
              No hay trabajadores programados para esta fecha.
            </span>

          </div>

        ) : (

          <div className="turnos-hoy-list">

            {turnoHoy.map(
              ({
                trabajador,
                turno,
              }) => (

                <div
                  className="turno-hoy-card"
                  key={`${trabajador.id}-${turno}`}
                >

                  <div className="turno-hoy-avatar">

                    {trabajador.nombre
                      ?.trim()
                      ?.charAt(0)
                      ?.toUpperCase() || "?"}

                  </div>


                  <div className="turno-hoy-info">

                    <strong>
                      {trabajador.nombre}
                    </strong>

                    <span>
                      {trabajador.cargo ||
                        "Vigilante"}
                    </span>

                  </div>


                  <div
                    className={`turno-hoy-badge ${
                      turno === "noche"
                        ? "noche"
                        : "dia"
                    }`}
                  >

                    <strong>

                      {turno === "noche"
                        ? "☾ NOCHE"
                        : "☀ DÍA"}

                    </strong>

                    <span>
                      {obtenerHorario(
                        turno
                      )}
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* =================================================
          PRÓXIMOS TURNOS
      ================================================= */}

      <section className="dashboard-section">

        <div className="section-header">

          <div>

            <span className="eyebrow">
              PRÓXIMAMENTE
            </span>

            <h3>
              Próximos turnos
            </h3>

          </div>

        </div>


        {proximosTurnos.length === 0 ? (

          <div className="empty-state">

            <div>
              📋
            </div>

            <strong>
              No hay próximos turnos
            </strong>

            <span>
              Todavía no hay programación pendiente en esta quincena.
            </span>

          </div>

        ) : (

          <div className="proximos-turnos-list">

            {proximosTurnos.map(
              ({
                fecha,
                trabajador,
                turno,
              }) => (

                <div
                  className="proximo-turno"
                  key={`${obtenerClaveFecha(
                    fecha
                  )}-${trabajador.id}`}
                >

                  <div className="proximo-turno-fecha">

                    <strong>
                      {fecha.getDate()}
                    </strong>

                    <span>
                      {fecha.toLocaleDateString(
                        "es-CO",
                        {
                          month: "short",
                        }
                      )
                        .replace(".", "")
                        .toUpperCase()}
                    </span>

                  </div>


                  <div className="proximo-turno-info">

                    <strong>
                      {trabajador.nombre}
                    </strong>

                    <span>
                      {formatearFecha(
                        fecha
                      )}
                    </span>

                  </div>


                  <div
                    className={`proximo-turno-tipo ${
                      turno === "noche"
                        ? "noche"
                        : "dia"
                    }`}
                  >

                    {turno === "noche"
                      ? "☾ Noche"
                      : "☀ Día"}

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

    </main>

  );
}


export default Inicio;