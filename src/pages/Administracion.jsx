import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { obtenerTurnos } from "../services/turnosService";

function Administracion({ trabajadores = [] }) {
  const hoy = new Date();

  /* =====================================================
     CONFIGURACIÓN
  ===================================================== */

  const [nombreObra, setNombreObra] = useState("Torre Mare");
  const [ubicacion, setUbicacion] = useState("");

  const [horaInicioDia, setHoraInicioDia] =
    useState("06:00");

  const [horaFinDia, setHoraFinDia] =
    useState("18:00");

  const [horaInicioNoche, setHoraInicioNoche] =
    useState("18:00");

  const [horaFinNoche, setHoraFinNoche] =
    useState("06:00");

  const [guardado, setGuardado] = useState(false);
  const [generandoPDF, setGenerandoPDF] =
    useState(false);

  /* =====================================================
     TURNOS REALES
  ===================================================== */

  const [turnosReales, setTurnosReales] = useState([]);
  const [cargandoTurnos, setCargandoTurnos] =
    useState(true);

  const [errorTurnos, setErrorTurnos] =
    useState("");

  /* =====================================================
     PERÍODO DEL REPORTE
  ===================================================== */

  const obtenerMesActual = () => {
    return `${hoy.getFullYear()}-${String(
      hoy.getMonth() + 1
    ).padStart(2, "0")}`;
  };

  const [mesReporte, setMesReporte] =
    useState(obtenerMesActual());

  const [quincenaReporte, setQuincenaReporte] =
    useState(
      hoy.getDate() <= 15
        ? "primera"
        : "segunda"
    );

  /* =====================================================
     CARGAR TURNOS
  ===================================================== */

  const cargarTurnosReales = async () => {
    try {
      setCargandoTurnos(true);
      setErrorTurnos("");

      const data = await obtenerTurnos();

      setTurnosReales(data || []);
    } catch (error) {
      console.error(
        "Error cargando turnos:",
        error
      );

      setErrorTurnos(
        "No se pudieron cargar los turnos reales."
      );
    } finally {
      setCargandoTurnos(false);
    }
  };

  useEffect(() => {
    cargarTurnosReales();
  }, []);

  /* =====================================================
     GUARDAR CONFIGURACIÓN
  ===================================================== */

  const guardarConfiguracion = (e) => {
    e.preventDefault();

    setGuardado(true);

    setTimeout(() => {
      setGuardado(false);
    }, 2500);
  };

  /* =====================================================
     FECHA YYYY-MM-DD
  ===================================================== */

  const obtenerClaveFecha = (fecha) => {
    const anio = fecha.getFullYear();

    const mes = String(
      fecha.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
      fecha.getDate()
    ).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
  };

  /* =====================================================
     FECHAS DEL REPORTE
  ===================================================== */

  const obtenerFechasReporte = () => {
    const [anio, mes] =
      mesReporte.split("-").map(Number);

    const inicio = new Date(
      anio,
      mes - 1,
      1
    );

    const fin = new Date(
      anio,
      mes,
      0
    );

    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    if (quincenaReporte === "primera") {
      inicio.setDate(1);
      fin.setDate(15);
    } else {
      inicio.setDate(16);
    }

    return {
      inicio,
      fin,
    };
  };

  /* =====================================================
     DÍAS DEL PERÍODO
  ===================================================== */

  const obtenerDiasPeriodo = () => {
    const { inicio, fin } =
      obtenerFechasReporte();

    const dias = [];
    const fecha = new Date(inicio);

    while (fecha <= fin) {
      dias.push(new Date(fecha));

      fecha.setDate(
        fecha.getDate() + 1
      );
    }

    return dias;
  };

  /* =====================================================
     NOMBRE DEL MES
  ===================================================== */

  const obtenerNombreMes = (fecha) => {
    return fecha.toLocaleDateString(
      "es-CO",
      {
        month: "long",
      }
    );
  };

  /* =====================================================
     TEXTO DEL PERÍODO
  ===================================================== */

  const obtenerTextoPeriodo = () => {
    const { inicio, fin } =
      obtenerFechasReporte();

    const mes =
      obtenerNombreMes(inicio);

    const anio =
      inicio.getFullYear();

    if (
      quincenaReporte === "primera"
    ) {
      return `1 al 15 de ${mes} de ${anio}`;
    }

    return `16 al ${fin.getDate()} de ${mes} de ${anio}`;
  };

  /* =====================================================
     FORMATEAR FECHA
  ===================================================== */

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "";
    }

    const partes = String(fecha)
      .substring(0, 10)
      .split("-")
      .map(Number);

    if (
      partes.length !== 3 ||
      !partes[0] ||
      !partes[1] ||
      !partes[2]
    ) {
      return String(fecha);
    }

    const fechaLocal = new Date(
      partes[0],
      partes[1] - 1,
      partes[2]
    );

    return fechaLocal.toLocaleDateString(
      "es-CO",
      {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     NOMBRE DEL TRABAJADOR
  ===================================================== */

  const obtenerNombreTrabajador = (
    trabajador
  ) => {
    if (!trabajador) {
      return "Sin nombre";
    }

    if (
      trabajador.nombre &&
      trabajador.apellido
    ) {
      return `${trabajador.nombre} ${trabajador.apellido}`;
    }

    if (trabajador.nombre) {
      return trabajador.nombre;
    }

    if (trabajador.nombres) {
      return trabajador.nombres;
    }

    return (
      trabajador.email ||
      "Sin nombre"
    );
  };

  /* =====================================================
     OBTENER TRABAJADOR
  ===================================================== */

  const buscarTrabajador = (
    trabajadorId
  ) => {
    return trabajadores.find(
      (trabajador) =>
        String(trabajador.id) ===
        String(trabajadorId)
    );
  };

  /* =====================================================
     TURNOS DEL PERÍODO
  ===================================================== */

  const obtenerTurnosDelPeriodo = (
    listaTurnos = turnosReales
  ) => {
    const {
      inicio,
      fin,
    } = obtenerFechasReporte();

    const fechaInicio =
      obtenerClaveFecha(inicio);

    const fechaFin =
      obtenerClaveFecha(fin);

    return listaTurnos.filter(
      (turno) => {
        if (!turno?.fecha) {
          return false;
        }

        const fecha = String(
          turno.fecha
        ).substring(0, 10);

        return (
          fecha >= fechaInicio &&
          fecha <= fechaFin
        );
      }
    );
  };

  /* =====================================================
     RESUMEN REAL
  ===================================================== */

  const obtenerResumen = (
    listaTurnos = turnosReales
  ) => {
    const turnosPeriodo =
      obtenerTurnosDelPeriodo(
        listaTurnos
      );

    return trabajadores.map(
      (trabajador) => {
        const turnosTrabajador =
          turnosPeriodo.filter(
            (turno) =>
              String(
                turno.trabajador_id
              ) ===
              String(
                trabajador.id
              )
          );

        const dia =
          turnosTrabajador.filter(
            (turno) =>
              turno.tipo === "dia"
          ).length;

        const noche =
          turnosTrabajador.filter(
            (turno) =>
              turno.tipo === "noche"
          ).length;

        return {
          id: trabajador.id,

          nombre:
            obtenerNombreTrabajador(
              trabajador
            ),

          dia,

          noche,

          total:
            dia + noche,
        };
      }
    );
  };

  /* =====================================================
     TOTALES
  ===================================================== */

  const obtenerTotales = () => {
    const resumen =
      obtenerResumen();

    return resumen.reduce(
      (total, trabajador) => {
        total.dia += trabajador.dia;
        total.noche += trabajador.noche;
        total.total += trabajador.total;

        return total;
      },
      {
        dia: 0,
        noche: 0,
        total: 0,
      }
    );
  };

  /* =====================================================
     CARGAR LOGO
  ===================================================== */

  const cargarLogo = async () => {
    try {
      const respuesta =
        await fetch(
          "/logo192.png"
        );

      if (!respuesta.ok) {
        return null;
      }

      const blob =
        await respuesta.blob();

      return new Promise(
        (resolve) => {
          const lector =
            new FileReader();

          lector.onloadend = () => {
            resolve(
              lector.result
            );
          };

          lector.onerror = () => {
            resolve(null);
          };

          lector.readAsDataURL(
            blob
          );
        }
      );
    } catch (error) {
      console.warn(
        "No se pudo cargar el logo:",
        error
      );

      return null;
    }
  };

  /* =====================================================
     GENERAR PDF
  ===================================================== */

  const generarPDF = async () => {
    if (generandoPDF) {
      return;
    }

    try {
      setGenerandoPDF(true);

      /* ===============================================
         ACTUALIZAR DATOS DESDE SUPABASE
      =============================================== */

      const datosActualizados =
        await obtenerTurnos();

      setTurnosReales(
        datosActualizados || []
      );

      const turnosPeriodo =
        obtenerTurnosDelPeriodo(
          datosActualizados || []
        );

      const { inicio, fin } =
        obtenerFechasReporte();

      const doc =
        new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

      /* ===============================================
         LOGO
      =============================================== */

      const logo =
        await cargarLogo();

      if (logo) {
        try {
          doc.addImage(
            logo,
            "PNG",
            14,
            12,
            24,
            24
          );
        } catch (error) {
          console.warn(
            "No se pudo insertar el logo:",
            error
          );
        }
      }

      /* ===============================================
         ENCABEZADO
      =============================================== */

      const posicionTitulo =
        logo ? 44 : 14;

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(18);

      doc.text(
        nombreObra ||
          "Torre Mare",
        posicionTitulo,
        20
      );

      doc.setFontSize(10);

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        "CONTROL DE TURNOS",
        posicionTitulo,
        27
      );

      if (ubicacion) {
        doc.text(
          ubicacion,
          posicionTitulo,
          33
        );
      }

      /* ===============================================
         INFORMACIÓN
      =============================================== */

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(12);

      doc.text(
        "Reporte de turnos",
        14,
        48
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(10);

      doc.text(
        `Período: ${obtenerTextoPeriodo()}`,
        14,
        55
      );

      doc.text(
        `Generado: ${new Date().toLocaleDateString(
          "es-CO"
        )}`,
        14,
        61
      );

      /* ===============================================
         RESUMEN GENERAL
      =============================================== */

      const filasResumen = [];

      let totalDiaGeneral = 0;
      let totalNocheGeneral = 0;

      trabajadores.forEach(
        (trabajador) => {
          const turnosTrabajador =
            turnosPeriodo.filter(
              (turno) =>
                String(
                  turno.trabajador_id
                ) ===
                String(
                  trabajador.id
                )
            );

          const dia =
            turnosTrabajador.filter(
              (turno) =>
                turno.tipo === "dia"
            ).length;

          const noche =
            turnosTrabajador.filter(
              (turno) =>
                turno.tipo === "noche"
            ).length;

          totalDiaGeneral += dia;
          totalNocheGeneral += noche;

          filasResumen.push([
            obtenerNombreTrabajador(
              trabajador
            ),
            String(dia),
            String(noche),
            String(dia + noche),
          ]);
        }
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(12);

      doc.text(
        "Resumen por trabajador",
        14,
        70
      );

      autoTable(doc, {
        startY: 75,

        head: [
          [
            "Trabajador",
            "Día",
            "Noche",
            "Total",
          ],
        ],

        body:
          filasResumen,

        foot: [
          [
            "TOTAL GENERAL",
            String(
              totalDiaGeneral
            ),
            String(
              totalNocheGeneral
            ),
            String(
              totalDiaGeneral +
                totalNocheGeneral
            ),
          ],
        ],

        theme: "grid",

        styles: {
          fontSize: 9,
          cellPadding: 3,
        },

        headStyles: {
          fontStyle: "bold",
        },

        footStyles: {
          fontStyle: "bold",
        },

        columnStyles: {
          0: {
            cellWidth: 90,
          },

          1: {
            halign: "center",
          },

          2: {
            halign: "center",
          },

          3: {
            halign: "center",
          },
        },
      });

      /* ===============================================
         DETALLE POR TRABAJADOR
      =============================================== */

      let posicionY =
        doc.lastAutoTable.finalY +
        14;

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(12);

      doc.text(
        "Días trabajados por trabajador",
        14,
        posicionY
      );

      posicionY += 7;

      /* ===============================================
         CADA TRABAJADOR
      =============================================== */

      trabajadores.forEach(
        (trabajador) => {
          const turnosTrabajador =
            turnosPeriodo
              .filter(
                (turno) =>
                  String(
                    turno.trabajador_id
                  ) ===
                  String(
                    trabajador.id
                  )
              )
              .sort((a, b) =>
                String(
                  a.fecha
                ).localeCompare(
                  String(b.fecha)
                )
              );

          /*
            Si no caben los datos en la página,
            creamos una nueva.
          */

          if (
            posicionY >
            doc.internal.pageSize.getHeight() -
              55
          ) {
            doc.addPage();

            posicionY = 20;
          }

          /* =============================================
             NOMBRE
          ============================================= */

          doc.setFont(
            "helvetica",
            "bold"
          );

          doc.setFontSize(10);

          doc.text(
            obtenerNombreTrabajador(
              trabajador
            ),
            14,
            posicionY
          );

          posicionY += 5;

          /* =============================================
             SIN TURNOS
          ============================================= */

          if (
            turnosTrabajador.length ===
            0
          ) {
            doc.setFont(
              "helvetica",
              "normal"
            );

            doc.setFontSize(8);

            doc.text(
              "No tiene turnos registrados en este período.",
              18,
              posicionY
            );

            posicionY += 9;

            return;
          }

          /* =============================================
             RESUMEN DEL TRABAJADOR
          ============================================= */

          const cantidadDia =
            turnosTrabajador.filter(
              (turno) =>
                turno.tipo === "dia"
            ).length;

          const cantidadNoche =
            turnosTrabajador.filter(
              (turno) =>
                turno.tipo ===
                "noche"
            ).length;

          doc.setFont(
            "helvetica",
            "normal"
          );

          doc.setFontSize(8);

          doc.text(
            `Día: ${cantidadDia}   |   Noche: ${cantidadNoche}   |   Total: ${turnosTrabajador.length}`,
            14,
            posicionY
          );

          posicionY += 4;

          /* =============================================
             TABLA DE DÍAS
          ============================================= */

          const filasTrabajador =
            turnosTrabajador.map(
              (turno) => {
                let tipo =
                  String(
                    turno.tipo ||
                      ""
                  );

                if (
                  turno.tipo ===
                  "dia"
                ) {
                  tipo = "Día";
                }

                if (
                  turno.tipo ===
                  "noche"
                ) {
                  tipo =
                    "Noche";
                }

                return [
                  formatearFecha(
                    turno.fecha
                  ),
                  tipo,
                ];
              }
            );

          autoTable(doc, {
            startY: posicionY,

            head: [
              [
                "Día trabajado",
                "Turno",
              ],
            ],

            body:
              filasTrabajador,

            theme: "grid",

            styles: {
              fontSize: 8,
              cellPadding: 2.5,
            },

            headStyles: {
              fontStyle:
                "bold",
            },

            columnStyles: {
              0: {
                cellWidth: 115,
              },

              1: {
                halign:
                  "center",
              },
            },

            margin: {
              left: 14,
              right: 14,
            },
          });

          posicionY =
            doc.lastAutoTable.finalY +
            9;
        }
      );

      /* ===============================================
         SI NO HAY TURNOS
      =============================================== */

      if (
        turnosPeriodo.length ===
        0
      ) {
        if (
          posicionY >
          doc.internal.pageSize.getHeight() -
            30
        ) {
          doc.addPage();
          posicionY = 25;
        }

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(10);

        doc.text(
          "No hay turnos registrados en esta quincena.",
          14,
          posicionY
        );
      }

      /* ===============================================
         FIRMA
      =============================================== */

      const altoPagina =
        doc.internal.pageSize.getHeight();

      let firmaY =
        altoPagina - 35;

      if (
        posicionY >
        firmaY - 10
      ) {
        doc.addPage();

        firmaY =
          doc.internal.pageSize.getHeight() -
          35;
      }

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(9);

      doc.line(
        65,
        firmaY,
        145,
        firmaY
      );

      doc.text(
        "Firma del administrador",
        88,
        firmaY + 6
      );

      /* ===============================================
         PIE DE PÁGINA
      =============================================== */

      const totalPaginas =
        doc.internal.getNumberOfPages();

      for (
        let pagina = 1;
        pagina <=
        totalPaginas;
        pagina++
      ) {
        doc.setPage(pagina);

        const alto =
          doc.internal.pageSize.getHeight();

        const ancho =
          doc.internal.pageSize.getWidth();

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(8);

        doc.text(
          `${
            nombreObra ||
            "Torre Mare"
          } — Control de obra`,
          14,
          alto - 10
        );

        doc.text(
          `Página ${pagina} de ${totalPaginas}`,
          ancho - 14,
          alto - 10,
          {
            align: "right",
          }
        );
      }

      /* ===============================================
         DESCARGAR
      =============================================== */

      const nombreArchivo =
        `turnos-${obtenerClaveFecha(
          inicio
        )}-${obtenerClaveFecha(
          fin
        )}.pdf`;

      doc.save(
        nombreArchivo
      );
    } catch (error) {
      console.error(
        "Error generando PDF:",
        error
      );

      alert(
        "No se pudo generar el PDF."
      );
    } finally {
      setGenerandoPDF(false);
    }
  };

  /* =====================================================
     DATOS VISUALES
  ===================================================== */

  const resumen =
    obtenerResumen();

  const totales =
    obtenerTotales();

  const turnosPeriodo =
    obtenerTurnosDelPeriodo();

  /* =====================================================
     INTERFAZ
  ===================================================== */

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
            Configura la información general y
            los horarios de la obra.
          </p>

        </div>

      </div>


      <div className="administracion-grid">

        {/* =================================================
            CONFIGURACIÓN
        ================================================= */}

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
            onSubmit={
              guardarConfiguracion
            }
          >

            <div className="form-group">

              <label>
                Nombre de la obra
              </label>

              <input
                type="text"
                value={
                  nombreObra
                }
                onChange={(e) =>
                  setNombreObra(
                    e.target.value
                  )
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
                value={
                  ubicacion
                }
                onChange={(e) =>
                  setUbicacion(
                    e.target.value
                  )
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
                      value={
                        horaInicioDia
                      }
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
                      value={
                        horaFinDia
                      }
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
                      value={
                        horaInicioNoche
                      }
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
                      value={
                        horaFinNoche
                      }
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


        {/* =================================================
            REPORTES
        ================================================= */}

        <section className="admin-panel">

          <div className="admin-panel-header">

            <div className="admin-panel-icon">
              📄
            </div>

            <div>

              <span>
                REPORTES
              </span>

              <h3>
                Reporte de turnos
              </h3>

            </div>

          </div>


          <div
            style={{
              padding:
                "8px 0 4px",
            }}
          >

            <p
              style={{
                margin:
                  "0 0 16px",
                color:
                  "#667085",
                fontSize:
                  "14px",
                lineHeight:
                  "1.5",
              }}
            >
              Selecciona la quincena que deseas
              consultar. El reporte muestra los
              días exactos trabajados por cada
              persona.
            </p>


            {/* =================================================
                MES
            ================================================= */}

            <div
              style={{
                marginBottom:
                  "14px",
              }}
            >

              <label
                style={{
                  display:
                    "block",
                  marginBottom:
                    "6px",
                  fontSize:
                    "13px",
                  fontWeight:
                    "700",
                  color:
                    "#344054",
                }}
              >
                Mes del reporte
              </label>

              <input
                type="month"
                value={
                  mesReporte
                }
                onChange={(e) =>
                  setMesReporte(
                    e.target.value
                  )
                }
                style={{
                  width:
                    "100%",
                  boxSizing:
                    "border-box",
                  border:
                    "1px solid #d0d5dd",
                  borderRadius:
                    "10px",
                  padding:
                    "11px 12px",
                  fontSize:
                    "14px",
                }}
              />

            </div>


            {/* =================================================
                QUINCENA
            ================================================= */}

            <div
              style={{
                marginBottom:
                  "14px",
              }}
            >

              <label
                style={{
                  display:
                    "block",
                  marginBottom:
                    "6px",
                  fontSize:
                    "13px",
                  fontWeight:
                    "700",
                  color:
                    "#344054",
                }}
              >
                Quincena
              </label>

              <select
                value={
                  quincenaReporte
                }
                onChange={(e) =>
                  setQuincenaReporte(
                    e.target.value
                  )
                }
                style={{
                  width:
                    "100%",
                  boxSizing:
                    "border-box",
                  border:
                    "1px solid #d0d5dd",
                  borderRadius:
                    "10px",
                  padding:
                    "11px 12px",
                  fontSize:
                    "14px",
                  background:
                    "#fff",
                }}
              >

                <option value="primera">
                  Primera quincena — 1 al 15
                </option>

                <option value="segunda">
                  Segunda quincena — 16 al último día
                </option>

              </select>

            </div>


            {/* =================================================
                PERÍODO
            ================================================= */}

            <div
              style={{
                marginBottom:
                  "16px",
                padding:
                  "12px 14px",
                borderRadius:
                  "10px",
                background:
                  "#f2f4f7",
                border:
                  "1px solid #eaecf0",
              }}
            >

              <div
                style={{
                  fontSize:
                    "12px",
                  color:
                    "#667085",
                  marginBottom:
                    "4px",
                  fontWeight:
                    "600",
                }}
              >
                PERÍODO SELECCIONADO
              </div>

              <div
                style={{
                  fontSize:
                    "15px",
                  color:
                    "#101828",
                  fontWeight:
                    "700",
                  textTransform:
                    "capitalize",
                }}
              >
                {obtenerTextoPeriodo()}
              </div>

            </div>


            {/* =================================================
                ESTADO
            ================================================= */}

            {cargandoTurnos && (
              <div
                style={{
                  marginBottom:
                    "14px",
                  padding:
                    "10px",
                  borderRadius:
                    "8px",
                  background:
                    "#f2f4f7",
                  fontSize:
                    "13px",
                  color:
                    "#667085",
                }}
              >
                Cargando turnos reales...
              </div>
            )}


            {errorTurnos && (
              <div
                style={{
                  marginBottom:
                    "14px",
                  padding:
                    "10px",
                  borderRadius:
                    "8px",
                  background:
                    "#fef3f2",
                  color:
                    "#b42318",
                  fontSize:
                    "13px",
                }}
              >
                {errorTurnos}
              </div>
            )}


            {/* =================================================
                RESUMEN EN PANTALLA
            ================================================= */}

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap:
                  "8px",
                marginBottom:
                  "16px",
              }}
            >

              <div
                style={{
                  padding:
                    "10px",
                  borderRadius:
                    "8px",
                  background:
                    "#f9fafb",
                  textAlign:
                    "center",
                  border:
                    "1px solid #eaecf0",
                }}
              >

                <div
                  style={{
                    fontSize:
                      "11px",
                    color:
                      "#667085",
                  }}
                >
                  DÍA
                </div>

                <strong
                  style={{
                    fontSize:
                      "18px",
                  }}
                >
                  {totales.dia}
                </strong>

              </div>


              <div
                style={{
                  padding:
                    "10px",
                  borderRadius:
                    "8px",
                  background:
                    "#f9fafb",
                  textAlign:
                    "center",
                  border:
                    "1px solid #eaecf0",
                }}
              >

                <div
                  style={{
                    fontSize:
                      "11px",
                    color:
                      "#667085",
                  }}
                >
                  NOCHE
                </div>

                <strong
                  style={{
                    fontSize:
                      "18px",
                  }}
                >
                  {totales.noche}
                </strong>

              </div>


              <div
                style={{
                  padding:
                    "10px",
                  borderRadius:
                    "8px",
                  background:
                    "#f9fafb",
                  textAlign:
                    "center",
                    border:
                    "1px solid #eaecf0",
                }}
              >

                <div
                  style={{
                    fontSize:
                      "11px",
                    color:
                      "#667085",
                  }}
                >
                  TOTAL
                </div>

                <strong
                  style={{
                    fontSize:
                      "18px",
                  }}
                >
                  {totales.total}
                </strong>

              </div>

            </div>


            {/* =================================================
                INFORMACIÓN
            ================================================= */}

            <div
              style={{
                marginBottom:
                  "16px",
                fontSize:
                  "13px",
                color:
                  "#667085",
              }}
            >

              <strong>
                {trabajadores.length}
              </strong>{" "}
              trabajadores registrados
              {" · "}
              <strong>
                {turnosPeriodo.length}
              </strong>{" "}
              turnos en este período.

            </div>


            {/* =================================================
                BOTÓN PDF
            ================================================= */}

            <button
              type="button"
              onClick={
                generarPDF
              }
              disabled={
                generandoPDF ||
                cargandoTurnos
              }
              style={{
                width:
                  "100%",
                border:
                  "none",
                borderRadius:
                  "10px",
                padding:
                  "13px 16px",
                background:
                  generandoPDF ||
                  cargandoTurnos
                    ? "#98a2b3"
                    : "#175cd3",
                color:
                  "#fff",
                fontSize:
                  "14px",
                fontWeight:
                  "700",
                cursor:
                  generandoPDF ||
                  cargandoTurnos
                    ? "not-allowed"
                    : "pointer",
              }}
            >

              {generandoPDF
                ? "Generando PDF..."
                : cargandoTurnos
                  ? "Cargando turnos..."
                  : "📄 Generar PDF de turnos"}

            </button>


            {/* =================================================
                ACTUALIZAR
            ================================================= */}

            <button
              type="button"
              onClick={
                cargarTurnosReales
              }
              disabled={
                cargandoTurnos
              }
              style={{
                width:
                  "100%",
                marginTop:
                  "8px",
                border:
                  "1px solid #d0d5dd",
                borderRadius:
                  "10px",
                padding:
                  "11px 16px",
                background:
                  "#fff",
                color:
                  "#344054",
                fontSize:
                  "13px",
                fontWeight:
                  "600",
                cursor:
                  cargandoTurnos
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              ↻ Actualizar turnos
            </button>

          </div>

        </section>

      </div>

    </main>
  );
}

export default Administracion;