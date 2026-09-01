function ResumenTurnos({
  trabajadores = [],
  turnos = {},
}) {
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

  const hoy = new Date();

  hoy.setHours(0, 0, 0, 0);

  const diaSemana = hoy.getDay();

  const diferencia =
    diaSemana === 0
      ? -6
      : 1 - diaSemana;

  const lunes = new Date(hoy);

  lunes.setDate(
    hoy.getDate() + diferencia
  );

  const diasSemana = Array.from(
    { length: 7 },
    (_, indice) => {
      const fecha = new Date(lunes);

      fecha.setDate(
        lunes.getDate() + indice
      );

      return fecha;
    }
  );

  const nombresDias = [
    "Lun",
    "Mar",
    "Mié",
    "Jue",
    "Vie",
    "Sáb",
    "Dom",
  ];

  const obtenerTurnosTrabajador = (
    trabajador
  ) => {
    let dias = 0;
    let noches = 0;

    diasSemana.forEach((fecha) => {
      const clave =
        obtenerClaveFecha(fecha);

      const turno =
        turnos?.[clave]?.[
          trabajador.id
        ];

      if (turno === "dia") {
        dias++;
      }

      if (turno === "noche") {
        noches++;
      }
    });

    return {
      dias,
      noches,
      total: dias + noches,
    };
  };

  const totalDia = trabajadores.reduce(
    (total, trabajador) => {
      return (
        total +
        obtenerTurnosTrabajador(
          trabajador
        ).dias
      );
    },
    0
  );

  const totalNoche = trabajadores.reduce(
    (total, trabajador) => {
      return (
        total +
        obtenerTurnosTrabajador(
          trabajador
        ).noches
      );
    },
    0
  );

  const totalTurnos =
    totalDia + totalNoche;

  return (
    <section className="resumen-turnos">

      <div className="resumen-header">

        <div>
          <span>
            RESUMEN SEMANAL
          </span>

          <h3>
            Distribución de turnos
          </h3>
        </div>

        <div className="resumen-total">
          <strong>
            {totalTurnos}
          </strong>

          <small>
            turnos
          </small>
        </div>

      </div>


      <div className="resumen-stats">

        <div className="resumen-stat">

          <div className="resumen-stat-icon dia">
            ☀
          </div>

          <div>
            <span>
              Turnos de día
            </span>

            <strong>
              {totalDia}
            </strong>
          </div>

        </div>


        <div className="resumen-stat">

          <div className="resumen-stat-icon noche">
            ☾
          </div>

          <div>
            <span>
              Turnos de noche
            </span>

            <strong>
              {totalNoche}
            </strong>
          </div>

        </div>


        <div className="resumen-stat">

          <div className="resumen-stat-icon personal">
            👥
          </div>

          <div>
            <span>
              Personal
            </span>

            <strong>
              {trabajadores.length}
            </strong>
          </div>

        </div>

      </div>


      <div className="resumen-personal">

        <div className="resumen-personal-header">

          <span>
            PERSONAL
          </span>

          <span>
            ESTA SEMANA
          </span>

        </div>


        {trabajadores.length === 0 ? (

          <div className="resumen-vacio">
            No hay trabajadores registrados.
          </div>

        ) : (

          trabajadores.map((trabajador) => {

            const datos =
              obtenerTurnosTrabajador(
                trabajador
              );

            const inicial =
              trabajador.nombre
                ?.trim()
                ?.charAt(0)
                ?.toUpperCase() || "?";

            return (
              <div
                className="resumen-persona"
                key={trabajador.id}
              >

                <div className="resumen-persona-info">

                  <div className="resumen-avatar">
                    {inicial}
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


                <div className="resumen-persona-turnos">

                  <div className="mini-turno dia">
                    <strong>
                      {datos.dias}
                    </strong>

                    <span>
                      día
                    </span>
                  </div>


                  <div className="mini-turno noche">
                    <strong>
                      {datos.noches}
                    </strong>

                    <span>
                      noche
                    </span>
                  </div>


                  <div className="mini-total">
                    <strong>
                      {datos.total}
                    </strong>

                    <span>
                      total
                    </span>
                  </div>

                </div>

              </div>
            );
          })
        )}

      </div>


      <div className="resumen-dias">

        {diasSemana.map(
          (fecha, indice) => {

            const clave =
              obtenerClaveFecha(fecha);

            let cantidad = 0;

            trabajadores.forEach(
              (trabajador) => {
                if (
                  turnos?.[clave]?.[
                    trabajador.id
                  ]
                ) {
                  cantidad++;
                }
              }
            );

            return (
              <div
                className="resumen-dia"
                key={clave}
              >

                <span>
                  {nombresDias[indice]}
                </span>

                <strong>
                  {fecha.getDate()}
                </strong>

                <small>
                  {cantidad}{" "}
                  {cantidad === 1
                    ? "turno"
                    : "turnos"}
                </small>

              </div>
            );
          }
        )}

      </div>

    </section>
  );
}

export default ResumenTurnos;