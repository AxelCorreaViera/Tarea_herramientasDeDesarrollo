"use strict";

const DOCENTE_ID_DEMO = 1;

const listaCursos = document.getElementById("listaCursos");
const mensaje = document.getElementById("mensaje");
const seccionEstudiantes = document.getElementById("seccionEstudiantes");
const tituloCurso = document.getElementById("tituloCurso");
const detalleCurso = document.getElementById("detalleCurso");
const tablaEstudiantes = document.getElementById("tablaEstudiantes");
const mensajeEstudiantes = document.getElementById("mensajeEstudiantes");

let cursoActual = null;
let estudiantesActuales = [];
let sesionesActuales = [];
let evaluacionesActuales = [];
let asistenciasActuales = [];
let calificacionesActuales = [];

async function consultarAPI(url, opciones = {}) {
    const respuesta = await fetch(url, {
        ...opciones,
        headers: {
            "Content-Type": "application/json",
            ...opciones.headers
        }
    });

    if (!respuesta.ok) {
        let detalle = `Error HTTP ${respuesta.status}`;

        try {
            const error = await respuesta.json();
            detalle = error.mensaje || error.message || detalle;
        } catch {
            // La respuesta de error puede no ser JSON.
        }

        throw new Error(detalle);
    }

    if (respuesta.status === 204) return null;
    return respuesta.json();
}

function crearElemento(etiqueta, texto = "") {
    const elemento = document.createElement(etiqueta);
    elemento.textContent = texto ?? "";
    return elemento;
}

function crearOpcion(valor, texto) {
    const opcion = crearElemento("option", texto);
    opcion.value = valor;
    return opcion;
}

function crearBoton(texto, accion) {
    const boton = crearElemento("button", texto);
    boton.type = "button";
    boton.addEventListener("click", accion);
    return boton;
}

function crearCampo(etiquetaTexto, tipo, nombre, requerido = true) {
    const contenedor = document.createElement("label");
    contenedor.className = "campo-portal";

    contenedor.appendChild(crearElemento("span", etiquetaTexto));

    const campo = document.createElement("input");
    campo.type = tipo;
    campo.name = nombre;
    campo.required = requerido;

    if (tipo === "number") {
        campo.min = "0";
        campo.step = "any";
    }

    contenedor.appendChild(campo);
    return { contenedor, campo };
}

function crearSelector(etiquetaTexto, opciones) {
    const contenedor = document.createElement("label");
    contenedor.className = "campo-portal";
    contenedor.appendChild(crearElemento("span", etiquetaTexto));

    const selector = document.createElement("select");
    selector.required = true;

    selector.appendChild(crearOpcion("", "Selecciona una opción"));

    opciones.forEach(({ valor, texto }) => {
        selector.appendChild(crearOpcion(valor, texto));
    });

    contenedor.appendChild(selector);
    return { contenedor, selector };
}

function crearFormulario(titulo, campos, alEnviar) {
    const formulario = document.createElement("form");
    formulario.className = "formulario-portal";

    formulario.appendChild(crearElemento("h3", titulo));

    campos.forEach((campo) => formulario.appendChild(campo.contenedor));

    const boton = document.createElement("button");
    boton.type = "submit";
    boton.textContent = "Guardar";
    formulario.appendChild(boton);

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        boton.disabled = true;

        try {
            await alEnviar();
        } catch (error) {
            window.alert(`No se pudo completar la operación: ${error.message}`);
        } finally {
            boton.disabled = false;
        }
    });

    return formulario;
}

function mostrarMensajeOperacion(texto) {
    mensajeEstudiantes.textContent = texto;
}

async function cargarCursos() {
    try {
        mensaje.textContent = "Consultando cursos asignados...";

        const cursos = await consultarAPI(
            `/api/docentes/${DOCENTE_ID_DEMO}/asignaciones`
        );

        listaCursos.replaceChildren();

        if (cursos.length === 0) {
            mensaje.textContent = "No hay cursos asignados a este docente.";
            return;
        }

        mensaje.textContent = `Cursos asignados: ${cursos.length}.`;

        cursos.forEach((curso) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta-curso";

            tarjeta.append(
                crearElemento("h3", curso.nombreCurso),
                crearElemento("p", `Código: ${curso.codigoCurso}`),
                crearElemento("p", `Sección: ${curso.seccion}`),
                crearElemento("p", `Periodo: ${curso.periodoAcademico}`),
                crearBoton("Abrir curso", () => cargarCurso(curso))
            );

            listaCursos.appendChild(tarjeta);
        });
    } catch (error) {
        mensaje.textContent = `No se pudieron cargar los cursos: ${error.message}`;
    }
}

