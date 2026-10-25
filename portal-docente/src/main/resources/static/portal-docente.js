
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

        dibujarEstudiantes();
        dibujarGestionCurso();

        mostrarMensajeOperacion(
            `Estudiantes: ${estudiantes.length} · Sesiones: ${sesiones.length} · Evaluaciones: ${evaluaciones.length}`
        );
    } catch (error) {
        mostrarMensajeOperacion(`Error al consultar el curso: ${error.message}`);
    }
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

        tablaEstudiantes.appendChild(fila);
    });

    if (estudiantesActuales.length === 0) {
        const fila = document.createElement("tr");
        const celda = crearElemento("td", "No hay estudiantes matriculados.");
        celda.colSpan = 3;
        fila.appendChild(celda);
        tablaEstudiantes.appendChild(fila);
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

    zona.appendChild(crearElemento("h2", "Sesiones de clase"));
    zona.appendChild(crearFormularioSesion());
    zona.appendChild(crearListaSesiones());

    zona.appendChild(crearElemento("h2", "Evaluaciones"));
    zona.appendChild(crearFormularioEvaluacion());
    zona.appendChild(crearListaEvaluaciones());

    zona.appendChild(crearElemento("h2", "Registro de asistencia"));
    zona.appendChild(crearTablaAsistencia());

    zona.appendChild(crearElemento("h2", "Registro de calificaciones"));
    zona.appendChild(crearTablaCalificaciones());
}

function crearFormularioSesion() {
    const fecha = crearCampo("Fecha de clase", "date", "fecha");
    const descripcion = crearCampo(
        "Descripción (opcional)", "text", "descripcion", false
    );
    descripcion.campo.maxLength = 250;

    return crearFormulario("Crear sesión", [fecha, descripcion], async () => {
        const datos = {
            fecha: fecha.campo.value,
            descripcion: descripcion.campo.value.trim() || null
        };

        await consultarAPI(
            `/api/asignaciones/${cursoActual.id}/sesiones`,
            {
                method: "POST",
                body: JSON.stringify(datos)
            }
        );

        await cargarCurso(cursoActual);
        mostrarMensajeOperacion("Sesión creada correctamente.");
    });
}

function crearListaSesiones() {
    const contenedor = document.createElement("div");
    contenedor.className = "lista-registros";

    if (sesionesActuales.length === 0) {
        contenedor.appendChild(crearElemento("p", "Todavía no hay sesiones."));
        return contenedor;
    }

    sesionesActuales.forEach((sesion) => {
        contenedor.appendChild(crearElemento(
            "p",
            `${sesion.fecha} — ${sesion.descripcion || "Clase"} (ID ${sesion.id})`
        ));
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
            "Crea una evaluación y verifica que haya estudiantes matriculados para registrar notas."
        ));
        return tabla;
    }

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

        formulario.append(evaluacion.contenedor, nota.contenedor);

        const boton = crearElemento("button", "Guardar nota");
        boton.type = "submit";
        formulario.appendChild(boton);

        formulario.addEventListener("submit", async (evento) => {
            evento.preventDefault();

            const valorNota = Number(nota.campo.value);

            if (!evaluacion.selector.value ||
                nota.campo.value === "" ||
                valorNota < 0 || valorNota > 20) {
                window.alert("Selecciona una evaluación e ingresa una nota entre 0 y 20.");
                return;
            }

            boton.disabled = true;

            try {
                await consultarAPI(
                    `/api/matriculas/${estudiante.matriculaId}/calificaciones/${evaluacion.selector.value}`,
                    {
                        method: "POST",
                        body: JSON.stringify({ nota: valorNota })
                    }
                );

                mostrarMensajeOperacion(
                    `Nota guardada para ${estudiante.nombres} ${estudiante.apellidos}.`
                );
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
