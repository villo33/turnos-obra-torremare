import { useState } from "react";

function Administracion() {
  const [nombreObra, setNombreObra] = useState("Torre Mare");
  const [ubicacion, setUbicacion] = useState("");
  const [horaInicioDia, setHoraInicioDia] = useState("06:00");
  const [horaFinDia, setHoraFinDia] = useState("18:00");
  const [horaInicioNoche, setHoraInicioNoche] = useState("18:00");
  const [horaFinNoche, setHoraFinNoche] = useState("06:00");

  const [guardado, setGuardado] = useState(false);

  const guardarConfiguracion = (e) => {
    e.preventDefault();

    setGuardado(true);

    setTimeout(() => {
      setGuardado(false);
    }, 2500);
  };

  return (
    <main className="administracion-page">

      <div className="administracion-header">

        <div>
          <span className="page-label">
            CONFIGURACIÓN
          </span>

          <h2>
            Administración
          </h2>

          <p>
            Configura la información general y los horarios de la obra.
          </p>
        </div>

      </div>


      <div className="administracion-grid">

        <section className="admin-panel">

          <div className="admin-panel-header">

            <div className="admin-panel-icon">
              ⚙
            </div>

            <div>
              <span>
                INFORMACIÓN GENERAL
              </span>

              <h3>
                Datos de la obra
              </h3>
            </div>

          </div>


          <form
            className="admin-form"
            onSubmit={guardarConfiguracion}
          >

            <div className="form-group">

              <label>
                Nombre de la obra
              </label>

              <input
                type="text"
                value={nombreObra}
                onChange={(e) =>
                  setNombreObra(e.target.value)
                }
                placeholder="Nombre de la obra"
              />

            </div>


            <div className="form-group">

              <label>
                Ubicación
              </label>

              <input
                type="text"
                value={ubicacion}
                onChange={(e) =>
                  setUbicacion(e.target.value)
                }
                placeholder="Ej. Cartagena, Bolívar"
              />

            </div>


            <div className="form-section-title">
              Horarios de trabajo
            </div>


            <div className="horarios-grid">

              <div className="horario-card dia">

                <div className="horario-title">
                  <span>
                    ☀
                  </span>

                  <strong>
                    Turno de día
                  </strong>
                </div>


                <div className="horario-inputs">

                  <div>
                    <label>
                      Entrada
                    </label>

                    <input
                      type="time"
                      value={horaInicioDia}
                      onChange={(e) =>
                        setHoraInicioDia(
                          e.target.value
                        )
                      }
                    />
                  </div>


                  <div>
                    <label>
                      Salida
                    </label>

                    <input
                      type="time"
                      value={horaFinDia}
                      onChange={(e) =>
                        setHoraFinDia(
                          e.target.value
                        )
                      }
                    />
                  </div>

                </div>

              </div>


              <div className="horario-card noche">

                <div className="horario-title">
                  <span>
                    ☾
                  </span>

                  <strong>
                    Turno de noche
                  </strong>
                </div>


                <div className="horario-inputs">

                  <div>
                    <label>
                      Entrada
                    </label>

                    <input
                      type="time"
                      value={horaInicioNoche}
                      onChange={(e) =>
                        setHoraInicioNoche(
                          e.target.value
                        )
                      }
                    />
                  </div>


                  <div>
                    <label>
                      Salida
                    </label>

                    <input
                      type="time"
                      value={horaFinNoche}
                      onChange={(e) =>
                        setHoraFinNoche(
                          e.target.value
                        )
                      }
                    />
                  </div>

                </div>

              </div>

            </div>


            <div className="admin-form-footer">

              {guardado && (
                <span className="saved-message">
                  ✓ Configuración guardada
                </span>
              )}

              <button
                type="submit"
                className="btn-save-admin"
              >
                Guardar configuración
              </button>

            </div>

          </form>

        </section>

      </div>

    </main>
  );
}

export default Administracion;
