"use strict";

const DOCENTE_ID_DEMO = 1;

const selectorCurso = document.getElementById("selectorCurso");
const mensaje = document.getElementById("mensaje");
const seccionSesiones = document.getElementById("seccionSesiones");
const tituloCurso = document.getElementById("tituloCurso");
const detalleCurso = document.getElementById("detalleCurso");
const formularioSesion = document.getElementById("formularioSesion");
const listaSesiones = document.getElementById("listaSesiones");
const mensajeSesiones = document.getElementById("mensajeSesiones");

let cursoActual = null;
let sesionesActuales = [];

function mostrarMensaje(elemento, texto, esError = false) {
    elemento.textContent = texto;
    elemento.classList.toggle("error", esError);
}

function obtenerFechaLocal() {
    const hoy = new Date();
    hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
    return hoy.toISOString().slice(0, 10);
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
                ? "Selecciona un curso para administrar sus sesiones."
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
    sesionesActuales = [];
    seccionSesiones.hidden = true;
    formularioSesion.replaceChildren();
    listaSesiones.replaceChildren();

    if (!cursoId) {
        mostrarMensaje(
            mensaje,
            "Selecciona un curso para administrar sus sesiones."
        );
        return;
    }

    const opcion = selectorCurso.options[selectorCurso.selectedIndex];

    cursoActual = {
        id: Number(cursoId),
        nombre: opcion.textContent
    };

    selectorCurso.disabled = true;
    mostrarMensaje(mensaje, "Consultando sesiones...");

    try {
        await cargarSesiones();

        tituloCurso.textContent = "Sesiones del curso";
        detalleCurso.textContent = `Curso seleccionado: ${cursoActual.nombre}`;
        seccionSesiones.hidden = false;

        dibujarFormularioSesion();
        dibujarListaSesiones();

        mostrarMensaje(
            mensaje,
            "Las sesiones del curso se cargaron correctamente."
        );
    } catch (error) {
        mostrarMensaje(
            mensaje,
            `No se pudieron cargar las sesiones: ${error.message}`,
            true
        );
    } finally {
        selectorCurso.disabled = false;
    }
}

async function cargarSesiones() {
    sesionesActuales = await consultarAPI(
        `/api/asignaciones/${cursoActual.id}/sesiones`
    );
}

function dibujarFormularioSesion() {
    formularioSesion.replaceChildren();

    const fecha = crearCampo("Fecha de clase", "date", "fecha");
    fecha.campo.min = obtenerFechaLocal();

    const horaInicio = crearCampo(
        "Hora de inicio",
        "time",
        "horaInicio"
    );
    horaInicio.campo.min = "07:00";
    horaInicio.campo.max = "22:59";

    const horaFin = crearCampo(
        "Hora de fin",
        "time",
        "horaFin"
    );
    horaFin.campo.min = "07:01";
    horaFin.campo.max = "23:00";

    const descripcion = crearCampo(
        "Descripción (opcional)",
        "text",
        "descripcion",
        false
    );
    descripcion.campo.maxLength = 250;

    horaInicio.campo.addEventListener("change", () => {
        horaFin.campo.min = horaInicio.campo.value || "07:01";

        if (
            horaFin.campo.value &&
            horaFin.campo.value <= horaInicio.campo.value
        ) {
            horaFin.campo.value = "";
        }
    });

    const formulario = crearFormulario(
        "Registrar sesión de clase",
        [fecha, horaInicio, horaFin, descripcion],
        async () => {
            const fechaSeleccionada = fecha.campo.value;
            const inicio = horaInicio.campo.value;
            const fin = horaFin.campo.value;

            if (!fechaSeleccionada || !inicio || !fin) {
                throw new Error(
                    "Completa la fecha, la hora de inicio y la hora de fin."
                );
            }

            if (fechaSeleccionada < obtenerFechaLocal()) {
                throw new Error(
                    "No puedes registrar sesiones en días pasados."
                );
            }

            if (inicio < "07:00" || inicio > "22:59") {
                throw new Error(
                    "La hora de inicio debe estar entre las 07:00 y las 22:59."
                );
            }

            if (fin <= inicio) {
                throw new Error(
                    "La hora de fin debe ser posterior a la hora de inicio."
                );
            }

            if (fin > "23:00" || fin < "07:01") {
                throw new Error(
                    "La hora de fin debe estar entre las 07:01 y las 23:00."
                );
            }

            const datos = {
                fecha: fechaSeleccionada,
                horaInicio: inicio,
                horaFin: fin,
                descripcion: descripcion.campo.value.trim() || null
            };

            await consultarAPI(
                `/api/asignaciones/${cursoActual.id}/sesiones`,
                {
                    method: "POST",
                    body: JSON.stringify(datos)
                }
            );

            await cargarSesiones();
            dibujarListaSesiones();

            formulario.reset();

            // Mantiene las restricciones de horario después de guardar.
            fecha.campo.min = obtenerFechaLocal();
            horaInicio.campo.min = "07:00";
            horaInicio.campo.max = "22:59";
            horaFin.campo.min = "07:01";
            horaFin.campo.max = "23:00";

            mostrarMensaje(
                mensajeSesiones,
                "Sesión registrada correctamente."
            );
        }
    );

    formularioSesion.appendChild(formulario);
}

function dibujarListaSesiones() {
    listaSesiones.replaceChildren();

    if (sesionesActuales.length === 0) {
        listaSesiones.appendChild(
            crearElemento("p", "Todavía no hay sesiones registradas.")
        );
        return;
    }

    sesionesActuales.forEach((sesion) => {
        const tarjeta = crearElemento("article");
        tarjeta.className = "registro-sesion";

        const fechaTexto = sesion.fecha
            ? new Intl.DateTimeFormat("es-PE", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }).format(new Date(`${sesion.fecha}T00:00:00`))
            : "Fecha no disponible";

        tarjeta.appendChild(
            crearElemento(
                "h4",
                `${sesion.diaSemana ?? ""} — ${fechaTexto}`.trim()
            )
        );

        const inicio = (sesion.horaInicio ?? "").substring(0, 5);
        const fin = (sesion.horaFin ?? "").substring(0, 5);

        const duracionMinutos = Number(sesion.duracionMinutos ?? 0);
        const horas = Math.floor(duracionMinutos / 60);
        const minutos = duracionMinutos % 60;

        const duracionTexto = horas > 0
            ? `${horas} h ${minutos} min`
            : `${minutos} min`;

        tarjeta.appendChild(
            crearElemento(
                "p",
                `Horario: ${inicio}–${fin} | Duración: ${duracionTexto}`
            )
        );

        tarjeta.appendChild(
            crearElemento("p", sesion.descripcion || "Clase")
        );

        listaSesiones.appendChild(tarjeta);
    });
}

selectorCurso.addEventListener("change", seleccionarCurso);

cargarCursos();
