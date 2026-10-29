
"use strict";

const DOCENTE_ID_CALIFICACIONES = 1;

const selectorCurso = document.getElementById("selectorCurso");
const selectorEstudiante = document.getElementById("selectorEstudiante");
const mensaje = document.getElementById("mensaje");
const seccionCalificaciones = document.getElementById("seccionCalificaciones");
const tituloCurso = document.getElementById("tituloCurso");
const detalleCurso = document.getElementById("detalleCurso");
const progresoEstudiantes = document.getElementById("progresoEstudiantes");
const datosEstudiante = document.getElementById("datosEstudiante");
const nombreEstudiante = document.getElementById("nombreEstudiante");
const codigoEstudiante = document.getElementById("codigoEstudiante");
const listaEvaluaciones = document.getElementById("listaEvaluaciones");
const mensajeCalificaciones = document.getElementById("mensajeCalificaciones");

const botonAnterior = document.getElementById("botonAnterior");
const botonSiguiente = document.getElementById("botonSiguiente");
const botonAnteriorInferior = document.getElementById("botonAnteriorInferior");
const botonSiguienteInferior = document.getElementById("botonSiguienteInferior");

let cursoActual = null;
let estudiantesActuales = [];
let evaluacionesActuales = [];
let indiceEstudianteActual = -1;
let solicitudEstudiante = 0;

function mostrarMensaje(elemento, texto, esError = false) {
    elemento.textContent = texto;
    elemento.classList.toggle("error", esError);
}

function crearCeldaTexto(etiqueta, texto) {
    const elemento = document.createElement(etiqueta);
    elemento.textContent = texto;
    return elemento;
}

function obtenerNombreCurso(curso) {
    return curso.nombreCurso ?? curso.nombre ?? curso.curso ?? "Curso sin nombre";
}

function obtenerCodigoCurso(curso) {
    return curso.codigoCurso ?? curso.codigo ?? "";
}

function obtenerNombreEstudiante(estudiante) {
    return `${estudiante.apellidos ?? ""}, ${estudiante.nombres ?? ""}`.trim();
}