async function cargarCurso(curso) {
    cursoActual = curso;
    seccionEstudiantes.hidden = false;

    tituloCurso.textContent = curso.nombreCurso;
    detalleCurso.textContent =
        `Código: ${curso.codigoCurso} · Sección: ${curso.seccion} · Periodo: ${curso.periodoAcademico}`;

    mostrarMensajeOperacion("Cargando información del curso...");

    try {
        const [estudiantes, sesiones, evaluaciones] = await Promise.all([
            consultarAPI(`/api/asignaciones/${curso.id}/estudiantes`),
            consultarAPI(`/api/asignaciones/${curso.id}/sesiones`),
            consultarAPI(`/api/asignaciones/${curso.id}/evaluaciones`)
        ]);

        estudiantesActuales = estudiantes;
        sesionesActuales = sesiones;
        evaluacionesActuales = evaluaciones;

        // Consultar las asistencias y calificaciones guardadas de cada estudiante.
        const registrosPorEstudiante = await Promise.all(
            estudiantesActuales.map(async (estudiante) => {
                const [asistencias, calificaciones] = await Promise.all([
                    consultarAPI(
                        `/api/matriculas/${estudiante.matriculaId}/asistencias`
                    ),
                    consultarAPI(
                        `/api/matriculas/${estudiante.matriculaId}/calificaciones`
                    )
                ]);

                return {
                    asistencias,
                    calificaciones
                };
            })
        );

        // Consolidar los registros de todos los estudiantes del curso.
        asistenciasActuales = registrosPorEstudiante.flatMap(
            (registro) => registro.asistencias
        );

        calificacionesActuales = registrosPorEstudiante.flatMap(
            (registro) => registro.calificaciones
        );

        // Actualizar las vistas del curso con la información recuperada.
        dibujarEstudiantes();
        dibujarGestionCurso();

        mostrarMensajeOperacion(
            `Estudiantes: ${estudiantes.length} · Sesiones: ${sesiones.length} · Evaluaciones: ${evaluaciones.length}`
        );
    } catch (error) {
        mostrarMensajeOperacion(
            `Error al consultar el curso: ${error.message}`
        );
        return false;
    }

    return true;
}


function dibujarEstudiantes() {
    tablaEstudiantes.replaceChildren();

    estudiantesActuales.forEach((estudiante) => {
        const fila = document.createElement("tr");

        fila.append(
            crearElemento("td", estudiante.codigoEstudiante),
            crearElemento("td", `${estudiante.apellidos}, ${estudiante.nombres}`),
            crearElemento("td", estudiante.correo)
        );

        const celdaAcciones = document.createElement("td");
        const botonFicha = crearElemento("button", "Ver ficha");
        botonFicha.type = "button";

        botonFicha.addEventListener("click", () => {
            mostrarFichaEstudiante(estudiante);
        });

        celdaAcciones.appendChild(botonFicha);
        fila.appendChild(celdaAcciones);

        tablaEstudiantes.appendChild(fila);
    });

    if (estudiantesActuales.length === 0) {
        const fila = document.createElement("tr");
        const celda = crearElemento("td", "No hay estudiantes matriculados.");
        celda.colSpan = 4;
        fila.appendChild(celda);
        tablaEstudiantes.appendChild(fila);
    }
}


