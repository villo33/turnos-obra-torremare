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

  const [horaInicioDia, setHoraInicioDia] = useState("06:00");
  const [horaFinDia, setHoraFinDia] = useState("18:00");

  const [horaInicioNoche, setHoraInicioNoche] =
    useState("18:00");

  const [horaFinNoche, setHoraFinNoche] =
    useState("06:00");

  const [guardado, setGuardado] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  /* =====================================================
     TURNOS REALES
  ===================================================== */

  const [turnosReales, setTurnosReales] = useState([]);
  const [cargandoTurnos, setCargandoTurnos] = useState(true);
  const [errorTurnos, setErrorTurnos] = useState("");

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

    if (quincenaReporte === "primera") {
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
          total: dia + noche,
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
     
     IMPORTANTE:
     CADA TRABAJADOR SE MANEJA COMO BLOQUE COMPLETO.
     SI NO CABE, TODO EL BLOQUE PASA A LA SIGUIENTE
     PÁGINA.
  ===================================================== */

  const generarPDF = async () => {
    if (generandoPDF) {
      return;
    }

    try {
      setGenerandoPDF(true);

      /* ===============================================
         OBTENER DATOS ACTUALIZADOS
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

      const {
        inicio,
        fin,
      } = obtenerFechasReporte();

      /* ===============================================
         CREAR DOCUMENTO
      =============================================== */

      const doc =
        new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

      const anchoPagina =
        doc.internal.pageSize.getWidth();

      const altoPagina =
        doc.internal.pageSize.getHeight();

      const margen = 14;

      /* ===============================================
         COLORES
      =============================================== */

      const azulOscuro = [
        15,
        23,
        42,
      ];

      const azul = [
        37,
        99,
        235,
      ];

      const azulClaro = [
        239,
        246,
        255,
      ];

      const morado = [
        124,
        58,
        237,
      ];

      const moradoClaro = [
        245,
        243,
        255,
      ];

      const verde = [
        22,
        163,
        74,
      ];

      const verdeClaro = [
        240,
        253,
        244,
      ];

      const grisTexto = [
        71,
        85,
        105,
      ];

      const grisClaro = [
        248,
        250,
        252,
      ];

      const grisBorde = [
        226,
        232,
        240,
      ];

      /* ===============================================
         LOGO
      =============================================== */

      const logo =
        await cargarLogo();

      /* ===============================================
         ENCABEZADO
      =============================================== */

      const dibujarEncabezado = (
        pagina,
        informacion = false
      ) => {
        doc.setFillColor(
          ...azulOscuro
        );

        doc.rect(
          0,
          0,
          anchoPagina,
          4,
          "F"
        );

        if (logo) {
          try {
            doc.addImage(
              logo,
              "PNG",
              margen,
              11,
              22,
              22
            );
          } catch (error) {
            console.warn(
              "No se pudo insertar el logo:",
              error
            );
          }
        }

        const xTitulo =
          logo
            ? margen + 28
            : margen;

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(17);

        doc.setTextColor(
          ...azulOscuro
        );

        doc.text(
          nombreObra ||
            "Torre Mare",
          xTitulo,
          18
        );

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(9);

        doc.setTextColor(
          ...grisTexto
        );

        doc.text(
          ubicacion ||
            "Control de personal y turnos",
          xTitulo,
          24
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(9);

        doc.setTextColor(
          ...azul
        );

        doc.text(
          "REPORTE DE TURNOS",
          xTitulo,
          30
        );

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(8);

        doc.setTextColor(
          ...grisTexto
        );

        doc.text(
          `Página ${pagina}`,
          anchoPagina - margen,
          18,
          {
            align: "right",
          }
        );

        doc.setDrawColor(
          ...grisBorde
        );

        doc.setLineWidth(0.4);

        doc.line(
          margen,
          37,
          anchoPagina - margen,
          37
        );

        if (informacion) {
          doc.setFillColor(
            ...grisClaro
          );

          doc.roundedRect(
            margen,
            43,
            anchoPagina -
              margen * 2,
            22,
            3,
            3,
            "F"
          );

          doc.setFont(
            "helvetica",
            "bold"
          );

          doc.setFontSize(8);

          doc.setTextColor(
            ...grisTexto
          );

          doc.text(
            "PERÍODO",
            margen + 7,
            51
          );

          doc.setFontSize(11);

          doc.setTextColor(
            ...azulOscuro
          );

          doc.text(
            obtenerTextoPeriodo(),
            margen + 7,
            58
          );

          doc.setFont(
            "helvetica",
            "normal"
          );

          doc.setFontSize(8);

          doc.setTextColor(
            ...grisTexto
          );

          doc.text(
            "Reporte de asistencia y turnos",
            anchoPagina -
              margen -
              7,
            51,
            {
              align: "right",
            }
          );

          doc.text(
            `Generado: ${new Date().toLocaleDateString(
              "es-CO"
            )}`,
            anchoPagina -
              margen -
              7,
            58,
            {
              align: "right",
            }
          );
        }
      };

      /* ===============================================
         PRIMERA PÁGINA
      =============================================== */

      dibujarEncabezado(
        1,
        true
      );

      /* ===============================================
         TOTALES GENERALES
      =============================================== */

      let totalDiaGeneral = 0;
      let totalNocheGeneral = 0;

      const filasResumen =
        trabajadores.map(
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

            return [
              obtenerNombreTrabajador(
                trabajador
              ),
              String(dia),
              String(noche),
              String(dia + noche),
            ];
          }
        );

      const totalGeneral =
        totalDiaGeneral +
        totalNocheGeneral;

      /* ===============================================
         TARJETAS GENERALES
      =============================================== */

      const tarjetasY = 71;
      const separacion = 4;

      const anchoTarjeta =
        (anchoPagina -
          margen * 2 -
          separacion * 2) /
        3;

      /* DÍA */

      doc.setFillColor(
        ...azulClaro
      );

      doc.roundedRect(
        margen,
        tarjetasY,
        anchoTarjeta,
        22,
        3,
        3,
        "F"
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(8);

      doc.setTextColor(
        ...azul
      );

      doc.text(
        "TURNOS DE DÍA",
        margen + 6,
        tarjetasY + 8
      );

      doc.setFontSize(16);

      doc.setTextColor(
        ...azulOscuro
      );

      doc.text(
        String(totalDiaGeneral),
        margen + 6,
        tarjetasY + 18
      );

      /* NOCHE */

      const nocheX =
        margen +
        anchoTarjeta +
        separacion;

      doc.setFillColor(
        ...moradoClaro
      );

      doc.roundedRect(
        nocheX,
        tarjetasY,
        anchoTarjeta,
        22,
        3,
        3,
        "F"
      );

      doc.setFontSize(8);

      doc.setTextColor(
        ...morado
      );

      doc.text(
        "TURNOS DE NOCHE",
        nocheX + 6,
        tarjetasY + 8
      );

      doc.setFontSize(16);

      doc.setTextColor(
        ...azulOscuro
      );

      doc.text(
        String(totalNocheGeneral),
        nocheX + 6,
        tarjetasY + 18
      );

      /* TOTAL */

      const totalX =
        margen +
        (anchoTarjeta +
          separacion) *
          2;

      doc.setFillColor(
        ...verdeClaro
      );

      doc.roundedRect(
        totalX,
        tarjetasY,
        anchoTarjeta,
        22,
        3,
        3,
        "F"
      );

      doc.setFontSize(8);

      doc.setTextColor(
        ...verde
      );

      doc.text(
        "TOTAL TURNOS",
        totalX + 6,
        tarjetasY + 8
      );

      doc.setFontSize(16);

      doc.setTextColor(
        ...azulOscuro
      );

      doc.text(
        String(totalGeneral),
        totalX + 6,
        tarjetasY + 18
      );

      /* ===============================================
         RESUMEN GENERAL
      =============================================== */

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(11);

      doc.setTextColor(
        ...azulOscuro
      );

      doc.text(
        "Resumen por trabajador",
        margen,
        105
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8);

      doc.setTextColor(
        ...grisTexto
      );

      doc.text(
        "Cantidad de jornadas registradas durante el período.",
        margen,
        111
      );

      autoTable(doc, {
        startY: 116,

        margin: {
          left: margen,
          right: margen,
        },

        head: [
          [
            "Trabajador",
            "Día",
            "Noche",
            "Total",
          ],
        ],

        body: filasResumen,

        foot: [
          [
            "TOTAL GENERAL",
            String(totalDiaGeneral),
            String(totalNocheGeneral),
            String(totalGeneral),
          ],
        ],

        theme: "grid",

        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: 3,
          textColor: azulOscuro,
          lineColor: grisBorde,
          lineWidth: 0.2,
          valign: "middle",
        },

        headStyles: {
          fillColor: azulOscuro,
          textColor: [
            255,
            255,
            255,
          ],
          fontStyle: "bold",
          halign: "center",
        },

        footStyles: {
          fillColor: azulClaro,
          textColor: azulOscuro,
          fontStyle: "bold",
          halign: "center",
        },

        columnStyles: {
          0: {
            halign: "left",
          },

          1: {
            halign: "center",
            cellWidth: 24,
          },

          2: {
            halign: "center",
            cellWidth: 28,
          },

          3: {
            halign: "center",
            cellWidth: 26,
          },
        },

        alternateRowStyles: {
          fillColor: [
            252,
            252,
            253,
          ],
        },
      });

      /* ===============================================
         DETALLE
      =============================================== */

      let posicionY =
        doc.lastAutoTable.finalY + 13;

      if (
        posicionY >
        altoPagina - 55
      ) {
        doc.addPage();

        dibujarEncabezado(
          doc.getNumberOfPages()
        );

        posicionY = 49;
      }

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(12);

      doc.setTextColor(
        ...azulOscuro
      );

      doc.text(
        "Detalle por trabajador",
        margen,
        posicionY
      );

      posicionY += 6;

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8);

      doc.setTextColor(
        ...grisTexto
      );

      doc.text(
        "Registro de las fechas exactas y turnos realizados.",
        margen,
        posicionY
      );

      posicionY += 8;

      /* =================================================
         FUNCIÓN PARA CREAR UNA NUEVA PÁGINA
      ================================================= */

      const nuevaPagina = () => {
        doc.addPage();

        dibujarEncabezado(
          doc.getNumberOfPages()
        );

        return 49;
      };

      /* =================================================
         TRABAJADORES
         
         IMPORTANTE:
         NO SE DIBUJA NADA DEL TRABAJADOR HASTA
         COMPROBAR QUE TODO SU BLOQUE CABE.
      ================================================= */

      for (
        let indice = 0;
        indice < trabajadores.length;
        indice++
      ) {
        const trabajador =
          trabajadores[indice];

        /* ---------------------------------------------
           BUSCAR TURNOS
        --------------------------------------------- */

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
              String(a.fecha).localeCompare(
                String(b.fecha)
              )
            );

        /* ---------------------------------------------
           CONTADORES
        --------------------------------------------- */

        const cantidadDia =
          turnosTrabajador.filter(
            (turno) =>
              turno.tipo === "dia"
          ).length;

        const cantidadNoche =
          turnosTrabajador.filter(
            (turno) =>
              turno.tipo === "noche"
          ).length;

        const cantidadTotal =
          turnosTrabajador.length;

        /* ---------------------------------------------
           ALTURA REAL APROXIMADA DEL BLOQUE
           
           15  -> encabezado
           17  -> espacio
           13  -> tarjetas
           17  -> espacio
           10  -> encabezado tabla
           6   -> cada fila
           10  -> separación
        --------------------------------------------- */

        const alturaEncabezado = 15;
        const alturaTarjetas = 13;
        const alturaSeparaciones = 34;
        const alturaCabeceraTabla = 9;
        const alturaFila = 6;

        const alturaBloque =
          alturaEncabezado +
          alturaTarjetas +
          alturaSeparaciones +
          alturaCabeceraTabla +
          Math.max(
            turnosTrabajador.length,
            1
          ) *
            alturaFila;

        /* ---------------------------------------------
           ESPACIO RESERVADO PARA EL PIE
        --------------------------------------------- */

        const espacioPie =
          23;

        /* ---------------------------------------------
           COMPROBAR ANTES DE DIBUJAR
           
           SI NO CABE TODO:
           → NUEVA PÁGINA
           → BLOQUE COMPLETO
        --------------------------------------------- */

        if (
          posicionY +
            alturaBloque +
            espacioPie >
          altoPagina
        ) {
          posicionY =
            nuevaPagina();
        }

        /* =============================================
           CABECERA DEL TRABAJADOR
        ============================================= */

        doc.setFillColor(
          ...azulOscuro
        );

        doc.roundedRect(
          margen,
          posicionY,
          anchoPagina -
            margen * 2,
          15,
          3,
          3,
          "F"
        );

        /* Número */

        doc.setFillColor(
          ...azul
        );

        doc.circle(
          margen + 8,
          posicionY + 7.5,
          4,
          "F"
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(7);

        doc.setTextColor(
          255,
          255,
          255
        );

        doc.text(
          String(indice + 1),
          margen + 8,
          posicionY + 9.5,
          {
            align: "center",
          }
        );

        /* Nombre */

        doc.setFontSize(10);

        doc.text(
          obtenerNombreTrabajador(
            trabajador
          ),
          margen + 16,
          posicionY + 9
        );

        /* Total */

        doc.setFontSize(8);

        doc.text(
          `${cantidadTotal} turnos`,
          anchoPagina -
            margen -
            6,
          posicionY + 9,
          {
            align: "right",
          }
        );

        posicionY += 19;

        /* =============================================
           TARJETAS DEL TRABAJADOR
        ============================================= */

        const miniAncho =
          (anchoPagina -
            margen * 2 -
            8) /
          3;

        /* DÍA */

        doc.setFillColor(
          ...azulClaro
        );

        doc.roundedRect(
          margen,
          posicionY,
          miniAncho,
          13,
          2,
          2,
          "F"
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(7);

        doc.setTextColor(
          ...azul
        );

        doc.text(
          `DÍA  ${cantidadDia}`,
          margen + 5,
          posicionY + 8
        );

        /* NOCHE */

        const miniNocheX =
          margen +
          miniAncho +
          4;

        doc.setFillColor(
          ...moradoClaro
        );

        doc.roundedRect(
          miniNocheX,
          posicionY,
          miniAncho,
          13,
          2,
          2,
          "F"
        );

        doc.setTextColor(
          ...morado
        );

        doc.text(
          `NOCHE  ${cantidadNoche}`,
          miniNocheX + 5,
          posicionY + 8
        );

        /* TOTAL */

        const miniTotalX =
          margen +
          (miniAncho + 4) *
            2;

        doc.setFillColor(
          ...verdeClaro
        );

        doc.roundedRect(
          miniTotalX,
          posicionY,
          miniAncho,
          13,
          2,
          2,
          "F"
        );

        doc.setTextColor(
          ...verde
        );

        doc.text(
          `TOTAL  ${cantidadTotal}`,
          miniTotalX + 5,
          posicionY + 8
        );

        posicionY += 17;

        /* =============================================
           SIN TURNOS
        ============================================= */

        if (
          turnosTrabajador.length ===
          0
        ) {
          doc.setFillColor(
            ...grisClaro
          );

          doc.roundedRect(
            margen,
            posicionY,
            anchoPagina -
              margen * 2,
            13,
            2,
            2,
            "F"
          );

          doc.setFont(
            "helvetica",
            "normal"
          );

          doc.setFontSize(8);

          doc.setTextColor(
            ...grisTexto
          );

          doc.text(
            "No tiene turnos registrados en este período.",
            margen + 6,
            posicionY + 8
          );

          posicionY += 21;

          continue;
        }

        /* =============================================
           TABLA DEL TRABAJADOR
           
           pageBreak: "avoid"
           
           Esto es MUY IMPORTANTE:
           jsPDF-AutoTable intentará mantener
           esta tabla completa junta.
        ============================================= */

        const filasTrabajador =
          turnosTrabajador.map(
            (turno) => {
              const tipo =
                String(
                  turno.tipo || ""
                )
                  .toLowerCase()
                  .trim();

              return [
                formatearFecha(
                  turno.fecha
                ),
                tipo === "noche"
                  ? "NOCHE"
                  : "DÍA",
              ];
            }
          );

        autoTable(doc, {
          startY: posicionY,

          pageBreak: "avoid",

          margin: {
            left: margen,
            right: margen,
            top: 45,
            bottom: 23,
          },

          head: [
            [
              "Día trabajado",
              "Turno",
            ],
          ],

          body: filasTrabajador,

          theme: "grid",

          styles: {
            font: "helvetica",
            fontSize: 7.8,
            cellPadding: 2.5,
            textColor: azulOscuro,
            lineColor: grisBorde,
            lineWidth: 0.2,
            valign: "middle",
          },

          headStyles: {
            fillColor: [
              241,
              245,
              249,
            ],

            textColor:
              azulOscuro,

            fontStyle: "bold",

            halign: "center",

            cellPadding: 3,
          },

          columnStyles: {
            0: {
              cellWidth: 120,
              halign: "left",
            },

            1: {
              cellWidth: 35,
              halign: "center",
            },
          },

          alternateRowStyles: {
            fillColor: [
              252,
              252,
              253,
            ],
          },

          didParseCell: (
            data
          ) => {
            if (
              data.section ===
                "body" &&
              data.column.index ===
                1
            ) {
              const valor =
                String(
                  data.cell.raw || ""
                ).toUpperCase();

              if (
                valor === "NOCHE"
              ) {
                data.cell.styles.fillColor =
                  moradoClaro;

                data.cell.styles.textColor =
                  morado;

                data.cell.styles.fontStyle =
                  "bold";
              } else {
                data.cell.styles.fillColor =
                  azulClaro;

                data.cell.styles.textColor =
                  azul;

                data.cell.styles.fontStyle =
                  "bold";
              }
            }
          },
        });

        /* ---------------------------------------------
           IMPORTANTE:
           AutoTable puede crear una página.
           
           Si eso sucede, actualizamos posicionY
           usando la posición final de la tabla.
        --------------------------------------------- */

        posicionY =
          doc.lastAutoTable.finalY +
          10;
      }

      /* ===============================================
         SI NO HAY TRABAJADORES
      =============================================== */

      if (
        trabajadores.length ===
        0
      ) {
        if (
          posicionY >
          altoPagina - 55
        ) {
          posicionY =
            nuevaPagina();
        }

        doc.setFillColor(
          ...grisClaro
        );

        doc.roundedRect(
          margen,
          posicionY,
          anchoPagina -
            margen * 2,
          25,
          3,
          3,
          "F"
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(10);

        doc.setTextColor(
          ...azulOscuro
        );

        doc.text(
          "No hay trabajadores registrados",
          anchoPagina / 2,
          posicionY + 10,
          {
            align: "center",
          }
        );

        posicionY += 30;
      }

      /* ===============================================
         FIRMA
      =============================================== */

      let firmaY =
        altoPagina - 37;

      if (
        posicionY >
        firmaY - 8
      ) {
        posicionY =
          nuevaPagina();

        firmaY =
          altoPagina - 37;
      }

      doc.setDrawColor(
        ...grisTexto
      );

      doc.setLineWidth(
        0.4
      );

      doc.line(
        65,
        firmaY,
        145,
        firmaY
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(8);

      doc.setTextColor(
        ...azulOscuro
      );

      doc.text(
        "Firma del administrador",
        105,
        firmaY + 6,
        {
          align: "center",
        }
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(7);

      doc.setTextColor(
        ...grisTexto
      );

      doc.text(
        nombreObra ||
          "Torre Mare",
        105,
        firmaY + 11,
        {
          align: "center",
        }
      );

      /* ===============================================
         PIE DE TODAS LAS PÁGINAS
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

        doc.setDrawColor(
          ...grisBorde
        );

        doc.setLineWidth(
          0.3
        );

        doc.line(
          margen,
          alto - 15,
          ancho - margen,
          alto - 15
        );

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(7);

        doc.setTextColor(
          ...grisTexto
        );

        doc.text(
          `${nombreObra || "Torre Mare"} · Control de turnos`,
          margen,
          alto - 9
        );

        doc.text(
          `Página ${pagina} de ${totalPaginas}`,
          ancho - margen,
          alto - 9,
          {
            align: "right",
          }
        );
      }

      /* ===============================================
         GUARDAR PDF
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
              Selecciona la quincena que deseas
              consultar. El reporte muestra los
              días exactos trabajados por cada
              persona.
            </p>

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