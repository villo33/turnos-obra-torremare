import { useMemo } from "react";

function Inicio({
  trabajadores = [],
  turnos = {},
  onIrCalendario,
}) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

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

  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const obtenerInicial = (nombre) => {
    return (
      nombre
        ?.trim()
        ?.charAt(0)
        ?.toUpperCase() || "?"
    );
  };

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

  const textoPeriodo = useMemo(() => {
    const inicio = diasPeriodo[0];

    const fin =
      diasPeriodo[
        diasPeriodo.length - 1
      ];

    const mismoMes =
      inicio.getMonth() === fin.getMonth() &&
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

  const turnoHoy = useMemo(() => {
    const clave = obtenerClaveFecha(hoy);

    const resultado = [];

    trabajadores.forEach((trabajador) => {
      const turno =
        turnos?.[clave]?.[trabajador.id];

      if (turno) {
        resultado.push({
          trabajador,
          turno,
        });
      }
    });

    return resultado;
  }, [trabajadores, turnos]);

  const resumenPeriodo = useMemo(() => {
    let total = 0;
    let dia = 0;
    let noche = 0;

    diasPeriodo.forEach((fecha) => {
      const clave =
        obtenerClaveFecha(fecha);

      const turnosDelDia =
        turnos?.[clave] || {};

      trabajadores.forEach((trabajador) => {
        const turno =
          turnosDelDia?.[trabajador.id];

        if (turno === "dia") {
          total++;
          dia++;
        }

        if (turno === "noche") {
          total++;
          noche++;
        }
      });
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

  const proximosTurnos = useMemo(() => {
    const resultado = [];

    for (
      let i = 1;
      i < diasPeriodo.length;
      i++
    ) {
      const fecha = diasPeriodo[i];

      const clave =
        obtenerClaveFecha(fecha);

      trabajadores.forEach((trabajador) => {
        const turno =
          turnos?.[clave]?.[trabajador.id];

        if (turno) {
          resultado.push({
            fecha: new Date(fecha),
            trabajador,
            turno,
          });
        }
      });
    }

    return resultado.slice(0, 6);
  }, [
    diasPeriodo,
    trabajadores,
    turnos,
  ]);

  return (
    <main className="dashboard">

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
              .toLocaleDateString("es-CO", {
                month: "short",
              })
              .replace(".", "")
              .toUpperCase()}
          </small>

        </div>

      </section>

      <section className="stats-grid">

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

      <section className="content-grid">

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