async function mostrarFichaEstudiante(estudiante) {
    let ficha = document.getElementById("fichaEstudiante");

    if (!ficha) {
        ficha = document.createElement("section");
        ficha.id = "fichaEstudiante";
        ficha.className = "panel";
        ficha.setAttribute("aria-live", "polite");
        seccionEstudiantes.appendChild(ficha);
    }

    ficha.hidden = false;
    ficha.replaceChildren();

    ficha.appendChild(crearElemento("h2", "Ficha académica"));

    const mensajeCarga = crearElemento(
        "p",
        "Cargando información académica..."
    );
    ficha.appendChild(mensajeCarga);

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

        // Encabezado con los datos del estudiante.
        const encabezado = document.createElement("div");
        encabezado.className = "ficha-encabezado";

        encabezado.appendChild(crearElemento("h2", "Ficha académica"));
        encabezado.appendChild(crearElemento(
            "p",
            `Estudiante: ${estudiante.apellidos}, ${estudiante.nombres}`
        ));
        encabezado.appendChild(crearElemento(
            "p",
            `Código: ${estudiante.codigoEstudiante}`
        ));
        encabezado.appendChild(crearElemento(
            "p",
            `Correo: ${estudiante.correo}`
        ));

        const botonCerrar = crearElemento("button", "Cerrar ficha");
        botonCerrar.type = "button";
        botonCerrar.addEventListener("click", () => {
            ficha.hidden = true;
        });

        encabezado.appendChild(botonCerrar);
        ficha.appendChild(encabezado);

        // Resumen del rendimiento académico.
        const resumen = document.createElement("div");
        resumen.className = "resumen-academico";

        resumen.appendChild(crearElemento(
            "h3",
            "Rendimiento académico"
        ));

        const valorPromedio = promedio.promedio == null
            ? "Pendiente"
            : Number(promedio.promedio).toFixed(2);

        resumen.appendChild(crearElemento(
            "p",
            `Promedio ponderado: ${valorPromedio}`
        ));
        resumen.appendChild(crearElemento(
            "p",
            `Evaluaciones calificadas: ${promedio.evaluacionesCalificadas} de ${promedio.evaluacionesTotales}`
        ));
        resumen.appendChild(crearElemento(
            "p",
            `Porcentaje evaluado: ${promedio.porcentajeEvaluado ?? 0}%`
        ));
        resumen.appendChild(crearElemento(
            "p",
            `Estado: ${promedio.definitivo
                ? "Promedio definitivo"
                : "Promedio parcial"}`
        ));

        ficha.appendChild(resumen);

        // Historial de calificaciones.
        ficha.appendChild(crearElemento("h3", "Notas del estudiante"));

        const tablaNotas = document.createElement("table");
        const encabezadoNotas = document.createElement("thead");
        const filaEncabezadoNotas = document.createElement("tr");

        ["Evaluación", "Porcentaje", "Nota"].forEach((texto) => {
            filaEncabezadoNotas.appendChild(crearElemento("th", texto));
        });

        encabezadoNotas.appendChild(filaEncabezadoNotas);
        tablaNotas.appendChild(encabezadoNotas);

        const cuerpoNotas = document.createElement("tbody");

        const evaluaciones = Array.isArray(evaluacionesActuales)
            ? evaluacionesActuales
            : [];

        evaluaciones.forEach((evaluacion) => {
            const calificacion = calificaciones.find((item) =>
                Number(item.actividadEvaluableId) === Number(evaluacion.id)
            );

            const fila = document.createElement("tr");

            fila.appendChild(crearElemento("td", evaluacion.nombre));
            fila.appendChild(crearElemento(
                "td",
                `${evaluacion.porcentaje}%`
            ));
            fila.appendChild(crearElemento(
                "td",
                calificacion ? calificacion.nota : "Pendiente"
            ));

            cuerpoNotas.appendChild(fila);
        });

        if (evaluaciones.length === 0) {
            const fila = document.createElement("tr");
            const celda = crearElemento(
                "td",
                "No hay evaluaciones configuradas para este curso."
            );
            celda.colSpan = 3;
            fila.appendChild(celda);
            cuerpoNotas.appendChild(fila);
        }

        tablaNotas.appendChild(cuerpoNotas);

        const contenedorNotas = document.createElement("div");
        contenedorNotas.className = "tabla-contenedor";
        contenedorNotas.appendChild(tablaNotas);
        ficha.appendChild(contenedorNotas);

        // Registro y actualización de notas.
        const seccionRegistro = document.createElement("section");
        seccionRegistro.className = "seccion-registro-notas";
        seccionRegistro.hidden = false;
        seccionRegistro.style.display = "block";

        seccionRegistro.appendChild(crearElemento(
            "h3",
            "Registrar notas"
        ));

        seccionRegistro.appendChild(crearElemento(
            "p",
            "Ingresa una nota entre 0 y 20 para cada evaluación. Si ya existe una nota, puedes actualizarla."
        ));

        if (evaluaciones.length === 0) {
            seccionRegistro.appendChild(crearElemento(
                "p",
                "No hay evaluaciones configuradas. Configura primero una evaluación para poder registrar notas."
            ));
        } else {
            evaluaciones.forEach((evaluacion) => {
                const formulario = document.createElement("form");
                formulario.className = "registro-fila";

                formulario.appendChild(crearElemento(
                    "strong",
                    `${evaluacion.nombre} (${evaluacion.porcentaje}%)`
                ));

                const campoNota = crearCampo(
                    "Nota (0–20)",
                    "number",
                    "nota"
                );

                campoNota.campo.min = "0";
                campoNota.campo.max = "20";
                campoNota.campo.step = "0.01";
                campoNota.campo.required = true;

                const calificacionExistente = calificaciones.find((item) =>
                    Number(item.actividadEvaluableId) === Number(evaluacion.id)
                );

                campoNota.campo.value = calificacionExistente
                    ? calificacionExistente.nota
                    : "";

                formulario.appendChild(campoNota.contenedor);

                const botonGuardar = crearElemento("button", "Guardar nota");
                botonGuardar.type = "submit";
                formulario.appendChild(botonGuardar);

                formulario.addEventListener("submit", async (evento) => {
                    evento.preventDefault();

                    const valorTexto = campoNota.campo.value.trim();
                    const valorNota = Number(valorTexto);

                    if (
                        valorTexto === "" ||
                        !Number.isFinite(valorNota) ||
                        valorNota < 0 ||
                        valorNota > 20
                    ) {
                        window.alert(
                            "Ingresa una nota válida entre 0 y 20."
                        );
                        return;
                    }

                    botonGuardar.disabled = true;

                    try {
                        await consultarAPI(
                            `/api/matriculas/${estudiante.matriculaId}/calificaciones/${evaluacion.id}`,
                            {
                                method: "POST",
                                body: JSON.stringify({ nota: valorNota })
                            }
                        );

                        mostrarMensajeOperacion(
                            `Nota guardada para ${estudiante.nombres} ${estudiante.apellidos}.`
                        );

                        await mostrarFichaEstudiante(estudiante);
                    } catch (error) {
                        window.alert(
                            `Error al guardar la nota: ${error.message}`
                        );
                    } finally {
                        botonGuardar.disabled = false;
                    }
                });

                seccionRegistro.appendChild(formulario);
            });
        }

        // Se agrega directamente a la ficha, fuera de las secciones plegables.
        ficha.appendChild(seccionRegistro);

        // Historial de asistencia.
        ficha.appendChild(crearElemento("h3", "Historial de asistencia"));

        const tablaAsistencia = document.createElement("table");
        const encabezadoAsistencia = document.createElement("thead");
        const filaEncabezadoAsistencia = document.createElement("tr");

        ["Fecha", "Sesión", "Estado"].forEach((texto) => {
            filaEncabezadoAsistencia.appendChild(
                crearElemento("th", texto)
            );
        });

        encabezadoAsistencia.appendChild(filaEncabezadoAsistencia);
        tablaAsistencia.appendChild(encabezadoAsistencia);

        const cuerpoAsistencia = document.createElement("tbody");

        asistencias.forEach((asistencia) => {
            const fila = document.createElement("tr");

            fila.appendChild(crearElemento(
                "td",
                asistencia.fecha ?? "—"
            ));
            fila.appendChild(crearElemento(
                "td",
                asistencia.descripcionSesion ?? "Sesión de clase"
            ));
            fila.appendChild(crearElemento(
                "td",
                asistencia.estado ?? "—"
            ));

            cuerpoAsistencia.appendChild(fila);
        });

        if (asistencias.length === 0) {
            const fila = document.createElement("tr");
            const celda = crearElemento(
                "td",
                "No hay registros de asistencia."
            );
            celda.colSpan = 3;
            fila.appendChild(celda);
            cuerpoAsistencia.appendChild(fila);
        }

        tablaAsistencia.appendChild(cuerpoAsistencia);

        const contenedorAsistencia = document.createElement("div");
        contenedorAsistencia.className = "tabla-contenedor";
        contenedorAsistencia.appendChild(tablaAsistencia);
        ficha.appendChild(contenedorAsistencia);

    } catch (error) {
        ficha.replaceChildren();

        ficha.appendChild(crearElemento("h2", "Ficha académica"));
        ficha.appendChild(crearElemento(
            "p",
            `No se pudo cargar la información: ${error.message}`
        ));

        const botonReintentar = crearElemento(
            "button",
            "Volver a intentar"
        );
        botonReintentar.type = "button";

        botonReintentar.addEventListener("click", () => {
            mostrarFichaEstudiante(estudiante);
        });

        ficha.appendChild(botonReintentar);
    }
}


