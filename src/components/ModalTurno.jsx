function ModalTurno({
  abierto,
  fecha,
  trabajador,
  onSeleccionar,
  onCerrar,
}) {
  if (!abierto) {
    return null;
  }

  const formatoFecha = fecha
    ? fecha.toLocaleDateString("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";

  return (
    <div
      className="modal-overlay"
      onMouseDown={onCerrar}
    >
      <div
        className="modal-turno"
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >

        <div className="modal-header">

          <div>
            <span className="modal-label">
              ASIGNAR TURNO
            </span>

            <h3>
              Seleccionar horario
            </h3>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ×
          </button>

        </div>


        <div className="modal-person">

          <div className="modal-avatar">
            {trabajador?.nombre
              ?.trim()
              ?.charAt(0)
              ?.toUpperCase() || "?"}
          </div>

          <div>
            <strong>
              {trabajador?.nombre ||
                "Trabajador"}
            </strong>

            <span>
              {trabajador?.cargo ||
                "Vigilante"}
            </span>
          </div>

        </div>


        <div className="modal-date">

          <span>
            FECHA
          </span>

          <strong>
            {formatoFecha}
          </strong>

        </div>


        <div className="turno-options">

          <button
            type="button"
            className="turno-option turno-dia"
            onClick={() =>
              onSeleccionar("dia")
            }
          >

            <div className="turno-option-icon">
              ☀
            </div>

            <div>
              <strong>
                Turno de día
              </strong>

              <span>
                Jornada diurna
              </span>
            </div>

            <b>
              ›
            </b>

          </button>


          <button
            type="button"
            className="turno-option turno-noche"
            onClick={() =>
              onSeleccionar("noche")
            }
          >

            <div className="turno-option-icon">
              ☾
            </div>

            <div>
              <strong>
                Turno de noche
              </strong>

              <span>
                Jornada nocturna
              </span>
            </div>

            <b>
              ›
            </b>

          </button>

        </div>


        <div className="modal-footer">

          <button
            type="button"
            className="modal-cancel"
            onClick={onCerrar}
          >
            Cancelar
          </button>

        </div>

      </div>
    </div>
  );
}

export default ModalTurno;