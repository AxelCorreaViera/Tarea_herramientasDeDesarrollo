"use strict";

const DOCENTE_ID_DEMO = 1;

const selectorCurso = document.getElementById("selectorCurso");
const mensaje = document.getElementById("mensaje");
const seccionEstudiantes = document.getElementById("seccionEstudiantes");
const tituloCurso = document.getElementById("tituloCurso");
const detalleCurso = document.getElementById("detalleCurso");
const tablaEstudiantes = document.getElementById("tablaEstudiantes");
const mensajeEstudiantes = document.getElementById("mensajeEstudiantes");

let cursoActual = null;
let estudiantesActuales = [];
let evaluacionesActuales = [];

/**
 * Obtiene un texto seguro para mostrar, incluso cuando el campo no existe.
 */
function obtenerTexto(objeto, ...campos) {
    for (const campo of campos) {
        const valor = objeto?.[campo];

        if (valor !== undefined && valor !== null && valor !== "") {
            return String(valor);
        }
    }

    return "";
}

/**
 * Carga los cursos asignados al docente.
 */
async function cargarCursos() {
    selectorCurso.disabled = true;
    selectorCurso.replaceChildren(
        crearOpcion("", "Cargando cursos...")
    );

    try {
        const cursos = await consultarAPI(
            `/api/docentes/${DOCENTE_ID_DEMO}/asignaciones`
        );

        selectorCurso.replaceChildren(
            crearOpcion("", "Selecciona un curso")
        );

        cursos.forEach((curso) => {
            const nombre = obtenerTexto(
                curso,
                "nombreCurso",
                "nombre",
                "curso"
            );

            const codigo = obtenerTexto(
                curso,
                "codigoCurso",
                "codigo"
            );

            const texto = codigo
                ? `${codigo} - ${nombre}`
                : nombre || `Curso ${curso.id}`;

            selectorCurso.appendChild(
                crearOpcion(curso.id, texto)
            );
        });

        selectorCurso.disabled = false;

        if (cursos.length === 0) {
            mostrarMensaje(
                mensaje,
                "No tienes cursos asignados.",
                true
            );
            return;
        }

        mostrarMensaje(
            mensaje,
            "Selecciona un curso para consultar sus estudiantes."
        );
    } catch (error) {
        selectorCurso.replaceChildren(
            crearOpcion("", "No se pudieron cargar los cursos")
        );

        mostrarMensaje(
            mensaje,
            `Error al consultar los cursos: ${error.message}`,
            true
        );
    }
}

/**
 * Muestra un mensaje de estado en la página.
 */
function mostrarMensaje(elemento, texto, esError = false) {
    elemento.textContent = texto;
    elemento.classList.toggle("error", esError);
}

/**
 * Cuando cambia el curso seleccionado, consulta sus estudiantes
 * y las evaluaciones necesarias para construir las fichas académicas.
 */
async function seleccionarCurso() {
    const cursoId = selectorCurso.value;

    cursoActual = null;
    estudiantesActuales = [];
    evaluacionesActuales = [];

    seccionEstudiantes.hidden = true;
    tablaEstudiantes.replaceChildren();
    mensajeEstudiantes.textContent = "";

    if (!cursoId) {
        mostrarMensaje(
            mensaje,
            "Selecciona un curso para consultar sus estudiantes."
        );
        return;
    }

    const opcionSeleccionada =
        selectorCurso.options[selectorCurso.selectedIndex];

    cursoActual = {
        id: Number(cursoId),
        nombre: opcionSeleccionada.textContent
    };

    selectorCurso.disabled = true;

    mostrarMensaje(
        mensaje,
        "Consultando estudiantes y evaluaciones..."
    );

    try {
        const [estudiantes, evaluaciones] = await Promise.all([
            consultarAPI(
                `/api/asignaciones/${cursoActual.id}/estudiantes`
            ),
            consultarAPI(
                `/api/asignaciones/${cursoActual.id}/evaluaciones`
            )
        ]);

        estudiantesActuales = estudiantes;
        evaluacionesActuales = evaluaciones;

        tituloCurso.textContent = "Estudiantes matriculados";
        detalleCurso.textContent =
            `Curso seleccionado: ${cursoActual.nombre}`;

        seccionEstudiantes.hidden = false;

        dibujarEstudiantes();

        mostrarMensaje(
            mensaje,
            `Curso cargado. Estudiantes encontrados: ${estudiantes.length}.`
        );
    } catch (error) {
        mostrarMensaje(
            mensaje,
            `No se pudo cargar la información del curso: ${error.message}`,
            true
        );
    } finally {
        selectorCurso.disabled = false;
    }
}

