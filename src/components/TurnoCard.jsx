function TurnoCard({ tipo, onClick }) {
  const esDia = tipo === "dia";

  return (
    <button
      type="button"
      className={`turno-card ${
        esDia ? "turno-card-dia" : "turno-card-noche"
      }`}
      onClick={onClick}
      title="Haz clic para quitar este turno"
    >
      <span className="turno-card-icon">
        {esDia ? "☀" : "☾"}
      </span>

      <span className="turno-card-content">
        <strong>
          {esDia ? "DÍA" : "NOCHE"}
        </strong>

        <small>
          {esDia
            ? "06:00 — 18:00"
            : "18:00 — 06:00"}
        </small>
      </span>
    </button>
  );
}

export default TurnoCard;