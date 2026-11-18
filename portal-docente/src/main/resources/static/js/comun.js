"use strict";
/**
 * Obtiene el token CSRF almacenado en la cookie XSRF-TOKEN.
 */
function obtenerTokenCSRF() {
    const cookie = document.cookie
        .split("; ")
        .find((elemento) => elemento.startsWith("XSRF-TOKEN="));

    return cookie
        ? decodeURIComponent(cookie.substring("XSRF-TOKEN=".length))
        : null;
}

/**
 * Realiza peticiones HTTP al backend del Portal Docente.
 * Gestiona CSRF, respuestas correctas, errores HTTP y respuestas sin contenido.
 */
async function consultarAPI(url, opciones = {}) {
    const metodo = (opciones.method || "GET").toUpperCase();

    const encabezados = {
        "Content-Type": "application/json",
        ...opciones.headers
    };

    const metodosProtegidos = ["POST", "PUT", "PATCH", "DELETE"];

    if (metodosProtegidos.includes(metodo)) {
        const tokenCSRF = obtenerTokenCSRF();

        if (tokenCSRF) {
            encabezados["X-XSRF-TOKEN"] = tokenCSRF;
        }
    }

    const respuesta = await fetch(url, {
        ...opciones,
        headers: encabezados
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

    if (respuesta.status === 204) {
        return null;
    }

    return respuesta.json();
}

/**
 * Crea un elemento HTML y asigna su contenido como texto.
 */
function crearElemento(etiqueta, texto = "") {
    const elemento = document.createElement(etiqueta);
    elemento.textContent = texto ?? "";
    return elemento;
}

/**
 * Crea una opción para un elemento select.
 */
function crearOpcion(valor, texto) {
    const opcion = crearElemento("option", texto);
    opcion.value = valor;
    return opcion;
}

/**
 * Crea un botón y conecta su acción.
 */
function crearBoton(texto, accion) {
    const boton = crearElemento("button", texto);
    boton.type = "button";
    boton.addEventListener("click", accion);
    return boton;
}

/**
 * Crea un campo de formulario con su etiqueta.
 */
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

/**
 * Crea un selector con las opciones proporcionadas.
 */
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

/**
 * Crea un formulario y delega su procesamiento a la función recibida.
 */
function crearFormulario(titulo, campos, alEnviar) {
    const formulario = document.createElement("form");
    formulario.className = "formulario-portal";

    formulario.appendChild(crearElemento("h3", titulo));

    campos.forEach((campo) => {
        formulario.appendChild(campo.contenedor);
    });

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
            window.alert(
                `No se pudo completar la operación: ${error.message}`
            );
        } finally {
            boton.disabled = false;
        }
    });

    return formulario;
}