function dibujarGestionCurso() {
    let zona = document.getElementById("gestionCurso");

    if (!zona) {
        zona = document.createElement("div");
        zona.id = "gestionCurso";
        seccionEstudiantes.appendChild(zona);
    }

    zona.replaceChildren();

    function crearSeccionPlegable(titulo, contenido) {
        const detalle = document.createElement("details");
        detalle.className = "seccion-plegable";

        const resumen = document.createElement("summary");
        resumen.textContent = titulo;

        detalle.appendChild(resumen);
        detalle.appendChild(contenido);

        return detalle;
    }

    const contenidoSesiones = document.createElement("div");
    contenidoSesiones.appendChild(crearFormularioSesion());
    contenidoSesiones.appendChild(crearListaSesiones());

    zona.appendChild(crearSeccionPlegable(
        "Sesiones de clase",
        contenidoSesiones
    ));

    zona.appendChild(crearSeccionPlegable(
        "Evaluaciones configuradas",
        crearListaEvaluaciones()
    ));

    zona.appendChild(crearSeccionPlegable(
        "Registro de asistencia",
        crearTablaAsistencia()
    ));
}


function crearFormularioSesion() {
    const fecha = crearCampo("Fecha de clase", "date", "fecha");

    // Calcula la fecha de hoy en la zona horaria local.
    const hoy = new Date();
    hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
    fecha.campo.min = hoy.toISOString().slice(0, 10);

    const horaInicio = crearCampo(
        "Hora de inicio", "time", "horaInicio"
    );
    horaInicio.campo.min = "07:00";
    horaInicio.campo.max = "22:59";

    const horaFin = crearCampo(
        "Hora de fin", "time", "horaFin"
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

    // Ajusta la hora mínima de fin al cambiar la hora de inicio.
    horaInicio.campo.addEventListener("change", () => {
        if (horaInicio.campo.value) {
            horaFin.campo.min = horaInicio.campo.value;
        } else {
            horaFin.campo.min = "07:01";
        }

        if (
            horaFin.campo.value
            && horaFin.campo.value <= horaInicio.campo.value
        ) {
            horaFin.campo.value = "";
        }
    });

    return crearFormulario(
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

            if (fechaSeleccionada < fecha.campo.min) {
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

            const actualizado = await cargarCurso(cursoActual);

            mostrarMensajeOperacion(
                actualizado
                    ? "Sesión registrada correctamente."
                    : "La sesión se guardó, pero no se pudo actualizar la información del curso. Vuelve a cargar el curso."
            );
        }
    );
}



function crearListaSesiones() {
    const contenedor = document.createElement("div");
    contenedor.className = "lista-registros";

    if (sesionesActuales.length === 0) {
        contenedor.appendChild(
            crearElemento("p", "Todavía no hay sesiones registradas.")
        );
        return contenedor;
    }

    sesionesActuales.forEach((sesion) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "registro-sesion";

        const titulo = crearElemento(
            "h4",
            `${sesion.diaSemana} — ${new Intl.DateTimeFormat("es-PE", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }).format(new Date(`${sesion.fecha}T00:00:00`))}`
        );

        const inicio = (sesion.horaInicio || "").substring(0, 5);
        const fin = (sesion.horaFin || "").substring(0, 5);

        const duracionHoras = Math.floor(sesion.duracionMinutos / 60);
        const duracionMinutos = sesion.duracionMinutos % 60;

        const duracionTexto = duracionHoras > 0
            ? `${duracionHoras} h ${duracionMinutos} min`
            : `${duracionMinutos} min`;

        const horario = crearElemento(
            "p",
            `Horario: ${inicio}–${fin} | Duración: ${duracionTexto}`
        );

        const descripcion = crearElemento(
            "p",
            sesion.descripcion || "Clase"
        );

        tarjeta.append(titulo, horario, descripcion);
        contenedor.appendChild(tarjeta);
    });

    return contenedor;
}


