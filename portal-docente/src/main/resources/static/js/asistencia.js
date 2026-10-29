"use strict";

const DOCENTE_ID_DEMO = 1;

const selectorCurso = document.getElementById("selectorCurso");
const mensaje = document.getElementById("mensaje");
const seccionAsistencia = document.getElementById("seccionAsistencia");
const tituloCurso = document.getElementById("tituloCurso");
const detalleCurso = document.getElementById("detalleCurso");
const listaEstudiantes = document.getElementById("listaEstudiantes");
const historialAsistencia = document.getElementById("historialAsistencia");
const mensajeAsistencia = document.getElementById("mensajeAsistencia");

let cursoActual = null;
let estudiantesActuales = [];
let sesionesActuales = [];

function mostrarMensajeAsistencia(elemento, texto, esError = false) {
    elemento.textContent = texto;
    elemento.classList.toggle("error", esError);
}

async function cargarCursos() {
    selectorCurso.disabled = true;
    selectorCurso.replaceChildren(crearOpcion("", "Cargando cursos..."));

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

        mostrarMensajeAsistencia(
            mensaje,
            cursos.length
                ? "Selecciona un curso para consultar la asistencia."
                : "No tienes cursos asignados."
        );
    } catch (error) {
        selectorCurso.replaceChildren(
            crearOpcion("", "No se pudieron cargar los cursos")
        );

        mostrarMensajeAsistencia(
            mensaje,
            `Error al consultar los cursos: ${error.message}`,
            true
        );
    }
}

async function seleccionarCurso() {
    const cursoId = selectorCurso.value;

    cursoActual = null;
    estudiantesActuales = [];
    sesionesActuales = [];
    seccionAsistencia.hidden = true;
    listaEstudiantes.replaceChildren();
    historialAsistencia.replaceChildren();

    if (!cursoId) {
        mostrarMensajeAsistencia(
            mensaje,
            "Selecciona un curso para consultar la asistencia."
        );
        return;
    }

    const opcion = selectorCurso.options[selectorCurso.selectedIndex];

    cursoActual = {
        id: Number(cursoId),
        nombre: opcion.textContent
    };

    selectorCurso.disabled = true;
    mostrarMensajeAsistencia(mensaje, "Cargando estudiantes y sesiones...");

    try {
        const [estudiantes, sesiones] = await Promise.all([
            consultarAPI(
                `/api/asignaciones/${cursoActual.id}/estudiantes`
            ),
            consultarAPI(
                `/api/asignaciones/${cursoActual.id}/sesiones`
            )
        ]);

        estudiantesActuales = estudiantes;
        sesionesActuales = sesiones;

        tituloCurso.textContent = "Asistencia del curso";
        detalleCurso.textContent = `Curso seleccionado: ${cursoActual.nombre}`;

        seccionAsistencia.hidden = false;

        await dibujarRegistroAsistencia();
        await dibujarHistorialAsistencia();

        mostrarMensajeAsistencia(
            mensaje,
            "La información de asistencia se cargó correctamente."
        );
    } catch (error) {
        mostrarMensajeAsistencia(
            mensaje,
            `No se pudo cargar la información: ${error.message}`,
            true
        );
    } finally {
        selectorCurso.disabled = false;
    }
}

