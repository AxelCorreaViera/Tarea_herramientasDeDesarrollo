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
 * Agrega el botón de cierre de sesión al encabezado del portal.
 */
function agregarBotonCerrarSesion() {
    const encabezado = document.querySelector(".encabezado");

    if (!encabezado) {
        return;
    }

    const botonExistente = document.getElementById("botonCerrarSesion");

    if (botonExistente) {
        return;
    }

    const boton = document.createElement("button");

    boton.id = "botonCerrarSesion";
    boton.type = "button";
    boton.className = "boton-cerrar-sesion";
    boton.textContent = "Cerrar sesión";

    boton.addEventListener("click", cerrarSesion);

    encabezado.appendChild(boton);
}

/**
 * Invalida la sesión autenticada mediante Spring Security.
 */
async function cerrarSesion() {
    const boton = document.getElementById("botonCerrarSesion");
    const tokenCSRF = obtenerTokenCSRF();

    if (!tokenCSRF) {
        alert("No se pudo obtener el token de seguridad. Recarga la página e inténtalo nuevamente.");
        return;
    }

    boton.disabled = true;
    boton.textContent = "Cerrando sesión...";

    try {
        const respuesta = await fetch("/logout", {
            method: "POST",
            headers: {
                "X-XSRF-TOKEN": tokenCSRF
            },
            credentials: "same-origin"
        });

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}`);
        }

        window.location.replace("/login.html?logout");

    } catch (error) {
        console.error("Error al cerrar sesión:", error);

        alert("No fue posible cerrar la sesión. Inténtalo nuevamente.");

        boton.disabled = false;
        boton.textContent = "Cerrar sesión";
    }
}

/**
 * Inicializa el control de sesión cuando se carga la página.
 */
document.addEventListener("DOMContentLoaded", () => {
    agregarBotonCerrarSesion();
});
