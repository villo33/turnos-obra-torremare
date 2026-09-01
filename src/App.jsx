import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";

import Inicio from "./pages/Inicio";
import CalendarioPage from "./pages/CalendarioPage";
import Trabajadores from "./pages/Trabajadores";
import Administracion from "./pages/Administracion";

import { obtenerTrabajadores } from "./services/trabajadoresService";

function App() {
  const [paginaActual, setPaginaActual] =
    useState("inicio");

  const [trabajadores, setTrabajadores] =
    useState([]);

  const [turnos, setTurnos] =
    useState({});

  const [cargando, setCargando] =
    useState(true);

  const [errorSupabase, setErrorSupabase] =
    useState(null);

  useEffect(() => {
    async function cargarTrabajadores() {
      try {
        setCargando(true);
        setErrorSupabase(null);

        const datos =
          await obtenerTrabajadores();

        console.log(
          "TRABAJADORES DESDE SUPABASE:",
          datos
        );

        setTrabajadores(datos || []);

      } catch (error) {
        console.error(
          "ERROR SUPABASE:",
          error
        );

        setErrorSupabase(
          error?.message ||
          "No se pudieron cargar los trabajadores."
        );

      } finally {
        setCargando(false);
      }
    }

    cargarTrabajadores();
  }, []);

  const cambiarPagina = (pagina) => {
    setPaginaActual(pagina);
  };

  const mostrarPagina = () => {
    switch (paginaActual) {
      case "calendario":
        return (
          <CalendarioPage
            trabajadores={trabajadores}
            turnos={turnos}
            setTurnos={setTurnos}
          />
        );

      case "trabajadores":
        return (
          <Trabajadores
            trabajadores={trabajadores}
            setTrabajadores={setTrabajadores}
          />
        );

      case "administracion":
        return <Administracion />;

      case "inicio":
      default:
        return (
          <Inicio
            trabajadores={trabajadores}
            turnos={turnos}
            onIrCalendario={() =>
              cambiarPagina("calendario")
            }
          />
        );
    }
  };

  const tituloPagina = {
    inicio: "Panel principal",
    calendario: "Calendario de turnos",
    trabajadores: "Trabajadores",
    administracion: "Administración",
  };

  if (cargando) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7fa",
          color: "#344054",
          fontFamily:
            "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "30px",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              marginBottom: "10px",
            }}
          >
            ◌
          </div>

          <strong>
            Cargando programación...
          </strong>

          <p
            style={{
              marginTop: "6px",
              color: "#98a2b3",
              fontSize: "12px",
            }}
          >
            Conectando con Supabase
          </p>
        </div>
      </div>
    );
  }

  if (errorSupabase) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7fa",
          padding: "20px",
          fontFamily:
            "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "520px",
            background: "#ffffff",
            border: "1px solid #eaecf0",
            borderRadius: "14px",
            padding: "30px",
            boxShadow:
              "0 4px 15px rgba(16, 24, 40, 0.05)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#fef3f2",
              color: "#d92d20",
              display: "grid",
              placeItems: "center",
              fontSize: "22px",
              marginBottom: "18px",
            }}
          >
            !
          </div>

          <h2
            style={{
              margin: 0,
              color: "#101828",
              fontSize: "20px",
            }}
          >
            Error de conexión
          </h2>

          <p
            style={{
              color: "#667085",
              fontSize: "13px",
              lineHeight: "1.6",
              marginTop: "8px",
            }}
          >
            No fue posible cargar los trabajadores
            desde Supabase.
          </p>

          <div
            style={{
              marginTop: "18px",
              padding: "14px",
              borderRadius: "8px",
              background: "#f9fafb",
              border: "1px solid #eaecf0",
              color: "#344054",
              fontSize: "12px",
              lineHeight: "1.5",
              wordBreak: "break-word",
            }}
          >
            {errorSupabase}
          </div>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            style={{
              marginTop: "18px",
              width: "100%",
              height: "42px",
              border: 0,
              borderRadius: "8px",
              background: "#175cd3",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">

      <Navbar
        paginaActual={paginaActual}
        cambiarPagina={cambiarPagina}
      />

      <div className="main-content">

        <header className="topbar">

          <div>
            <span className="breadcrumb">
              TORRE MARE / CONTROL DE OBRA
            </span>

            <h2>
              {tituloPagina[paginaActual]}
            </h2>
          </div>

          <div className="topbar-actions">

            <button
              type="button"
              className="notification"
              title="Notificaciones"
            >
              ♢
            </button>

            <div className="profile">

              <div className="avatar">
                A
              </div>

              <div>
                <strong>
                  Administración
                </strong>

                <span>
                  Coordinación de obra
                </span>
              </div>

            </div>

          </div>

        </header>

        {mostrarPagina()}

      </div>

    </div>
  );
}

export default App;