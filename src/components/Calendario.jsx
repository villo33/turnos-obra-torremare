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
  /* =====================================================
     OBTENER INFORMACIÓN DE LA QUINCENA
  ===================================================== */

  const obtenerInformacionQuincena = (fecha) => {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const dia = fecha.getDate();

    const ultimoDia = new Date(
      año,
      mes + 1,
      0
    ).getDate();

    if (dia <= 15) {
      return {
        año,
        mes,
        quincena: 1,
        primerDia: 1,
        ultimoDia: Math.min(15, ultimoDia),
      };
    }

    return {
      año,
      mes,
      quincena: 2,
      primerDia: 16,
      ultimoDia,
    };
  };


  /* =====================================================
     NORMALIZAR FECHA INICIAL
  ===================================================== */

  const informacionQuincena = useMemo(() => {
    return obtenerInformacionQuincena(
      fechaInicio
    );
  }, [fechaInicio]);


  /* =====================================================
     CREAR DÍAS REALES DE LA QUINCENA
  ===================================================== */

  const dias = useMemo(() => {
    const {
      año,
      mes,
      primerDia,
      ultimoDia,
    } = informacionQuincena;

    const cantidadDias =
      ultimoDia - primerDia + 1;

    return Array.from(
      { length: cantidadDias },
      (_, indice) => {
        const fecha = new Date(
          año,
          mes,
          primerDia + indice
        );

        fecha.setHours(
          0,
          0,
          0,
          0
        );

        return fecha;
      }
    );
  }, [informacionQuincena]);


  /* =====================================================
     CLAVE DE FECHA
  ===================================================== */

  const obtenerClaveFecha = (fecha) => {
    const year =
      fecha.getFullYear();

    const month = String(
      fecha.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      fecha.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };


  /* =====================================================
     ES HOY
  ===================================================== */

  const esHoy = (fecha) => {
    const hoy = new Date();

    hoy.setHours(
      0,
      0,
      0,
      0
    );

    return (
      hoy.getFullYear() ===
        fecha.getFullYear() &&
      hoy.getMonth() ===
        fecha.getMonth() &&
      hoy.getDate() ===
        fecha.getDate()
    );
  };


  /* =====================================================
     NOMBRE DEL DÍA
  ===================================================== */

  const nombreDia = (fecha) => {
    return fecha
      .toLocaleDateString(
        "es-CO",
        {
          weekday: "short",
        }
      )
      .replace(".", "")
      .toUpperCase();
  };


  /* =====================================================
     NOMBRE DEL MES
  ===================================================== */

  const nombreMes = useMemo(() => {
    const fecha = new Date(
      informacionQuincena.año,
      informacionQuincena.mes,
      1
    );

    return fecha
      .toLocaleDateString(
        "es-CO",
        {
          month: "long",
          year: "numeric",
        }
      )
      .toUpperCase();
  }, [informacionQuincena]);


  /* =====================================================
     TEXTO DE LA QUINCENA
  ===================================================== */

  const textoQuincena =
    informacionQuincena.quincena === 1
      ? `PRIMERA QUINCENA · 1 — ${informacionQuincena.ultimoDia}`
      : `SEGUNDA QUINCENA · 16 — ${informacionQuincena.ultimoDia}`;


  /* =====================================================
     CAMBIAR QUINCENA
  ===================================================== */

  const cambiarPeriodo = (
    cantidad
  ) => {
    setFechaInicio((actual) => {
      const informacion =
        obtenerInformacionQuincena(
          actual
        );

      let nuevoMes =
        informacion.mes;

      let nuevoAño =
        informacion.año;

      let nuevaQuincena =
        informacion.quincena +
        cantidad;

      if (nuevaQuincena > 2) {
        nuevaQuincena = 1;
        nuevoMes++;

        if (nuevoMes > 11) {
          nuevoMes = 0;
          nuevoAño++;
        }
      }

      if (nuevaQuincena < 1) {
        nuevaQuincena = 2;
        nuevoMes--;

        if (nuevoMes < 0) {
          nuevoMes = 11;
          nuevoAño--;
        }
      }

      const nuevoDia =
        nuevaQuincena === 1
          ? 1
          : 16;

      return new Date(
        nuevoAño,
        nuevoMes,
        nuevoDia
      );
    });
  };


  /* =====================================================
     IR A LA QUINCENA ACTUAL
  ===================================================== */

  const irHoy = () => {
    const fecha = new Date();

    fecha.setHours(
      0,
      0,
      0,
      0
    );

    const dia =
      fecha.getDate();

    fecha.setDate(
      dia <= 15 ? 1 : 16
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
     SABER SI ES TURNO DE DÍA
  ===================================================== */

  const esTurnoDia = (
    turno
  ) => {
    if (!turno) {
      return false;
    }

    const valor =
      String(turno)
        .trim()
        .toLowerCase();

    return (
      valor === "dia" ||
      valor === "día"
    );
  };


  /* =====================================================
     SELECCIONAR CELDA
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
     ELIMINAR CELDA
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
      <div className="calendario-header">

        <div>

          <span className="calendario-label">
            PROGRAMACIÓN QUINCENAL
          </span>

          <h3>
            {nombreMes}
          </h3>

          <p>
            {textoQuincena}
          </p>

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
            title="Quincena anterior"
            aria-label="Quincena anterior"
          >
            ‹
          </button>


          <button
            type="button"
            className="btn-arrow"
            onClick={() =>
              cambiarPeriodo(1)
            }
            title="Siguiente quincena"
            aria-label="Siguiente quincena"
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


                {dias.map(
                  (fecha) => {

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
                  }
                )}

              </div>

            )
          )}

        </div>

      </div>
    </>
  );
}

export default Calendario;
