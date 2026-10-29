"use strict";

const DOCENTE_ID_DEMO = 1;

const selectorCurso = document.getElementById("selectorCurso");
const mensaje = document.getElementById("mensaje");
const seccionEvaluaciones = document.getElementById("seccionEvaluaciones");
const tituloCurso = document.getElementById("tituloCurso");
const detalleCurso = document.getElementById("detalleCurso");

const formularioEvaluacion = document.getElementById("formularioEvaluacion");
const nombreEvaluacion = document.getElementById("nombreEvaluacion");
const tipoEvaluacion = document.getElementById("tipoEvaluacion");
const porcentajeEvaluacion = document.getElementById("porcentajeEvaluacion");
const ordenEvaluacion = document.getElementById("ordenEvaluacion");
const botonGuardar = document.getElementById("botonGuardar");

const totalPonderacion = document.getElementById("totalPonderacion");
const porcentajeRestante = document.getElementById("porcentajeRestante");
const listaEvaluaciones = document.getElementById("listaEvaluaciones");
const mensajeEvaluacion = document.getElementById("mensajeEvaluacion");

let cursoActual = null;
let evaluacionesActuales = [];

function mostrarMensaje(elemento, texto, esError = false) {
    elemento.textContent = texto;
    elemento.classList.toggle("error", esError);
}

function calcularTotalPonderacion() {
    return evaluacionesActuales.reduce(
        (total, evaluacion) => total + Number(evaluacion.porcentaje),
        0
    );
}

function actualizarResumen() {
    const total = calcularTotalPonderacion();
    const restante = Math.max(0, 100 - total);

    totalPonderacion.textContent = `${total.toFixed(2)} %`;
    porcentajeRestante.textContent = `${restante.toFixed(2)} %`;

    porcentajeEvaluacion.max = Math.min(100, restante).toFixed(2);
}

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
            const nombre = curso.nombreCurso ?? curso.nombre ?? curso.curso;
            const codigo = curso.codigoCurso ?? curso.codigo;

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
                ? "Selecciona un curso para administrar sus evaluaciones."
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

    cursoActual = null;
    evaluacionesActuales = [];
    seccionEvaluaciones.hidden = true;
    listaEvaluaciones.replaceChildren();
    formularioEvaluacion.reset();
    actualizarResumen();

    if (!cursoId) {
        mostrarMensaje(mensaje, "Selecciona un curso para continuar.");
        return;
    }

    const opcion = selectorCurso.options[selectorCurso.selectedIndex];

    cursoActual = {
        id: Number(cursoId),
        nombre: opcion.textContent
    };

    selectorCurso.disabled = true;

    mostrarMensaje(mensaje, "Cargando evaluaciones...");

    try {
        await cargarEvaluaciones();

        tituloCurso.textContent = "Evaluaciones del curso";
        detalleCurso.textContent = `Curso seleccionado: ${cursoActual.nombre}`;

        seccionEvaluaciones.hidden = false;

        mostrarMensaje(
            mensaje,
            "Las evaluaciones se cargaron correctamente."
        );
    } catch (error) {
        cursoActual = null;

        mostrarMensaje(
            mensaje,
            `No se pudieron cargar las evaluaciones: ${error.message}`,
            true
        );
    } finally {
        selectorCurso.disabled = false;
    }
}

async function cargarEvaluaciones() {
    const evaluaciones = await consultarAPI(
        `/api/asignaciones/${cursoActual.id}/evaluaciones`
    );

    evaluacionesActuales = evaluaciones.sort(
        (a, b) => Number(a.orden) - Number(b.orden)
    );

    actualizarResumen();
    dibujarEvaluaciones();
}