function crearFormularioEvaluacion() {
    const nombre = crearCampo("Nombre", "text", "nombre");
    nombre.campo.maxLength = 120;

    const tipo = crearCampo("Tipo", "text", "tipo", false);
    tipo.campo.maxLength = 60;

    const porcentaje = crearCampo("Porcentaje", "number", "porcentaje");
    porcentaje.campo.min = "0.01";
    porcentaje.campo.max = "100";
    porcentaje.campo.step = "0.01";

    const orden = crearCampo("Orden", "number", "orden");
    orden.campo.min = "1";
    orden.campo.step = "1";

    return crearFormulario(
        "Crear evaluación",
        [nombre, tipo, porcentaje, orden],
        async () => {
            const datos = {
                nombre: nombre.campo.value.trim(),
                tipo: tipo.campo.value.trim() || null,
                porcentaje: Number(porcentaje.campo.value),
                orden: Number(orden.campo.value)
            };

            await consultarAPI(
                `/api/asignaciones/${cursoActual.id}/evaluaciones`,
                {
                    method: "POST",
                    body: JSON.stringify(datos)
                }
            );

            await cargarCurso(cursoActual);
            mostrarMensajeOperacion("Evaluación creada correctamente.");
        }
    );
}

function crearListaEvaluaciones() {
    const contenedor = document.createElement("div");
    contenedor.className = "lista-registros";

    if (evaluacionesActuales.length === 0) {
        contenedor.appendChild(crearElemento("p", "Todavía no hay evaluaciones."));
        return contenedor;
    }

    evaluacionesActuales.forEach((evaluacion) => {
        contenedor.appendChild(crearElemento(
            "p",
            `${evaluacion.orden}. ${evaluacion.nombre} — ${evaluacion.porcentaje}%`
        ));
    });

    return contenedor;
}