/**
 * Construye la tabla de estudiantes del curso seleccionado.
 */
function dibujarEstudiantes() {
    tablaEstudiantes.replaceChildren();

    if (estudiantesActuales.length === 0) {
        const fila = crearElemento("tr");
        const celda = crearElemento(
            "td",
            "No hay estudiantes matriculados en este curso."
        );

        celda.colSpan = 4;
        fila.appendChild(celda);
        tablaEstudiantes.appendChild(fila);

        mostrarMensaje(
            mensajeEstudiantes,
            "No se encontraron estudiantes."
        );

        return;
    }

    estudiantesActuales.forEach((estudiante) => {
        const fila = crearElemento("tr");

        const codigo = obtenerTexto(estudiante, "codigoEstudiante");

        const nombre = obtenerTexto(estudiante, "nombres");
        const apellidos = obtenerTexto(estudiante, "apellidos");

        const nombreCompleto = `${apellidos} ${nombre}`.trim();

        fila.appendChild(crearElemento("td", codigo || "Sin código"));
        fila.appendChild(
            crearElemento("td", nombreCompleto || "Sin nombre")
        );
        fila.appendChild(
            crearElemento(
                "td",
                obtenerTexto(estudiante, "correo") || "Sin correo"
            )
        );

        const celdaAcciones = crearElemento("td");
        const botonFicha = crearBoton(
            "Ver ficha",
            () => mostrarFichaEstudiante(estudiante)
        );

        celdaAcciones.appendChild(botonFicha);
        fila.appendChild(celdaAcciones);

        tablaEstudiantes.appendChild(fila);
    });

    mostrarMensaje(
        mensajeEstudiantes,
        "Selecciona «Ver ficha» para revisar el rendimiento académico."
    );
}

/**
 * Muestra la ficha académica de un estudiante.
 */
async function mostrarFichaEstudiante(estudiante) {
    let ficha = document.getElementById("fichaEstudiante");

    if (!ficha) {
        ficha = crearElemento("section");
        ficha.id = "fichaEstudiante";
        ficha.className = "panel";
        seccionEstudiantes.appendChild(ficha);
    }

    ficha.replaceChildren(
        crearElemento("h2", "Ficha académica"),
        crearElemento("p", "Consultando calificaciones y asistencia...")
    );

    ficha.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    try {
        const [calificaciones, promedio, asistencias] = await Promise.all([
            consultarAPI(
                `/api/matriculas/${estudiante.matriculaId}/calificaciones`
            ),
            consultarAPI(
                `/api/matriculas/${estudiante.matriculaId}/promedio`
            ),
            consultarAPI(
                `/api/matriculas/${estudiante.matriculaId}/asistencias`
            )
        ]);

        ficha.replaceChildren();

        const encabezado = crearElemento("div");
        encabezado.className = "ficha-encabezado";

        const datosEstudiante = crearElemento("div");
        const nombre = obtenerTexto(
            estudiante,
            "nombreCompleto",
            "nombresCompletos",
            "nombre",
            "nombres"
        );
        const apellidos = obtenerTexto(
            estudiante,
            "apellidos",
            "apellido"
        );

        datosEstudiante.appendChild(
            crearElemento(
                "h2",
                `${apellidos} ${nombre}`.trim() || "Ficha académica"
            )
        );

        datosEstudiante.appendChild(
            crearElemento(
                "p",
                `Código: ${obtenerTexto(estudiante, "codigo", "codigoEstudiante") || "No disponible"}`
            )
        );

        datosEstudiante.appendChild(
            crearElemento(
                "p",
                `Correo: ${obtenerTexto(estudiante, "correo", "email") || "No disponible"}`
            )
        );

        encabezado.appendChild(datosEstudiante);

        encabezado.appendChild(
            crearBoton("Cerrar ficha", () => ficha.remove())
        );

        ficha.appendChild(encabezado);

        dibujarResumenAcademico(ficha, promedio, calificaciones);
        dibujarHistorialCalificaciones(ficha, calificaciones);
        dibujarRegistroNotas(ficha, estudiante);
        dibujarHistorialAsistencia(ficha, asistencias);
    } catch (error) {
        ficha.replaceChildren(
            crearElemento("h2", "Ficha académica"),
            crearElemento(
                "p",
                `No se pudo cargar la ficha: ${error.message}`
            ),
            crearBoton(
                "Reintentar",
                () => mostrarFichaEstudiante(estudiante)
            ),
            crearBoton("Cerrar ficha", () => ficha.remove())
        );
    }
}

