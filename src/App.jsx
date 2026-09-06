import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";

import Inicio from "./pages/Inicio";
import CalendarioPage from "./pages/CalendarioPage";
import Trabajadores from "./pages/Trabajadores";
import Administracion from "./pages/Administracion";
import Login from "./pages/Login";

import { supabase } from "./services/supabase";

import { obtenerTrabajadores } from "./services/trabajadoresService";

import {
  obtenerNotificaciones,
  confirmarRecepcionHorario,
  obtenerConfirmacionesTrabajador,
  suscribirseANotificaciones,
} from "./services/notificacionesService";


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

  const [notificaciones, setNotificaciones] =
    useState([]);

  const [notificacionesAbiertas, setNotificacionesAbiertas] =
    useState(false);

  const [confirmandoNotificacion, setConfirmandoNotificacion] =
    useState(null);

  const [notificacionesConfirmadas, setNotificacionesConfirmadas] =
    useState([]);


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

      .eq(
        "id",
        usuario.id
      )

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
          data: {
            session,
          },
        } = await supabase.auth.getSession();


        if (!montado) {

          return;

        }


        if (session) {

          setSesion(session);

          await obtenerPerfil(
            session.user
          );

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
      data: {
        subscription,
      },
    } = supabase.auth.onAuthStateChange(

      async (_event, session) => {

        if (!montado) {

          return;

        }


        setSesion(session);


        if (session) {

          await obtenerPerfil(
            session.user
          );

        } else {

          setPerfil(null);

          setNotificaciones([]);

          setNotificacionesConfirmadas([]);

          setConfirmandoNotificacion(null);

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

    if (
      !sesion ||
      !perfil
    ) {

      return;

    }


    async function cargarTrabajadores() {

      try {

        setCargandoTrabajadores(true);


        const datos =
          await obtenerTrabajadores();


        setTrabajadores(
          datos || []
        );


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

  }, [
    sesion,
    perfil
  ]);


  /* =====================================================
     BUSCAR ID NUMÉRICO DEL TRABAJADOR
  ===================================================== */

  const obtenerIdNumericoTrabajador = () => {

    if (
      !sesion?.user?.id ||
      !Array.isArray(trabajadores) ||
      trabajadores.length === 0
    ) {

      return null;

    }


    const uuidUsuario =
      String(
        sesion.user.id
      );


    const trabajadorEncontrado =
      trabajadores.find(

        (trabajador) =>

          trabajador &&
          trabajador.user_id &&
          String(
            trabajador.user_id
          ) === uuidUsuario

      );


    if (!trabajadorEncontrado) {

      console.error(
        "❌ No se encontró trabajador relacionado con el usuario:",
        uuidUsuario
      );

      return null;

    }


    const idNumerico =
      Number(
        trabajadorEncontrado.id
      );


    if (
      !Number.isInteger(idNumerico) ||
      idNumerico <= 0
    ) {

      console.error(
        "❌ El ID del trabajador no es numérico:",
        trabajadorEncontrado
      );

      return null;

    }


    console.log(
      "👤 TRABAJADOR ENCONTRADO:",
      trabajadorEncontrado
    );


    console.log(
      "🆔 UUID USUARIO:",
      uuidUsuario
    );


    console.log(
      "🔢 ID NUMÉRICO TRABAJADOR:",
      idNumerico
    );


    return idNumerico;

  };


  /* =====================================================
     CARGAR NOTIFICACIONES DEL USUARIO
  ===================================================== */

  useEffect(() => {

    if (
      !sesion ||
      !perfil
    ) {

      setNotificaciones([]);

      setNotificacionesConfirmadas([]);

      return;

    }


    const cargarNotificaciones = async () => {

      try {

        const datos =
          await obtenerNotificaciones();


        /* =================================================
           ADMINISTRADOR
        ================================================= */

        if (
          perfil.rol === "admin"
        ) {

          setNotificaciones(
            datos || []
          );

          setNotificacionesConfirmadas([]);


          console.log(
            "🔔 NOTIFICACIONES ADMIN:",
            datos
          );


          return;

        }


        /* =================================================
           ID NUMÉRICO DEL TRABAJADOR
        ================================================= */

        const trabajadorIdNumerico =
          obtenerIdNumericoTrabajador();


        if (
          !trabajadorIdNumerico
        ) {

          console.warn(
            "⚠️ Todavía no se pudo obtener el ID numérico del trabajador."
          );


          setNotificaciones([]);

          setNotificacionesConfirmadas([]);

          return;

        }


        /* =================================================
           OBTENER CONFIRMACIONES
        ================================================= */

        const confirmaciones =
          await obtenerConfirmacionesTrabajador(
            trabajadorIdNumerico
          );


        /* =================================================
           FILTRAR NOTIFICACIONES
        ================================================= */

        const notificacionesActivas =
          (datos || []).filter(

            (notificacion) => {

              /* ===========================================
                 LA NOTIFICACIÓN PERTENECE AL USUARIO
              =========================================== */

              if (
                String(
                  notificacion.trabajador_id
                ) !==
                String(
                  sesion.user.id
                )
              ) {

                return false;

              }


              /* ===========================================
                 VERIFICAR SI YA FUE CONFIRMADA

                 IMPORTANTE:
                 notificacion.id = UUID
                 notificacion_id = UUID
              =========================================== */

              if (
                notificacion.tipo ===
                "horario"
              ) {

                const yaConfirmada =
                  (confirmaciones || []).some(

                    (confirmacion) =>

                      confirmacion.confirmado === true &&

                      confirmacion.notificacion_id &&

                      String(
                        confirmacion.notificacion_id
                      ) ===
                      String(
                        notificacion.id
                      )

                  );


                if (
                  yaConfirmada
                ) {

                  return false;

                }

              }


              return true;

            }

          );


        setNotificaciones(
          notificacionesActivas
        );


        /* =================================================
           GUARDAR UUID DE CONFIRMACIONES
        ================================================= */

        setNotificacionesConfirmadas(

          (confirmaciones || [])

            .filter(
              (confirmacion) =>
                confirmacion.confirmado === true &&
                confirmacion.notificacion_id
            )

            .map(
              (confirmacion) =>
                String(
                  confirmacion.notificacion_id
                )
            )

        );


        console.log(
          "🔔 NOTIFICACIONES ACTIVAS:",
          notificacionesActivas
        );


        console.log(
          "✅ CONFIRMACIONES ENCONTRADAS:",
          confirmaciones
        );


      } catch (error) {

        console.error(
          "Error cargando notificaciones:",
          error
        );


        setNotificaciones([]);

        setNotificacionesConfirmadas([]);

      }

    };


    cargarNotificaciones();

  }, [
    sesion,
    perfil,
    trabajadores
  ]);


  /* =====================================================
     ESCUCHAR NUEVAS NOTIFICACIONES EN TIEMPO REAL
  ===================================================== */

  useEffect(() => {

    if (
      !sesion ||
      !perfil
    ) {

      return;

    }


    const cancelarSuscripcion =
      suscribirseANotificaciones(

        (nuevaNotificacion) => {

          if (
            !nuevaNotificacion
          ) {

            return;

          }


          /* =============================================
             TRABAJADOR
          ============================================= */

          if (
            perfil.rol !== "admin"
          ) {

            if (
              String(
                nuevaNotificacion.trabajador_id
              ) !==
              String(
                sesion.user.id
              )
            ) {

              return;

            }


            setNotificaciones(
              (anteriores) => {

                const yaExiste =
                  anteriores.some(

                    (notificacion) =>

                      String(
                        notificacion.id
                      ) ===
                      String(
                        nuevaNotificacion.id
                      )

                  );


                if (
                  yaExiste
                ) {

                  return anteriores;

                }


                return [
                  nuevaNotificacion,
                  ...anteriores,
                ];

              }
            );


            return;

          }


          /* =============================================
             ADMINISTRADOR
          ============================================= */

          setNotificaciones(
            (anteriores) => {

              const yaExiste =
                anteriores.some(

                  (notificacion) =>

                    String(
                      notificacion.id
                    ) ===
                    String(
                      nuevaNotificacion.id
                    )

                );


              if (
                yaExiste
              ) {

                return anteriores;

              }


              return [
                nuevaNotificacion,
                ...anteriores,
              ];

            }
          );

        }

      );


    return () => {

      if (
        typeof cancelarSuscripcion ===
        "function"
      ) {

        cancelarSuscripcion();

      }

    };

  }, [
    sesion,
    perfil
  ]);


  /* =====================================================
     COMPROBAR NUEVOS TURNOS DEL TRABAJADOR
  ===================================================== */

  useEffect(() => {

    if (
      !perfil ||
      perfil.rol === "admin" ||
      !sesion
    ) {

      return;

    }


    if (
      !trabajadores ||
      trabajadores.length === 0
    ) {

      return;

    }


    const trabajadorIdNumerico =
      obtenerIdNumericoTrabajador();


    if (
      !trabajadorIdNumerico
    ) {

      return;

    }


    const comprobarTurnos = async () => {

      try {

        const {
          data,
          error
        } = await supabase

          .from("obra_turnos")

          .select(`
            id,
            trabajador_id,
            fecha,
            tipo
          `)

          .eq(
            "trabajador_id",
            trabajadorIdNumerico
          )

          .order(
            "created_at",
            {
              ascending: false,
            }
          )

          .limit(1);


        if (error) {

          console.error(
            "Error comprobando turnos:",
            error
          );

          return;

        }


        if (
          data &&
          data.length > 0
        ) {

          console.log(
            "🔔 TURNO ENCONTRADO PARA EL TRABAJADOR:",
            data[0]
          );

        }

      } catch (error) {

        console.error(
          "Error comprobando turnos:",
          error
        );

      }

    };


    comprobarTurnos();

  }, [
    perfil,
    sesion,
    trabajadores
  ]);


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

    setNotificaciones([]);

    setNotificacionesAbiertas(false);

    setNotificacionesConfirmadas([]);

    setConfirmandoNotificacion(null);

  };


  /* =====================================================
     CONFIRMAR NOTIFICACIÓN
  ===================================================== */

  const confirmarNotificacion = async (
    notificacion
  ) => {

    console.log(
      "🟢 CLICK EN CONFIRMAR:",
      notificacion
    );


    try {

      if (
        !sesion?.user?.id ||
        !perfil
      ) {

        alert(
          "No se pudo identificar al trabajador."
        );

        return;

      }


      if (
        !notificacion?.id
      ) {

        alert(
          "Esta notificación no tiene un ID válido."
        );

        return;

      }


      if (
        !notificacion?.fecha_turno
      ) {

        alert(
          "Esta notificación no tiene una fecha de turno."
        );

        return;

      }


      if (
        confirmandoNotificacion ===
        notificacion.id
      ) {

        return;

      }


      /* =================================================
         OBTENER ID NUMÉRICO REAL
      ================================================= */

      const trabajadorIdNumerico =
        obtenerIdNumericoTrabajador();


      if (
        !trabajadorIdNumerico
      ) {

        console.error(
          "❌ No se encontró el ID numérico del trabajador.",
          {
            usuarioUUID:
              sesion.user.id,

            trabajadores:
              trabajadores,

            perfil:
              perfil,
          }
        );


        alert(
          "No se encontró el trabajador relacionado con esta cuenta."
        );

        return;

      }


      /* =================================================
         BLOQUEAR BOTÓN
      ================================================= */

      setConfirmandoNotificacion(
        notificacion.id
      );


      console.log(
        "🔐 CONFIRMANDO NOTIFICACIÓN:",
        {
          notificacionId:
            notificacion.id,

          trabajadorIdNumerico:
            trabajadorIdNumerico,

          usuarioUUID:
            sesion.user.id,

          fecha:
            notificacion.fecha_turno,
        }
      );


      /* =================================================
         GUARDAR CONFIRMACIÓN
      ================================================= */

      await confirmarRecepcionHorario({

        trabajadorId:
          trabajadorIdNumerico,

        notificacionId:
          String(
            notificacion.id
          ),

        fechaInicio:
          notificacion.fecha_turno,

        fechaFin:
          notificacion.fecha_turno,

      });


      console.log(
        "✅ CONFIRMACIÓN GUARDADA EN SUPABASE"
      );


      /* =================================================
         GUARDAR UUID LOCALMENTE
      ================================================= */

      setNotificacionesConfirmadas(
        (anteriores) => {

          const id =
            String(
              notificacion.id
            );


          if (
            anteriores.includes(
              id
            )
          ) {

            return anteriores;

          }


          return [
            ...anteriores,
            id,
          ];

        }
      );


      /* =================================================
         ELIMINAR NOTIFICACIÓN DE LA LISTA
      ================================================= */

      setNotificaciones(
        (anteriores) =>

          anteriores.filter(

            (actual) =>

              String(
                actual.id
              ) !==
              String(
                notificacion.id
              )

          )

      );


      console.log(
        "✅ RECEPCIÓN CONFIRMADA:",
        {
          notificacion,
          trabajadorIdNumerico,
        }
      );


    } catch (error) {

      console.error(
        "❌ ERROR CONFIRMANDO RECEPCIÓN:",
        error
      );


      alert(
        "No se pudo confirmar la recepción del horario."
      );

    } finally {

      setConfirmandoNotificacion(
        null
      );

    }

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

      setPaginaActual(
        "inicio"
      );

      return;

    }


    setPaginaActual(
      pagina
    );

  };


  /* =====================================================
     MOSTRAR PÁGINA
  ===================================================== */

  const mostrarPagina = () => {

    switch (paginaActual) {

      case "calendario":

        return (

          <CalendarioPage

            trabajadores={
              trabajadores
            }

            turnos={
              turnos
            }

            setTurnos={
              setTurnos
            }

            esAdministrador={
              perfil?.rol === "admin"
            }

          />

        );


      case "trabajadores":

        if (
          perfil?.rol !== "admin"
        ) {

          return (

            <Inicio

              trabajadores={
                trabajadores
              }

              turnos={
                turnos
              }

              onIrCalendario={() =>
                cambiarPagina(
                  "calendario"
                )
              }

            />

          );

        }


        return (

          <Trabajadores

            trabajadores={
              trabajadores
            }

            setTrabajadores={
              setTrabajadores
            }

          />

        );


      case "administracion":

        if (
          perfil?.rol !== "admin"
        ) {

          return (

            <Inicio

              trabajadores={
                trabajadores
              }

              turnos={
                turnos
              }

              onIrCalendario={() =>
                cambiarPagina(
                  "calendario"
                )
              }

            />

          );

        }


        return (
          <Administracion />
        );


      case "inicio":

      default:

        return (

          <Inicio

            trabajadores={
              trabajadores
            }

            turnos={
              turnos
            }

            onIrCalendario={() =>
              cambiarPagina(
                "calendario"
              )
            }

          />

        );

    }

  };


  /* =====================================================
     TÍTULOS
  ===================================================== */

  const tituloPagina = {

    inicio:
      "Panel principal",

    calendario:
      "Calendario de turnos",

    trabajadores:
      "Trabajadores",

    administracion:
      "Administración",

  };


  /* =====================================================
     NOTIFICACIONES DEL USUARIO
  ===================================================== */

  const misNotificaciones =
    notificaciones.filter(

      (notificacion) =>

        String(
          notificacion.trabajador_id
        ) ===
        String(
          sesion?.user?.id
        )

    );


  const notificacionesNoLeidas =
    misNotificaciones.filter(

      (notificacion) =>

        !notificacion.leida

    ).length;


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

  if (
    !sesion ||
    !perfil
  ) {

    return (

      <Login

        onLogin={async (resultado) => {

          const usuario =
            resultado?.usuario ||
            resultado;


          const perfilLogin =
            resultado?.perfil ||
            null;


          setSesion({

            user:
              usuario,

          });


          if (
            perfilLogin
          ) {

            setPerfil(
              perfilLogin
            );

          } else {

            await obtenerPerfil(
              usuario
            );

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
      ?.toUpperCase() ||
    "U";


  /* =====================================================
     APLICACIÓN
  ===================================================== */

  return (

    <div className="app">

      <Navbar

        paginaActual={
          paginaActual
        }

        cambiarPagina={
          cambiarPagina
        }

        esAdministrador={
          esAdministrador
        }

      />


      <div className="main-content">

        <header className="topbar">

          <div>

            <span className="breadcrumb">

              TORRE MARE / CONTROL DE OBRA

            </span>


            <h2>

              {
                tituloPagina[
                  paginaActual
                ]
              }

            </h2>

          </div>


          <div className="topbar-actions">

            <div
              style={{
                position:
                  "relative",
              }}
            >

              <button

                type="button"

                className="notification"

                title="Notificaciones"

                onClick={() =>
                  setNotificacionesAbiertas(
                    (actual) =>
                      !actual
                  )
                }

                style={{
                  position:
                    "relative",
                }}

              >

                🔔


                {notificacionesNoLeidas > 0 && (

                  <span
                    style={{
                      position:
                        "absolute",

                      top:
                        "-5px",

                      right:
                        "-5px",

                      minWidth:
                        "20px",

                      height:
                        "20px",

                      padding:
                        "0 5px",

                      borderRadius:
                        "999px",

                      background:
                        "#e11d48",

                      color:
                        "#fff",

                      fontSize:
                        "11px",

                      fontWeight:
                        "700",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      border:
                        "2px solid #fff",
                    }}
                  >

                    {
                      notificacionesNoLeidas
                    }

                  </span>

                )}

              </button>


              {notificacionesAbiertas && (

                <div
                  style={{
                    position:
                      "absolute",

                    top:
                      "48px",

                    right:
                      "0",

                    width:
                      "360px",

                    maxWidth:
                      "calc(100vw - 30px)",

                    background:
                      "#fff",

                    border:
                      "1px solid #e4e7ec",

                    borderRadius:
                      "14px",

                    boxShadow:
                      "0 15px 35px rgba(16,24,40,.15)",

                    zIndex:
                      1000,

                    overflow:
                      "hidden",
                  }}
                >

                  <div
                    style={{
                      padding:
                        "16px 18px",

                      borderBottom:
                        "1px solid #eaecf0",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "space-between",
                    }}
                  >

                    <div>

                      <strong
                        style={{
                          display:
                            "block",

                          fontSize:
                            "15px",
                        }}
                      >

                        Notificaciones

                      </strong>


                      <span
                        style={{
                          display:
                            "block",

                          marginTop:
                            "3px",

                          fontSize:
                            "12px",

                          color:
                            "#667085",
                        }}
                      >

                        Avisos de tu programación

                      </span>

                    </div>


                    {notificacionesNoLeidas > 0 && (

                      <span
                        style={{
                          fontSize:
                            "12px",

                          fontWeight:
                            "600",

                          color:
                            "#b42318",
                        }}
                      >

                        {
                          notificacionesNoLeidas
                        }

                        {" nueva"}

                        {
                          notificacionesNoLeidas !== 1
                            ? "s"
                            : ""
                        }

                      </span>

                    )}

                  </div>


                  <div
                    style={{
                      maxHeight:
                        "420px",

                      overflowY:
                        "auto",
                    }}
                  >

                    {esAdministrador ? (

                      <div
                        style={{
                          padding:
                            "28px 20px",

                          textAlign:
                            "center",

                          color:
                            "#667085",
                        }}
                      >

                        <div
                          style={{
                            fontSize:
                              "28px",

                            marginBottom:
                              "8px",
                          }}
                        >

                          🔔

                        </div>


                        <strong
                          style={{
                            display:
                              "block",

                            color:
                              "#344054",
                          }}
                        >

                          Notificaciones

                        </strong>


                        <p
                          style={{
                            margin:
                              "6px 0 0",

                            fontSize:
                              "13px",

                            lineHeight:
                              "1.5",
                          }}
                        >

                          Aquí aparecerán las
                          confirmaciones de los
                          trabajadores.

                        </p>

                      </div>

                    ) : misNotificaciones.length === 0 ? (

                      <div
                        style={{
                          padding:
                            "35px 20px",

                          textAlign:
                            "center",

                          color:
                            "#667085",
                        }}
                      >

                        <div
                          style={{
                            fontSize:
                              "28px",

                            marginBottom:
                              "8px",
                          }}
                        >

                          ✓

                        </div>


                        <strong
                          style={{
                            display:
                              "block",

                            color:
                              "#344054",
                          }}
                        >

                          No tienes notificaciones

                        </strong>


                        <p
                          style={{
                            margin:
                              "6px 0 0",

                            fontSize:
                              "13px",
                          }}
                        >

                          Aquí aparecerán los
                          avisos de tus turnos.

                        </p>

                      </div>

                    ) : (

                      misNotificaciones.map(

                        (notificacion) => {

                          /* =================================
                             ID DE NOTIFICACIÓN = UUID

                             NO USAR Number()
                          ================================= */

                          const idNotificacion =
                            String(
                              notificacion.id
                            );


                          const confirmada =
                            notificacionesConfirmadas.includes(
                              idNotificacion
                            );


                          return (

                            <div
                              key={
                                idNotificacion
                              }

                              style={{

                                padding:
                                  "16px 18px",

                                borderBottom:
                                  "1px solid #f2f4f7",

                                background:
                                  notificacion.leida
                                    ? "#fff"
                                    : "#f8fafc",

                              }}
                            >

                              <div
                                style={{

                                  display:
                                    "flex",

                                  gap:
                                    "12px",

                                  alignItems:
                                    "flex-start",

                                }}
                              >

                                <div
                                  style={{

                                    width:
                                      "38px",

                                    height:
                                      "38px",

                                    minWidth:
                                      "38px",

                                    borderRadius:
                                      "10px",

                                    background:
                                      confirmada
                                        ? "#ecfdf3"
                                        : "#eef4ff",

                                    display:
                                      "flex",

                                    alignItems:
                                      "center",

                                    justifyContent:
                                      "center",

                                    fontSize:
                                      "18px",

                                  }}
                                >

                                  {
                                    confirmada
                                      ? "✅"
                                      : "🔔"
                                  }

                                </div>


                                <div
                                  style={{
                                    flex: 1,
                                  }}
                                >

                                  <strong
                                    style={{
                                      display:
                                        "block",

                                      fontSize:
                                        "14px",

                                      color:
                                        "#101828",
                                    }}
                                  >

                                    {
                                      notificacion.titulo
                                    }

                                  </strong>


                                  <p
                                    style={{
                                      margin:
                                        "5px 0 8px",

                                      fontSize:
                                        "13px",

                                      lineHeight:
                                        "1.45",

                                      color:
                                        "#475467",
                                    }}
                                  >

                                    {
                                      notificacion.mensaje
                                    }

                                  </p>


                                  {notificacion.fecha_turno && (

                                    <span
                                      style={{
                                        display:
                                          "inline-block",

                                        padding:
                                          "4px 8px",

                                        borderRadius:
                                          "6px",

                                        background:
                                          "#f2f4f7",

                                        fontSize:
                                          "11px",

                                        fontWeight:
                                          "600",

                                        color:
                                          "#344054",
                                      }}
                                    >

                                      📅{" "}

                                      {
                                        notificacion.fecha_turno
                                      }

                                    </span>

                                  )}


                                  {notificacion.tipo === "horario" && (

                                    <div
                                      style={{
                                        marginTop:
                                          "12px",
                                      }}
                                    >

                                      {confirmada ? (

                                        <div
                                          style={{
                                            padding:
                                              "9px 12px",

                                            borderRadius:
                                              "8px",

                                            background:
                                              "#ecfdf3",

                                            color:
                                              "#027a48",

                                            fontSize:
                                              "12px",

                                            fontWeight:
                                              "600",

                                            border:
                                              "1px solid #abefc6",
                                          }}
                                        >

                                          ✅ Recepción confirmada

                                        </div>

                                      ) : (

                                        <button

                                          type="button"

                                          onClick={(e) => {

                                            e.preventDefault();

                                            e.stopPropagation();

                                            confirmarNotificacion(
                                              notificacion
                                            );

                                          }}

                                          disabled={
                                            confirmandoNotificacion ===
                                            idNotificacion
                                          }

                                          style={{

                                            width:
                                              "100%",

                                            border:
                                              "none",

                                            borderRadius:
                                              "8px",

                                            padding:
                                              "10px 12px",

                                            background:
                                              confirmandoNotificacion ===
                                              idNotificacion

                                                ? "#98a2b3"

                                                : "#175cd3",

                                            color:
                                              "#fff",

                                            fontSize:
                                              "12px",

                                            fontWeight:
                                              "700",

                                            cursor:
                                              confirmandoNotificacion ===
                                              idNotificacion

                                                ? "not-allowed"

                                                : "pointer",

                                            position:
                                              "relative",

                                            zIndex:
                                              1001,

                                          }}

                                        >

                                          {
                                            confirmandoNotificacion ===
                                            idNotificacion

                                              ? "Confirmando..."

                                              : "✅ Confirmar recepción"
                                          }

                                        </button>

                                      )}

                                    </div>

                                  )}

                                </div>

                              </div>

                            </div>

                          );

                        }

                      )

                    )}

                  </div>

                </div>

              )}

            </div>


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

                    : "Trabajador"

                  }

                </span>

              </div>

            </div>


            <button

              type="button"

              onClick={
                cerrarSesion
              }

              className="btn-logout"

            >

              Cerrar sesión

            </button>


          </div>

        </header>


        {cargandoTrabajadores ? (

          <div
            style={{
              padding:
                "40px",

              textAlign:
                "center",
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