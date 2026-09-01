import { useState } from "react";

function Navbar({
  paginaActual,
  cambiarPagina,
  esAdministrador = false,
}) {
  const [menuAbierto, setMenuAbierto] =
    useState(false);

  const opciones = [
    {
      id: "inicio",
      icono: "⌂",
      nombre: "Inicio",
    },
    {
      id: "calendario",
      icono: "▦",
      nombre: "Calendario",
    },
  ];

  if (esAdministrador) {
    opciones.push(
      {
        id: "trabajadores",
        icono: "♙",
        nombre: "Trabajadores",
      },
      {
        id: "administracion",
        icono: "⚙",
        nombre: "Administración",
      }
    );
  }

  const seleccionarPagina = (pagina) => {
    cambiarPagina(pagina);
    setMenuAbierto(false);
  };

  return (
    <>
      <button
        type="button"
        className="mobile-menu-button"
        onClick={() =>
          setMenuAbierto(!menuAbierto)
        }
        aria-label="Abrir menú"
      >
        ☰
      </button>

      {menuAbierto && (
        <div
          className="mobile-menu-overlay"
          onClick={() =>
            setMenuAbierto(false)
          }
        />
      )}

      <aside
        className={`sidebar ${
          menuAbierto
            ? "sidebar-open"
            : ""
        }`}
      >

        <div className="brand">

          <div className="brand-icon">
            ◈
          </div>

          <div>
            <h1>
              Turnos Obra
            </h1>

            <span>
              TORREMARE
            </span>
          </div>

        </div>


        <nav className="menu">

          <div className="menu-title">
            MENÚ PRINCIPAL
          </div>

          {opciones.map((opcion) => (

            <button
              type="button"
              key={opcion.id}
              className={`menu-item ${
                paginaActual ===
                opcion.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                seleccionarPagina(
                  opcion.id
                )
              }
            >

              <span>
                {opcion.icono}
              </span>

              <label>
                {opcion.nombre}
              </label>

            </button>

          ))}

        </nav>


        <div className="sidebar-bottom">

          <div className="user-mini">

            <div className="avatar">
              {esAdministrador
                ? "A"
                : "T"}
            </div>

            <div>

              <strong>
                {esAdministrador
                  ? "Administración"
                  : "Trabajador"}
              </strong>

              <span>
                {esAdministrador
                  ? "Control de obra"
                  : "Personal de obra"}
              </span>

            </div>

          </div>

        </div>

      </aside>
    </>
  );
}

export default Navbar;