/**
 * Muestra el promedio y el estado de las calificaciones.
 */

function dibujarResumenAcademico(ficha, promedio, calificaciones) {
    const seccion = crearElemento("section");
    seccion.className = "resumen-academico";

    seccion.appendChild(
        crearElemento("h3", "Rendimiento académico")
    );

    const valorPromedio = promedio?.promedio;
    const promedioTexto =
        valorPromedio !== null && valorPromedio !== undefined
            ? Number(valorPromedio).toFixed(2)
            : "Pendiente";

    seccion.appendChild(
        crearElemento("p", `Promedio ponderado: ${promedioTexto}`)
    );

    seccion.appendChild(
        crearElemento(
            "p",
            `Evaluaciones calificadas: ${promedio?.evaluacionesCalificadas ?? calificaciones.length
            } de ${promedio?.evaluacionesTotales ?? evaluacionesActuales.length}`
        )
    );

    const porcentaje = promedio?.porcentajeEvaluado;

    seccion.appendChild(
        crearElemento(
            "p",
            `Porcentaje evaluado: ${porcentaje !== null && porcentaje !== undefined
                ? `${Number(porcentaje).toFixed(2)}%`
                : "No disponible"
            }`
        )
    );

    seccion.appendChild(
        crearElemento(
            "p",
            `Estado del promedio: ${promedio?.definitivo ? "Definitivo" : "Parcial"
            }`
        )
    );

    ficha.appendChild(seccion);
}


/**
 * Muestra las calificaciones existentes y sus evaluaciones.
 */
function dibujarHistorialCalificaciones(ficha, calificaciones) {
    const seccion = crearElemento("section");
    seccion.appendChild(
        crearElemento("h3", "Historial de calificaciones")
    );

    if (calificaciones.length === 0) {
        seccion.appendChild(
            crearElemento("p", "Todavía no hay calificaciones registradas.")
        );

        ficha.appendChild(seccion);
        return;
    }

    const contenedor = crearElemento("div");
    contenedor.className = "tabla-contenedor";

    const tabla = crearElemento("table");
    const encabezado = crearElemento("thead");
    const filaEncabezado = crearElemento("tr");

    ["Evaluación", "Calificación"].forEach((texto) => {
        filaEncabezado.appendChild(crearElemento("th", texto));
    });

    encabezado.appendChild(filaEncabezado);
    tabla.appendChild(encabezado);

    const cuerpo = crearElemento("tbody");

    calificaciones.forEach((calificacion) => {
        const fila = crearElemento("tr");

        fila.appendChild(
            crearElemento(
                "td",
                obtenerTexto(
                    calificacion,
                    "nombreActividad",
                    "nombreEvaluacion",
                    "actividad",
                    "titulo"
                ) || obtenerTexto(
                    evaluacionesActuales.find(
                        (evaluacion) =>
                            String(evaluacion.id) ===
                            String(calificacion.actividadEvaluableId)
                    ),
                    "nombre",
                    "titulo",
                    "descripcion"
                ) || "Evaluación"
            )
        );

        fila.appendChild(
            crearElemento(
                "td",
                obtenerTexto(calificacion, "nota", "calificacion", "valor") ||
                "Sin nota"
            )
        );

        cuerpo.appendChild(fila);
    });

    tabla.appendChild(cuerpo);
    contenedor.appendChild(tabla);
    seccion.appendChild(contenedor);
    ficha.appendChild(seccion);
}

