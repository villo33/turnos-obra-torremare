import { useState } from "react";

function Trabajadores({
  trabajadores = [],
  setTrabajadores,
}) {
  const [nombre, setNombre] = useState("");
  const [cargo, setCargo] = useState("Vigilante");
  const [editando, setEditando] = useState(null);

  const guardarTrabajador = (e) => {
    e.preventDefault();

    const nombreLimpio = nombre.trim();
    const cargoLimpio = cargo.trim();

    if (!nombreLimpio) {
      return;
    }

    if (editando !== null) {
      setTrabajadores((actuales) =>
        actuales.map((trabajador) =>
          trabajador.id === editando
            ? {
                ...trabajador,
                nombre: nombreLimpio,
                cargo: cargoLimpio || "Vigilante",
              }
            : trabajador
        )
      );

      cancelarEdicion();
      return;
    }

    const nuevoTrabajador = {
      id: Date.now(),
      nombre: nombreLimpio,
      cargo: cargoLimpio || "Vigilante",
    };

    setTrabajadores((actuales) => [
      ...actuales,
      nuevoTrabajador,
    ]);

    setNombre("");
    setCargo("Vigilante");
  };

  const editarTrabajador = (trabajador) => {
    setEditando(trabajador.id);
    setNombre(trabajador.nombre);
    setCargo(trabajador.cargo || "Vigilante");
  };

  const eliminarTrabajador = (id) => {
    const trabajador = trabajadores.find(
      (item) => item.id === id
    );

    const confirmar = window.confirm(
      `¿Deseas eliminar a ${trabajador?.nombre || "este trabajador"}?`
    );

    if (!confirmar) {
      return;
    }

    setTrabajadores((actuales) =>
      actuales.filter(
        (trabajador) => trabajador.id !== id
      )
    );

    if (editando === id) {
      cancelarEdicion();
    }
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNombre("");
    setCargo("Vigilante");
  };

  return (
    <main className="trabajadores-page">

      <div className="trabajadores-header">

        <div>
          <span className="page-label">
            PERSONAL DE LA OBRA
          </span>

          <h2>
            Trabajadores
          </h2>

          <p>
            Administra las personas encargadas de los turnos.
          </p>
        </div>

        <div className="total-trabajadores">

          <strong>
            {trabajadores.length}
          </strong>

          <span>
            trabajadores
          </span>

        </div>

      </div>


      <div className="trabajadores-grid">

        <section className="trabajadores-panel">

          <div className="panel-title">

            <div>
              <span>
                EQUIPO
              </span>

              <h3>
                Personal registrado
              </h3>
            </div>

          </div>


          <div className="trabajadores-list">

            {trabajadores.length === 0 && (
              <div className="sin-trabajadores">

                <div>
                  👥
                </div>

                <strong>
                  No hay trabajadores
                </strong>

                <span>
                  Agrega el primer trabajador.
                </span>

              </div>
            )}


            {trabajadores.map((trabajador) => {

              const inicial =
                trabajador.nombre
                  .trim()
                  .charAt(0)
                  .toUpperCase();

              return (
                <div
                  className="trabajador-item"
                  key={trabajador.id}
                >

                  <div className="trabajador-avatar">
                    {inicial}
                  </div>


                  <div className="trabajador-info">

                    <strong>
                      {trabajador.nombre}
                    </strong>

                    <span>
                      {trabajador.cargo || "Vigilante"}
                    </span>

                  </div>


                  <div className="trabajador-actions">

                    <button
                      type="button"
                      className="btn-edit"
                      onClick={() =>
                        editarTrabajador(trabajador)
                      }
                    >
                      Editar
                    </button>


                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() =>
                        eliminarTrabajador(
                          trabajador.id
                        )
                      }
                    >
                      Eliminar
                    </button>

                  </div>

                </div>
              );
            })}

          </div>

        </section>


        <section className="trabajador-form-panel">

          <div className="panel-title">

            <div>

              <span>
                {editando !== null
                  ? "MODIFICAR PERSONAL"
                  : "NUEVO PERSONAL"}
              </span>

              <h3>
                {editando !== null
                  ? "Editar trabajador"
                  : "Agregar trabajador"}
              </h3>

            </div>

          </div>


          <form
            className="trabajador-form"
            onSubmit={guardarTrabajador}
          >

            <div>

              <label>
                Nombre completo
              </label>

              <input
                type="text"
                value={nombre}
                onChange={(e) =>
                  setNombre(e.target.value)
                }
                placeholder="Ej. Carlos Pérez"
                autoComplete="off"
              />

            </div>


            <div>

              <label>
                Cargo
              </label>

              <input
                type="text"
                value={cargo}
                onChange={(e) =>
                  setCargo(e.target.value)
                }
                placeholder="Ej. Vigilante"
                autoComplete="off"
              />

            </div>


            <div className="form-buttons">

              <button
                type="submit"
                className="btn-save"
              >
                {editando !== null
                  ? "Guardar cambios"
                  : "Agregar trabajador"}
              </button>


              {editando !== null && (
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={cancelarEdicion}
                >
                  Cancelar
                </button>
              )}

            </div>

          </form>

        </section>

      </div>

    </main>
  );
}

export default Trabajadores;