async function dibujarRegistroAsistencia() {
    listaEstudiantes.replaceChildren();

    if (estudiantesActuales.length === 0) {
        listaEstudiantes.appendChild(
            crearElemento("p", "No hay estudiantes matriculados en este curso.")
        );
        return;
    }

    if (sesionesActuales.length === 0) {
        listaEstudiantes.appendChild(
            crearElemento(
                "p",
                "Primero debes registrar una sesión de clase para tomar asistencia."
            )
        );
        return;
    }

    for (const estudiante of estudiantesActuales) {
        const formulario = document.createElement("form");
        formulario.className = "registro-fila";

        formulario.appendChild(
            crearElemento(
                "strong",
                `${estudiante.apellidos}, ${estudiante.nombres}`
            )
        );

        formulario.appendChild(
            crearElemento("p", `Código: ${estudiante.codigoEstudiante ?? "—"}`)
        );

        const sesion = crearSelector(
            "Sesión de clase",
            sesionesActuales.map((item) => ({
                valor: item.id,
                texto: `${item.fecha} — ${item.descripcion || "Clase"}`
            }))
        );

        const estado = crearSelector("Estado de asistencia", [
            { valor: "PRESENTE", texto: "Presente" },
            { valor: "FALTA", texto: "Falta" },
            { valor: "FALTA_JUSTIFICADA", texto: "Falta justificada" }
        ]);

        formulario.append(sesion.contenedor, estado.contenedor);

        const boton = document.createElement("button");
        boton.type = "submit";
        boton.textContent = "Guardar asistencia";
        formulario.appendChild(boton);

        formulario.addEventListener("submit", async (evento) => {
            evento.preventDefault();

            if (!sesion.selector.value || !estado.selector.value) {
                window.alert("Selecciona una sesión y un estado.");
                return;
            }

            boton.disabled = true;

            try {
                await consultarAPI(
                    `/api/matriculas/${estudiante.matriculaId}/asistencias/${sesion.selector.value}`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            estado: estado.selector.value
                        })
                    }
                );

                mostrarMensajeAsistencia(
                    mensajeAsistencia,
                    `Asistencia guardada para ${estudiante.nombres} ${estudiante.apellidos}.`
                );

                await dibujarHistorialAsistencia();
            } catch (error) {
                window.alert(
                    `No se pudo guardar la asistencia: ${error.message}`
                );
            } finally {
                boton.disabled = false;
            }
        });

        listaEstudiantes.appendChild(formulario);
    }
}

async function dibujarHistorialAsistencia() {
    historialAsistencia.replaceChildren();

    if (estudiantesActuales.length === 0) {
        historialAsistencia.appendChild(
            crearElemento("p", "No hay estudiantes para mostrar.")
        );
        return;
    }

    const contenedor = document.createElement("div");
    contenedor.className = "tabla-contenedor";

    const tabla = document.createElement("table");
    const encabezado = document.createElement("thead");
    const filaEncabezado = document.createElement("tr");

    [
        "Estudiante",
        "Fecha",
        "Sesión",
        "Estado",
        "Asistencia (%)"
    ].forEach((texto) => {
        filaEncabezado.appendChild(crearElemento("th", texto));
    });

    encabezado.appendChild(filaEncabezado);
    tabla.appendChild(encabezado);

    const cuerpo = document.createElement("tbody");
    let totalRegistros = 0;

    for (const estudiante of estudiantesActuales) {
        try {
            const [asistencias, resumen] = await Promise.all([
                consultarAPI(
                    `/api/matriculas/${estudiante.matriculaId}/asistencias`
                ),
                consultarAPI(
                    `/api/matriculas/${estudiante.matriculaId}/resumen-asistencia`
                )
            ]);

            if (asistencias.length === 0) {
                const fila = document.createElement("tr");

                [
                    `${estudiante.apellidos}, ${estudiante.nombres}`,
                    "—",
                    "Sin registros",
                    "—",
                    `${resumen.porcentajeAsistencia ?? 0}%`
                ].forEach((texto) => {
                    fila.appendChild(crearElemento("td", texto));
                });

                cuerpo.appendChild(fila);
                continue;
            }

            asistencias.forEach((asistencia) => {
                const fila = document.createElement("tr");

                [
                    `${estudiante.apellidos}, ${estudiante.nombres}`,
                    asistencia.fecha ?? "—",
                    asistencia.descripcionSesion ?? "Sesión de clase",
                    asistencia.estado ?? "—",
                    `${resumen.porcentajeAsistencia ?? 0}%`
                ].forEach((texto) => {
                    fila.appendChild(crearElemento("td", texto));
                });

                cuerpo.appendChild(fila);
                totalRegistros++;
            });
        } catch (error) {
            const fila = document.createElement("tr");
            const celda = crearElemento(
                "td",
                `No se pudo consultar la asistencia de ${estudiante.nombres} ${estudiante.apellidos}: ${error.message}`
            );
            celda.colSpan = 5;
            fila.appendChild(celda);
            cuerpo.appendChild(fila);
        }
    }

    tabla.appendChild(cuerpo);
    contenedor.appendChild(tabla);
    historialAsistencia.appendChild(contenedor);

    if (totalRegistros === 0) {
        historialAsistencia.appendChild(
            crearElemento(
                "p",
                "Todavía no hay registros de asistencia guardados."
            )
        );
    }
}

selectorCurso.addEventListener("change", seleccionarCurso);

cargarCursos();