function crearTablaAsistencia() {
    const tabla = document.createElement("div");
    tabla.className = "tabla-contenedor";

    if (sesionesActuales.length === 0 || estudiantesActuales.length === 0) {
        tabla.appendChild(crearElemento(
            "p",
            "Crea una sesión y verifica que haya estudiantes matriculados para registrar asistencia."
        ));
        return tabla;
    }

    const encabezado = document.createElement("p");
    encabezado.textContent = "Selecciona una sesión y el estado para cada estudiante.";
    tabla.appendChild(encabezado);

    estudiantesActuales.forEach((estudiante) => {
        const formulario = document.createElement("form");
        formulario.className = "registro-fila";

        formulario.appendChild(crearElemento(
            "strong",
            `${estudiante.apellidos}, ${estudiante.nombres}`
        ));

        const sesion = crearSelector(
            "Sesión",
            sesionesActuales.map((item) => ({
                valor: item.id,
                texto: `${item.fecha} — ${item.descripcion || "Clase"}`
            }))
        );

        const estado = crearSelector("Estado", [
            { valor: "PRESENTE", texto: "Presente" },
            { valor: "FALTA", texto: "Falta" },
            { valor: "FALTA_JUSTIFICADA", texto: "Falta justificada" }
        ]);

        formulario.append(sesion.contenedor, estado.contenedor);

        const boton = crearElemento("button", "Guardar asistencia");
        boton.type = "submit";
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
                        body: JSON.stringify({ estado: estado.selector.value })
                    }
                );

                mostrarMensajeOperacion(
                    `Asistencia guardada para ${estudiante.nombres} ${estudiante.apellidos}.`
                );
            } catch (error) {
                window.alert(`Error al guardar asistencia: ${error.message}`);
            } finally {
                boton.disabled = false;
            }
        });

        tabla.appendChild(formulario);
    });

    return tabla;
}


