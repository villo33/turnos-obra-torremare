import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";

import Inicio from "./pages/Inicio";
import CalendarioPage from "./pages/CalendarioPage";
import Trabajadores from "./pages/Trabajadores";
import Administracion from "./pages/Administracion";
import Login from "./pages/Login";

import { supabase } from "./services/supabase";
import { obtenerTrabajadores } from "./services/trabajadoresService";

function App() {
  const [sesion, setSesion] = useState(null);
  const [perfil, setPerfil] = useState(null);

  const [comprobandoSesion, setComprobandoSesion] =
    useState(true);

  const [paginaActual, setPaginaActual] =
    useState("inicio");

  const [trabajadores, setTrabajadores] =
    useState([]);

  const [turnos, setTurnos] =
    useState({});

  const [cargandoTrabajadores, setCargandoTrabajadores] =
    useState(false);

  /* =====================================================
     OBTENER PERFIL
  ===================================================== */

  const obtenerPerfil = async (usuario) => {
    if (!usuario) {
      setPerfil(null);
      return null;
    }

    const { data, error } = await supabase
      .from("obra_perfiles")
      .select(`
        id,
        nombre,
        rol,
        trabajador_id,
        activo
      `)
      .eq("id", usuario.id)
      .single();

    if (error) {
      console.error(
        "Error obteniendo perfil:",
        error
      );

      await supabase.auth.signOut();

      setSesion(null);
      setPerfil(null);

      return null;
    }

    if (!data.activo) {
      await supabase.auth.signOut();

      setSesion(null);
      setPerfil(null);

      return null;
    }

    setPerfil(data);

    return data;
  };

  /* =====================================================
     COMPROBAR SESIÓN
  ===================================================== */

  useEffect(() => {
    let montado = true;

    const comprobarSesion = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!montado) {
          return;
        }

        if (session) {
          setSesion(session);
          await obtenerPerfil(session.user);
        } else {
          setSesion(null);
          setPerfil(null);
        }
      } catch (error) {
        console.error(
          "Error comprobando sesión:",
          error
        );

        if (montado) {
          setSesion(null);
          setPerfil(null);
        }
      } finally {
        if (montado) {
          setComprobandoSesion(false);
        }
      }
    };

    comprobarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!montado) {
          return;
        }

        setSesion(session);

        if (session) {
          await obtenerPerfil(session.user);
        } else {
          setPerfil(null);
        }
      }
    );

    return () => {
      montado = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =====================================================
     CARGAR TRABAJADORES
  ===================================================== */

  useEffect(() => {
    if (!sesion || !perfil) {
      return;
    }

    async function cargarTrabajadores() {
      try {
        setCargandoTrabajadores(true);

        const datos =
          await obtenerTrabajadores();

        setTrabajadores(datos);
      } catch (error) {
        console.error(
          "Error cargando trabajadores:",
          error
        );
      } finally {
        setCargandoTrabajadores(false);
      }
    }

    cargarTrabajadores();
  }, [sesion, perfil]);

  /* =====================================================
     CERRAR SESIÓN
  ===================================================== */

  const cerrarSesion = async () => {
    await supabase.auth.signOut();

    setSesion(null);
    setPerfil(null);
    setPaginaActual("inicio");
    setTrabajadores([]);
    setTurnos({});
  };

  /* =====================================================
     CAMBIAR PÁGINA
  ===================================================== */

  const cambiarPagina = (pagina) => {
    if (
      perfil?.rol !== "admin" &&
      (
        pagina === "trabajadores" ||
        pagina === "administracion"
      )
    ) {
      setPaginaActual("inicio");
      return;
    }

    setPaginaActual(pagina);
  };

  /* =====================================================
     MOSTRAR PÁGINA
  ===================================================== */

  const mostrarPagina = () => {
    switch (paginaActual) {

      case "calendario":
        return (
          <CalendarioPage
            trabajadores={trabajadores}
            turnos={turnos}
            setTurnos={setTurnos}
            esAdministrador={
              perfil?.rol === "admin"
            }
          />
        );

      case "trabajadores":

        if (perfil?.rol !== "admin") {
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

        return (
          <Trabajadores
            trabajadores={trabajadores}
            setTrabajadores={setTrabajadores}
          />
        );

      case "administracion":

        if (perfil?.rol !== "admin") {
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

  /* =====================================================
     TÍTULOS
  ===================================================== */

  const tituloPagina = {
    inicio: "Panel principal",
    calendario: "Calendario de turnos",
    trabajadores: "Trabajadores",
    administracion: "Administración",
  };

  /* =====================================================
     COMPROBANDO SESIÓN
  ===================================================== */

  if (comprobandoSesion) {
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
        <strong>
          Comprobando sesión...
        </strong>
      </div>
    );
  }

  /* =====================================================
     LOGIN
  ===================================================== */

  if (!sesion || !perfil) {
    return (
      <Login
        onLogin={async (resultado) => {
          const usuario =
            resultado?.usuario || resultado;

          const perfilLogin =
            resultado?.perfil || null;

          setSesion({
            user: usuario,
          });

          if (perfilLogin) {
            setPerfil(perfilLogin);
          } else {
            await obtenerPerfil(usuario);
          }
        }}
      />
    );
  }

  /* =====================================================
     INFORMACIÓN DEL USUARIO
  ===================================================== */

  const esAdministrador =
    perfil.rol === "admin";

  const nombreUsuario =
    perfil.nombre ||
    sesion.user.email ||
    "Usuario";

  const inicial =
    nombreUsuario
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "U";

  /* =====================================================
     APLICACIÓN
  ===================================================== */

  return (
    <div className="app">

      <Navbar
        paginaActual={paginaActual}
        cambiarPagina={cambiarPagina}
        esAdministrador={esAdministrador}
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
                {inicial}
              </div>

              <div>

                <strong>
                  {nombreUsuario}
                </strong>

                <span>
                  {esAdministrador
                    ? "Administración"
                    : "Trabajador"}
                </span>

              </div>

            </div>

            <button
              type="button"
              onClick={cerrarSesion}
              className="btn-logout"
            >
              Cerrar sesión
            </button>

          </div>

        </header>

        {cargandoTrabajadores ? (

          <div
            style={{
              padding: "40px",
              textAlign: "center",
            }}
          >
            Cargando trabajadores...
          </div>

        ) : (

          mostrarPagina()

        )}

      </div>

    </div>
  );
}

export default App;