function dibujarEvaluaciones() {
    listaEvaluaciones.replaceChildren();

    if (evaluacionesActuales.length === 0) {
        listaEvaluaciones.appendChild(
            crearElemento(
                "p",
                "Todavía no hay evaluaciones registradas para este curso."
            )
        );
        return;
    }

    const contenedor = document.createElement("div");
    contenedor.className = "tabla-contenedor";

    const tabla = document.createElement("table");
    const encabezado = document.createElement("thead");
    const filaEncabezado = document.createElement("tr");

    ["Orden", "Nombre", "Tipo", "Ponderación"].forEach((texto) => {
        filaEncabezado.appendChild(crearElemento("th", texto));
    });

    encabezado.appendChild(filaEncabezado);
    tabla.appendChild(encabezado);

    const cuerpo = document.createElement("tbody");

    evaluacionesActuales.forEach((evaluacion) => {
        const fila = document.createElement("tr");

        [
            evaluacion.orden,
            evaluacion.nombre,
            evaluacion.tipo || "No especificado",
            `${Number(evaluacion.porcentaje).toFixed(2)} %`
        ].forEach((texto) => {
            fila.appendChild(crearElemento("td", texto));
        });

        cuerpo.appendChild(fila);
    });

    tabla.appendChild(cuerpo);
    contenedor.appendChild(tabla);
    listaEvaluaciones.appendChild(contenedor);
}

formularioEvaluacion.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (!cursoActual) {
        mostrarMensaje(
            mensajeEvaluacion,
            "Primero debes seleccionar un curso.",
            true
        );
        return;
    }

    const nombre = nombreEvaluacion.value.trim();
    const tipo = tipoEvaluacion.value.trim();
    const porcentajeTexto = porcentajeEvaluacion.value.trim();
    const ordenTexto = ordenEvaluacion.value.trim();

    const porcentaje = Number(porcentajeTexto);
    const orden = Number(ordenTexto);

    if (!nombre || nombre.length > 120) {
        mostrarMensaje(
            mensajeEvaluacion,
            "El nombre es obligatorio y no puede superar los 120 caracteres.",
            true
        );
        return;
    }

    if (tipo.length > 60) {
        mostrarMensaje(
            mensajeEvaluacion,
            "El tipo no puede superar los 60 caracteres.",
            true
        );
        return;
    }

    if (
        porcentajeTexto === "" ||
        !Number.isFinite(porcentaje) ||
        porcentaje < 0.01 ||
        porcentaje > 100
    ) {
        mostrarMensaje(
            mensajeEvaluacion,
            "La ponderación debe estar entre 0.01 % y 100 %.",
            true
        );
        return;
    }

    if (!Number.isInteger(orden) || orden < 1 || ordenTexto === "") {
        mostrarMensaje(
            mensajeEvaluacion,
            "El orden debe ser un número entero mayor que cero.",
            true
        );
        return;
    }

    const sumaResultante =
        Math.round((calcularTotalPonderacion() + porcentaje) * 100) / 100;

    if (sumaResultante > 100) {
        mostrarMensaje(
            mensajeEvaluacion,
            `No puedes superar el 100 %. La suma resultante sería ${sumaResultante.toFixed(2)} %.`,
            true
        );
        return;
    }

    const datos = {
        nombre,
        tipo: tipo || null,
        porcentaje,
        orden
    };

    botonGuardar.disabled = true;
    mostrarMensaje(mensajeEvaluacion, "Guardando evaluación...");

    try {
        await consultarAPI(
            `/api/asignaciones/${cursoActual.id}/evaluaciones`,
            {
                method: "POST",
                body: JSON.stringify(datos)
            }
        );

        formularioEvaluacion.reset();

        await cargarEvaluaciones();

        mostrarMensaje(
            mensajeEvaluacion,
            "Evaluación creada correctamente."
        );
    } catch (error) {
        mostrarMensaje(
            mensajeEvaluacion,
            `No se pudo crear la evaluación: ${error.message}`,
            true
        );
    } finally {
        botonGuardar.disabled = false;
    }
});

selectorCurso.addEventListener("change", seleccionarCurso);

porcentajeEvaluacion.addEventListener("input", () => {
    const porcentaje = Number(porcentajeEvaluacion.value);
    const total = calcularTotalPonderacion();

    if (
        porcentajeEvaluacion.value !== "" &&
        Number.isFinite(porcentaje) &&
        porcentaje > 0 &&
        total + porcentaje > 100
    ) {
        mostrarMensaje(
            mensajeEvaluacion,
            `La ponderación disponible es ${(100 - total).toFixed(2)} %.`,
            true
        );
    } else {
        mostrarMensaje(mensajeEvaluacion, "");
    }
});

cargarCursos();