function crearTablaCalificaciones() {
    const tabla = document.createElement("div");
    tabla.className = "tabla-contenedor";

    if (evaluacionesActuales.length === 0 || estudiantesActuales.length === 0) {
        tabla.appendChild(crearElemento(
            "p",
            "Las evaluaciones deben estar configuradas previamente. Si no aparecen, solicita su configuración al administrador y verifica que haya estudiantes matriculados."
        ));
        return tabla;
    }

    // Mostrar las calificaciones guardadas de cada estudiante.
    const tituloRegistros = crearElemento("h3", "Calificaciones registradas");
    tabla.appendChild(tituloRegistros);

    const tablaRegistros = document.createElement("table");
    tablaRegistros.className = "tabla-registros";

    const encabezado = document.createElement("thead");
    const filaEncabezado = document.createElement("tr");

    ["Estudiante", "Evaluación", "Nota"].forEach((texto) => {
        filaEncabezado.appendChild(crearElemento("th", texto));
    });

    encabezado.appendChild(filaEncabezado);
    tablaRegistros.appendChild(encabezado);

    const cuerpo = document.createElement("tbody");
    let cantidadCalificaciones = 0;

    estudiantesActuales.forEach((estudiante) => {
        evaluacionesActuales.forEach((evaluacion) => {
            const calificacion = calificacionesActuales.find((item) =>
                Number(item.matriculaId) === Number(estudiante.matriculaId) &&
                Number(item.actividadEvaluableId) === Number(evaluacion.id)
            );

            if (calificacion) {
                const fila = document.createElement("tr");

                fila.appendChild(crearElemento(
                    "td",
                    `${estudiante.apellidos}, ${estudiante.nombres}`
                ));

                fila.appendChild(crearElemento(
                    "td",
                    evaluacion.nombre
                ));

                fila.appendChild(crearElemento(
                    "td",
                    calificacion.nota
                ));

                cuerpo.appendChild(fila);
                cantidadCalificaciones++;
            }
        });
    });

    if (cantidadCalificaciones === 0) {
        const fila = document.createElement("tr");
        const celda = crearElemento(
            "td",
            "Todavía no hay calificaciones registradas."
        );
        celda.colSpan = 3;
        fila.appendChild(celda);
        cuerpo.appendChild(fila);
    }

    tablaRegistros.appendChild(cuerpo);
    tabla.appendChild(tablaRegistros);

    // Formulario para registrar o actualizar calificaciones.
    tabla.appendChild(crearElemento("h3", "Registrar o actualizar calificaciones"));

    estudiantesActuales.forEach((estudiante) => {
        const formulario = document.createElement("form");
        formulario.className = "registro-fila";

        formulario.appendChild(crearElemento(
            "strong",
            `${estudiante.apellidos}, ${estudiante.nombres}`
        ));

        const evaluacion = crearSelector(
            "Evaluación",
            evaluacionesActuales.map((item) => ({
                valor: item.id,
                texto: `${item.nombre} (${item.porcentaje}%)`
            }))
        );

        const nota = crearCampo("Nota (0–20)", "number", "nota");
        nota.campo.min = "0";
        nota.campo.max = "20";
        nota.campo.step = "0.01";

        // Recuperar la nota guardada al seleccionar una evaluación.
        function cargarNotaGuardada() {
            const calificacion = calificacionesActuales.find((item) =>
                Number(item.matriculaId) === Number(estudiante.matriculaId) &&
                Number(item.actividadEvaluableId) === Number(evaluacion.selector.value)
            );

            nota.campo.value = calificacion ? calificacion.nota : "";
        }

        evaluacion.selector.addEventListener("change", cargarNotaGuardada);

        formulario.append(evaluacion.contenedor, nota.contenedor);

        const boton = crearElemento("button", "Guardar nota");
        boton.type = "submit";
        formulario.appendChild(boton);

        formulario.addEventListener("submit", async (evento) => {
            evento.preventDefault();

            const valorNota = Number(nota.campo.value);

            if (
                !evaluacion.selector.value ||
                nota.campo.value === "" ||
                !Number.isFinite(valorNota) ||
                valorNota < 0 ||
                valorNota > 20
            ) {
                window.alert("Selecciona una evaluación e ingresa una nota entre 0 y 20.");
                return;
            }

            boton.disabled = true;

            try {
                const calificacionGuardada = await consultarAPI(
                    `/api/matriculas/${estudiante.matriculaId}/calificaciones/${evaluacion.selector.value}`,
                    {
                        method: "POST",
                        body: JSON.stringify({ nota: valorNota })
                    }
                );

                // Actualizar el registro local con la respuesta del servidor.
                const indice = calificacionesActuales.findIndex((item) =>
                    Number(item.matriculaId) === Number(estudiante.matriculaId) &&
                    Number(item.actividadEvaluableId) === Number(evaluacion.selector.value)
                );

                if (indice >= 0) {
                    calificacionesActuales[indice] = calificacionGuardada;
                } else {
                    calificacionesActuales.push(calificacionGuardada);
                }

                mostrarMensajeOperacion(
                    `Nota guardada para ${estudiante.nombres} ${estudiante.apellidos}.`
                );

                // Actualizar la tabla visible con la nota recién guardada.
                dibujarGestionCurso();
            } catch (error) {
                window.alert(`Error al guardar la nota: ${error.message}`);
            } finally {
                boton.disabled = false;
            }
        });

        tabla.appendChild(formulario);
    });

    return tabla;
}


cargarCursos();
