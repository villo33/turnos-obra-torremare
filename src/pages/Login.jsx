import { useState } from "react";
import { supabase } from "../services/supabase";

function Login({ onLogin }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const iniciarSesion = async (e) => {
    e.preventDefault();

    setError("");

    if (!correo.trim() || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    try {
      setCargando(true);

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: correo.trim(),
          password,
        });

      if (error) {
        throw error;
      }

      const usuario = data.user;

      const { data: perfil, error: errorPerfil } =
        await supabase
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

      if (errorPerfil) {
        console.error(
          "Error obteniendo perfil:",
          errorPerfil
        );

        await supabase.auth.signOut();

        throw new Error(
          "No existe un perfil configurado para este usuario."
        );
      }

      if (!perfil.activo) {
        await supabase.auth.signOut();

        throw new Error(
          "Este usuario está desactivado."
        );
      }

      console.log("Sesión iniciada:", usuario);
      console.log("Perfil:", perfil);
      console.log("Rol:", perfil.rol);

      onLogin({
        usuario,
        perfil,
      });

    } catch (error) {
      console.error(
        "Error de inicio de sesión:",
        error
      );

      if (
        error.message ===
        "No existe un perfil configurado para este usuario."
      ) {
        setError(error.message);
      } else if (
        error.message ===
        "Este usuario está desactivado."
      ) {
        setError(error.message);
      } else {
        setError(
          "Correo o contraseña incorrectos."
        );
      }

    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="login-page">

      <div className="login-card">

        <div className="login-brand">

          <div className="login-logo">
            TM
          </div>

          <div>
            <h1>
              Torre Mare
            </h1>

            <span>
              Control de obra
            </span>
          </div>

        </div>


        <div className="login-heading">

          <span>
            ACCESO AL SISTEMA
          </span>

          <h2>
            Bienvenido
          </h2>

          <p>
            Ingresa tus datos para continuar.
          </p>

        </div>


        <form
          className="login-form"
          onSubmit={iniciarSesion}
        >

          <div className="login-field">

            <label>
              Correo electrónico
            </label>

            <input
              type="email"
              value={correo}
              onChange={(e) =>
                setCorreo(e.target.value)
              }
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              disabled={cargando}
            />

          </div>


          <div className="login-field">

            <label>
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={cargando}
            />

          </div>


          {error && (
            <div className="login-error">
              {error}
            </div>
          )}


          <button
            type="submit"
            className="login-button"
            disabled={cargando}
          >
            {cargando
              ? "Iniciando sesión..."
              : "Iniciar sesión"}
          </button>

        </form>


        <div className="login-footer">
          Torre Mare · Control de obra
        </div>

      </div>

    </main>
  );
}

export default Login;