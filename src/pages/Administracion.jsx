import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function Administracion({
  trabajadores = [],
  turnos = {},
}) {

  const [nombreObra, setNombreObra] =
    useState("Torre Mare");

  const [ubicacion, setUbicacion] =
    useState("");

  const [horaInicioDia, setHoraInicioDia] =
    useState("06:00");

  const [horaFinDia, setHoraFinDia] =
    useState("18:00");

  const [horaInicioNoche, setHoraInicioNoche] =
    useState("18:00");

  const [horaFinNoche, setHoraFinNoche] =
    useState("06:00");

  const [guardado, setGuardado] =
    useState(false);

  const [generandoPDF, setGenerandoPDF] =
    useState(false);


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
     FECHA ACTUAL
  ===================================================== */

  const obtenerFechaHoy = () => {

    const fecha = new Date();

    fecha.setHours(
      0,
      0,
      0,
      0
    );

    return fecha;

  };


  /* =====================================================
     INICIO DE QUINCENA
  ===================================================== */

  const obtenerInicioQuincena = (fecha) => {

    const inicio =
      new Date(fecha);

    inicio.setHours(
      0,
      0,
      0,
      0
    );

    if (
      inicio.getDate() <= 15
    ) {

      inicio.setDate(1);

    } else {

      inicio.setDate(16);

    }

    return inicio;

  };


  /* =====================================================
     FIN DE QUINCENA
  ===================================================== */

  const obtenerFinQuincena = (fecha) => {

    const fin =
      new Date(fecha);

    fin.setHours(
      0,
      0,
      0,
      0
    );

    if (
      fin.getDate() <= 15
    ) {

      fin.setDate(15);

    } else {

      fin.setMonth(
        fin.getMonth() + 1,
        0
      );

    }

    return fin;

  };


  /* =====================================================
     FECHA YYYY-MM-DD
  ===================================================== */

  const obtenerClaveFecha = (fecha) => {

    const anio =
      fecha.getFullYear();

    const mes =
      String(
        fecha.getMonth() + 1
      ).padStart(
        2,
        "0"
      );

    const dia =
      String(
        fecha.getDate()
      ).padStart(
        2,
        "0"
      );

    return `${anio}-${mes}-${dia}`;

  };


  /* =====================================================
     FORMATEAR FECHA
  ===================================================== */

  const formatearFecha = (fecha) => {

    if (!fecha) {

      return "";

    }

    const partes =
      String(fecha)
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

    const fechaLocal =
      new Date(
        partes[0],
        partes[1] - 1,
        partes[2]
      );

    return fechaLocal.toLocaleDateString(
      "es-CO",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );

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
     OBTENER NOMBRE DEL TRABAJADOR
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

    if (
      trabajador.nombre
    ) {

      return trabajador.nombre;

    }

    if (
      trabajador.nombres
    ) {

      return trabajador.nombres;

    }

    return (
      trabajador.email ||
      "Sin nombre"
    );

  };


  /* =====================================================
     OBTENER TURNO
  ===================================================== */

  const obtenerTurno = (
    fecha,
    trabajadorId
  ) => {

    const claveFecha =
      obtenerClaveFecha(fecha);

    const turnosDelDia =
      turnos?.[claveFecha];

    if (!turnosDelDia) {

      return null;

    }

    return (
      turnosDelDia?.[trabajadorId] ||
      turnosDelDia?.[
        String(trabajadorId)
      ] ||
      null
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

      if (
        !respuesta.ok
      ) {

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

    if (
      generandoPDF
    ) {

      return;

    }

    try {

      setGenerandoPDF(true);


      /* ===============================================
         FECHAS DE LA QUINCENA
      =============================================== */

      const hoy =
        obtenerFechaHoy();

      const inicio =
        obtenerInicioQuincena(
          hoy
        );

      const fin =
        obtenerFinQuincena(
          hoy
        );


      /* ===============================================
         CREAR PDF
      =============================================== */

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
        logo
          ? 44
          : 14;


      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(
        18
      );

      doc.text(
        nombreObra ||
          "Torre Mare",
        posicionTitulo,
        20
      );


      doc.setFontSize(
        10
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        "CONTROL DE TURNOS",
        posicionTitulo,
        27
      );


      if (
        ubicacion
      ) {

        doc.text(
          ubicacion,
          posicionTitulo,
          33
        );

      }


      /* ===============================================
         INFORMACIÓN DE QUINCENA
      =============================================== */

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(
        12
      );

      doc.text(
        "Reporte de turnos",
        14,
        48
      );


      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(
        10
      );


      const textoQuincena =
        inicio.getDate() <= 15
          ? `Quincena: 1 al 15 de ${obtenerNombreMes(inicio)} de ${inicio.getFullYear()}`
          : `Quincena: 16 al ${fin.getDate()} de ${obtenerNombreMes(inicio)} de ${inicio.getFullYear()}`;


      doc.text(
        textoQuincena,
        14,
        55
      );


      doc.text(
        `Generado: ${hoy.toLocaleDateString(
          "es-CO"
        )}`,
        14,
        61
      );


      /* ===============================================
         PREPARAR DATOS
      =============================================== */

      const filasResumen = [];

      let totalDiaGeneral = 0;

      let totalNocheGeneral = 0;


      trabajadores.forEach(
        (trabajador) => {

          const trabajadorId =
            trabajador.id;

          let totalDia = 0;

          let totalNoche = 0;


          let fechaActual =
            new Date(inicio);


          while (
            fechaActual <= fin
          ) {

            const turno =
              obtenerTurno(
                fechaActual,
                trabajadorId
              );


            if (
              turno === "dia"
            ) {

              totalDia++;

            }


            if (
              turno === "noche"
            ) {

              totalNoche++;

            }


            fechaActual.setDate(
              fechaActual.getDate() + 1
            );

          }


          totalDiaGeneral +=
            totalDia;

          totalNocheGeneral +=
            totalNoche;


          filasResumen.push([

            obtenerNombreTrabajador(
              trabajador
            ),

            String(
              totalDia
            ),

            String(
              totalNoche
            ),

            String(
              totalDia +
              totalNoche
            ),

          ]);

        }
      );


      /* ===============================================
         TABLA RESUMEN
      =============================================== */

      autoTable(
        doc,
        {
          startY: 70,

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

          theme:
            "grid",

          styles: {
            fontSize: 9,
            cellPadding: 3,
          },

          headStyles: {
            fontStyle:
              "bold",
          },

          footStyles: {
            fontStyle:
              "bold",
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

        }
      );


      /* ===============================================
         DETALLE DE TURNOS
      =============================================== */

      let posicionY =
        doc.lastAutoTable.finalY + 12;


      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(
        12
      );

      doc.text(
        "Detalle de turnos",
        14,
        posicionY
      );


      posicionY += 6;


      const filasDetalle = [];


      trabajadores.forEach(
        (trabajador) => {

          let fechaActual =
            new Date(inicio);


          while (
            fechaActual <= fin
          ) {

            const turno =
              obtenerTurno(
                fechaActual,
                trabajador.id
              );


            if (
              turno
            ) {

              const nombre =
                obtenerNombreTrabajador(
                  trabajador
                );


              const tipo =
                turno === "dia"
                  ? "Día"
                  : turno === "noche"
                    ? "Noche"
                    : String(turno);


              filasDetalle.push([

                formatearFecha(
                  obtenerClaveFecha(
                    fechaActual
                  )
                ),

                nombre,

                tipo,

              ]);

            }


            fechaActual.setDate(
              fechaActual.getDate() + 1
            );

          }

        }
      );


      if (
        filasDetalle.length > 0
      ) {

        autoTable(
          doc,
          {
            startY:
              posicionY,

            head: [
              [
                "Fecha",
                "Trabajador",
                "Turno",
              ],
            ],

            body:
              filasDetalle,

            theme:
              "grid",

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
                cellWidth: 30,
              },

              1: {
                cellWidth: 105,
              },

              2: {
                halign: "center",
              },

            },

          }
        );

      } else {

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(
          10
        );

        doc.text(
          "No hay turnos registrados en esta quincena.",
          14,
          posicionY + 5
        );

      }


      /* ===============================================
         FIRMA
      =============================================== */

      const paginaFinal =
        doc.internal.pageSize.getHeight();

      let firmaY =
        paginaFinal - 35;


      if (
        doc.lastAutoTable &&
        doc.lastAutoTable.finalY >
          firmaY - 15
      ) {

        doc.addPage();

        firmaY =
          doc.internal.pageSize.getHeight() - 35;

      }


      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(
        9
      );


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
        pagina <= totalPaginas;
        pagina++
      ) {

        doc.setPage(
          pagina
        );

        const alto =
          doc.internal.pageSize.getHeight();

        const ancho =
          doc.internal.pageSize.getWidth();


        doc.setFontSize(
          8
        );

        doc.setFont(
          "helvetica",
          "normal"
        );


        doc.text(
          `${nombreObra || "Torre Mare"} — Control de obra`,
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
        `turnos-${obtenerClaveFecha(inicio)}-${obtenerClaveFecha(fin)}.pdf`;


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
                value={nombreObra}
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
                value={ubicacion}
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

              Genera un PDF con el resumen y
              detalle de los turnos de la
              quincena actual.

            </p>


            <button
              type="button"
              onClick={
                generarPDF
              }
              disabled={
                generandoPDF
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
                  generandoPDF
                    ? "#98a2b3"
                    : "#175cd3",
                color:
                  "#fff",
                fontSize:
                  "14px",
                fontWeight:
                  "700",
                cursor:
                  generandoPDF
                    ? "not-allowed"
                    : "pointer",
              }}
            >

              {generandoPDF
                ? "Generando PDF..."
                : "📄 Generar PDF de turnos"
              }

            </button>

          </div>

        </section>

      </div>

    </main>

  );

}

export default Administracion;