/**
 * Crea un formulario para registrar o actualizar la nota
 * de cada evaluación del curso seleccionado.
 */
function dibujarRegistroNotas(ficha, estudiante) {
    const seccion = crearElemento("section");
    seccion.className = "seccion-registro-notas";

    seccion.appendChild(
        crearElemento("h3", "Registro de calificaciones")
    );

    if (evaluacionesActuales.length === 0) {
        seccion.appendChild(
            crearElemento(
                "p",
                "Este curso todavía no tiene evaluaciones registradas."
            )
        );

        ficha.appendChild(seccion);
        return;
    }

    evaluacionesActuales.forEach((evaluacion) => {
        const nombreEvaluacion = obtenerTexto(
            evaluacion,
            "nombre",
            "titulo",
            "descripcion"
        ) || `Evaluación ${evaluacion.id}`;

        const campoNota = crearCampo(
            `Nota para ${nombreEvaluacion} (0 a 20)`,
            "number",
            "nota",
            true
        );

        campoNota.campo.min = "0";
        campoNota.campo.max = "20";
        campoNota.campo.step = "0.01";

        const formulario = crearFormulario(
            nombreEvaluacion,
            [campoNota],
            async () => {
                const nota = Number(campoNota.campo.value);

                if (
                    !Number.isFinite(nota) ||
                    nota < 0 ||
                    nota > 20
                ) {
                    throw new Error(
                        "La nota debe estar entre 0 y 20."
                    );
                }

                await consultarAPI(
                    `/api/matriculas/${estudiante.matriculaId}/calificaciones/${evaluacion.id}`,
                    {
                        method: "POST",
                        body: JSON.stringify({ nota })
                    }
                );

                await mostrarFichaEstudiante(estudiante);
            }
        );

        seccion.appendChild(formulario);
    });

    ficha.appendChild(seccion);
}

/**
 * Muestra las sesiones y el estado de asistencia del estudiante.
 */
function dibujarHistorialAsistencia(ficha, asistencias) {
    const seccion = crearElemento("section");
    seccion.appendChild(
        crearElemento("h3", "Historial de asistencia")
    );

    if (asistencias.length === 0) {
        seccion.appendChild(
            crearElemento("p", "No hay registros de asistencia.")
        );

        ficha.appendChild(seccion);
        return;
    }

    const contenedor = crearElemento("div");
    contenedor.className = "tabla-contenedor";

    const tabla = crearElemento("table");
    const encabezado = crearElemento("thead");
    const filaEncabezado = crearElemento("tr");

    ["Fecha", "Sesión", "Estado"].forEach((texto) => {
        filaEncabezado.appendChild(crearElemento("th", texto));
    });

    encabezado.appendChild(filaEncabezado);
    tabla.appendChild(encabezado);

    const cuerpo = crearElemento("tbody");

    asistencias.forEach((asistencia) => {
        const fila = crearElemento("tr");

        fila.appendChild(
            crearElemento(
                "td",
                obtenerTexto(asistencia, "fecha", "fechaSesion") ||
                "Sin fecha"
            )
        );

        fila.appendChild(
            crearElemento(
                "td",
                obtenerTexto(
                    asistencia,
                    "descripcionSesion",
                    "nombreSesion",
                    "sesion"
                ) || "Sesión de clase"
            )
        );

        fila.appendChild(
            crearElemento(
                "td",
                obtenerTexto(asistencia, "estado", "tipo") ||
                "Sin estado"
            )
        );

        cuerpo.appendChild(fila);
    });

    tabla.appendChild(cuerpo);
    contenedor.appendChild(tabla);
    seccion.appendChild(contenedor);
    ficha.appendChild(seccion);
}

/**
 * Permite cambiar el curso desde el selector de la página.
 */
selectorCurso.addEventListener("change", seleccionarCurso);

// Carga inicial de cursos asignados al docente.
cargarCursos();