async function cargarCursos() {
    selectorCurso.disabled = true;
    selectorCurso.replaceChildren(crearOpcion("", "Cargando cursos..."));

    try {
        const cursos = await consultarAPI(
            `/api/docentes/${DOCENTE_ID_CALIFICACIONES}/asignaciones`
        );

        selectorCurso.replaceChildren(
            crearOpcion("", "Selecciona un curso")
        );

        cursos.forEach((curso) => {
            const codigo = obtenerCodigoCurso(curso);
            const nombre = obtenerNombreCurso(curso);

            selectorCurso.appendChild(
                crearOpcion(
                    curso.id,
                    codigo ? `${codigo} - ${nombre}` : nombre
                )
            );
        });

        selectorCurso.disabled = false;

        mostrarMensaje(
            mensaje,
            cursos.length
                ? "Selecciona un curso para comenzar a registrar notas."
                : "No tienes cursos asignados."
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

async function seleccionarCurso() {
    const cursoId = selectorCurso.value;

    solicitudEstudiante++;
    cursoActual = null;
    estudiantesActuales = [];
    evaluacionesActuales = [];
    indiceEstudianteActual = -1;

    seccionCalificaciones.hidden = true;
    selectorEstudiante.replaceChildren();
    listaEvaluaciones.replaceChildren();
    datosEstudiante.hidden = true;

    if (!cursoId) {
        mostrarMensaje(mensaje, "Selecciona un curso.");
        return;
    }

    const opcion = selectorCurso.options[selectorCurso.selectedIndex];

    cursoActual = {
        id: Number(cursoId),
        nombre: opcion.textContent
    };

    selectorCurso.disabled = true;
    mostrarMensaje(mensaje, "Cargando estudiantes y evaluaciones...");

    try {
        const [estudiantes, evaluaciones] = await Promise.all([
            consultarAPI(`/api/asignaciones/${cursoActual.id}/estudiantes`),
            consultarAPI(`/api/asignaciones/${cursoActual.id}/evaluaciones`)
        ]);

        estudiantesActuales = estudiantes;
        evaluacionesActuales = evaluaciones;

        tituloCurso.textContent = "Calificaciones del curso";
        detalleCurso.textContent = `Curso seleccionado: ${cursoActual.nombre}`;

        selectorEstudiante.replaceChildren(
            crearOpcion("", "Selecciona un estudiante")
        );

        estudiantesActuales.forEach((estudiante, indice) => {
            const nombre = obtenerNombreEstudiante(estudiante);
            const codigo = estudiante.codigoEstudiante
                ? ` (${estudiante.codigoEstudiante})`
                : "";

            selectorEstudiante.appendChild(
                crearOpcion(indice, `${nombre}${codigo}`)
            );
        });

        seccionCalificaciones.hidden = false;

        if (estudiantesActuales.length === 0) {
            mostrarMensaje(
                mensajeCalificaciones,
                "No hay estudiantes matriculados en este curso."
            );
            selectorEstudiante.disabled = true;
            actualizarNavegacion();
            mostrarMensaje(mensaje, "Curso cargado correctamente.");
            return;
        }

        selectorEstudiante.disabled = false;

        if (evaluacionesActuales.length === 0) {
            mostrarMensaje(
                mensajeCalificaciones,
                "Este curso todavía no tiene evaluaciones registradas."
            );
        } else {
            mostrarMensaje(
                mensajeCalificaciones,
                "Selecciona un estudiante para consultar y registrar sus notas."
            );
        }

        mostrarMensaje(mensaje, "Curso cargado correctamente.");
        actualizarNavegacion();
    } catch (error) {
        mostrarMensaje(
            mensaje,
            `No se pudo cargar el curso: ${error.message}`,
            true
        );
    } finally {
        selectorCurso.disabled = false;
    }
}

async function seleccionarEstudiante() {
    if (selectorEstudiante.value === "") {
        solicitudEstudiante++;
        indiceEstudianteActual = -1;
        listaEvaluaciones.replaceChildren();
        datosEstudiante.hidden = true;
        progresoEstudiantes.textContent = "";
        actualizarNavegacion();
        return;
    }

    const indice = Number(selectorEstudiante.value);

    if (!Number.isInteger(indice) || !estudiantesActuales[indice]) {
        return;
    }

    indiceEstudianteActual = indice;
    await mostrarEstudianteActual();
}

async function mostrarEstudianteActual() {
    const numeroSolicitud = ++solicitudEstudiante;
    const estudiante = estudiantesActuales[indiceEstudianteActual];

    if (!estudiante) {
        return;
    }

    selectorEstudiante.value = String(indiceEstudianteActual);

    nombreEstudiante.textContent = obtenerNombreEstudiante(estudiante);
    codigoEstudiante.textContent =
        `Código: ${estudiante.codigoEstudiante ?? "No disponible"}`;

    datosEstudiante.hidden = false;

    progresoEstudiantes.textContent =
        `Estudiante ${indiceEstudianteActual + 1} de ${estudiantesActuales.length}`;

    actualizarNavegacion();

    listaEvaluaciones.replaceChildren();
    mostrarMensaje(
        mensajeCalificaciones,
        "Consultando las calificaciones del estudiante..."
    );

    if (evaluacionesActuales.length === 0) {
        mostrarMensaje(
            mensajeCalificaciones,
            "No hay evaluaciones registradas para este curso."
        );
        return;
    }

    try {
        const calificaciones = await consultarAPI(
            `/api/matriculas/${estudiante.matriculaId}/calificaciones`
        );

        if (numeroSolicitud !== solicitudEstudiante) {
            return;
        }

        dibujarEvaluaciones(estudiante, calificaciones);

        mostrarMensaje(
            mensajeCalificaciones,
            "Puedes registrar o actualizar las notas de este estudiante."
        );
    } catch (error) {
        if (numeroSolicitud !== solicitudEstudiante) {
            return;
        }

        mostrarMensaje(
            mensajeCalificaciones,
            `No se pudieron consultar las notas: ${error.message}`,
            true
        );
    }
}

function dibujarEvaluaciones(estudiante, calificaciones) {
    listaEvaluaciones.replaceChildren();

    evaluacionesActuales.forEach((evaluacion) => {
        const registro = calificaciones.find(
            (calificacion) =>
                Number(calificacion.actividadEvaluableId) ===
                Number(evaluacion.id)
        );

        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-evaluacion";

        const informacion = document.createElement("div");
        informacion.className = "informacion-evaluacion";

        const nombre = crearCeldaTexto("h4", evaluacion.nombre);
        nombre.className = "nombre-evaluacion";

        const porcentaje = crearCeldaTexto(
            "p",
            `Peso de la evaluación: ${evaluacion.porcentaje ?? "No indicado"}%`
        );
        porcentaje.className = "porcentaje-evaluacion";

        informacion.append(nombre, porcentaje);

        const formulario = document.createElement("form");
        formulario.className = "formulario-calificacion";

        const etiqueta = document.createElement("label");
        etiqueta.textContent = "Nota (0–20)";
        etiqueta.htmlFor = `nota-${estudiante.matriculaId}-${evaluacion.id}`;

        const campoNota = document.createElement("input");
        campoNota.id = etiqueta.htmlFor;
        campoNota.type = "number";
        campoNota.min = "0";
        campoNota.max = "20";
        campoNota.step = "0.01";
        campoNota.required = true;
        campoNota.inputMode = "decimal";
        campoNota.placeholder = "Ej. 16.50";
        campoNota.value =
            registro && registro.nota !== null && registro.nota !== undefined
                ? registro.nota
                : "";

        const botonGuardar = document.createElement("button");
        botonGuardar.type = "submit";
        botonGuardar.textContent = registro ? "Actualizar nota" : "Guardar nota";

        formulario.append(etiqueta, campoNota, botonGuardar);
        tarjeta.append(informacion, formulario);

        formulario.addEventListener("submit", async (evento) => {
            evento.preventDefault();

            const valor = campoNota.value.trim();
            const nota = Number(valor);

            if (
                valor === "" ||
                !Number.isFinite(nota) ||
                nota < 0 ||
                nota > 20
            ) {
                window.alert("Ingresa una nota válida entre 0 y 20.");
                campoNota.focus();
                return;
            }

            botonGuardar.disabled = true;
            mostrarMensaje(
                mensajeCalificaciones,
                `Guardando la nota de ${evaluacion.nombre}...`
            );

            try {
                await consultarAPI(
                    `/api/matriculas/${estudiante.matriculaId}/calificaciones/${evaluacion.id}`,
                    {
                        method: "POST",
                        body: JSON.stringify({ nota })
                    }
                );

                botonGuardar.textContent = "Actualizar nota";

                mostrarMensaje(
                    mensajeCalificaciones,
                    `Nota guardada correctamente: ${nota.toFixed(2)} en ${evaluacion.nombre}.`
                );
            } catch (error) {
                mostrarMensaje(
                    mensajeCalificaciones,
                    `No se pudo guardar la nota: ${error.message}`,
                    true
                );
            } finally {
                botonGuardar.disabled = false;
            }
        });

        listaEvaluaciones.appendChild(tarjeta);
    });
}

function cambiarEstudiante(direccion) {
    if (estudiantesActuales.length === 0) {
        return;
    }

    const nuevoIndice = indiceEstudianteActual + direccion;

    if (nuevoIndice < 0 || nuevoIndice >= estudiantesActuales.length) {
        return;
    }

    indiceEstudianteActual = nuevoIndice;
    mostrarEstudianteActual();
}

function actualizarNavegacion() {
    const hayEstudiante = indiceEstudianteActual >= 0;
    const esPrimero = indiceEstudianteActual <= 0;
    const esUltimo =
        indiceEstudianteActual >= estudiantesActuales.length - 1;

    botonAnterior.disabled = !hayEstudiante || esPrimero;
    botonAnteriorInferior.disabled = !hayEstudiante || esPrimero;

    botonSiguiente.disabled = !hayEstudiante || esUltimo;
    botonSiguienteInferior.disabled = !hayEstudiante || esUltimo;

    const mostrarBotones = estudiantesActuales.length > 1;

    botonAnterior.hidden = !mostrarBotones;
    botonSiguiente.hidden = !mostrarBotones;
    botonAnteriorInferior.hidden = !mostrarBotones;
    botonSiguienteInferior.hidden = !mostrarBotones;
}

selectorCurso.addEventListener("change", seleccionarCurso);
selectorEstudiante.addEventListener("change", seleccionarEstudiante);

botonAnterior.addEventListener("click", () => cambiarEstudiante(-1));
botonSiguiente.addEventListener("click", () => cambiarEstudiante(1));
botonAnteriorInferior.addEventListener("click", () => cambiarEstudiante(-1));
botonSiguienteInferior.addEventListener("click", () => cambiarEstudiante(1));

cargarCursos();
