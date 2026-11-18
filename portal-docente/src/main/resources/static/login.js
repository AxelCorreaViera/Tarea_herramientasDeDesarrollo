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
 * Procesa el inicio de sesión mediante Spring Security.
 */
document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formularioLogin");
    const campoCorreo = document.getElementById("correo");
    const campoContrasena = document.getElementById("contrasena");
    const mensaje = document.getElementById("mensaje");
    const botonIngresar = document.getElementById("botonIngresar");

    const parametros = new URLSearchParams(window.location.search);

    if (parametros.has("error")) {
        mensaje.textContent = "Correo electrónico o contraseña incorrectos.";
    }

    if (parametros.has("logout")) {
        mensaje.style.color = "#16794b";
        mensaje.textContent = "La sesión se cerró correctamente.";
    }

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        mensaje.textContent = "";
        mensaje.style.color = "";

        const tokenCSRF = obtenerTokenCSRF();

        if (!tokenCSRF) {
            mensaje.textContent =
                "No se pudo obtener el token de seguridad. Recarga la página e inténtalo nuevamente.";
            return;
        }

        botonIngresar.disabled = true;
        botonIngresar.textContent = "Ingresando...";

        const datos = new URLSearchParams();

        datos.append("username", campoCorreo.value.trim());
        datos.append("password", campoContrasena.value);

        try {
            const respuesta = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-XSRF-TOKEN": tokenCSRF
                },
                body: datos.toString(),
                credentials: "same-origin",
                redirect: "follow"
            });

            if (respuesta.url.includes("/login.html?error")) {
                mensaje.textContent =
                    "Correo electrónico o contraseña incorrectos.";
                campoContrasena.value = "";
                campoContrasena.focus();
                return;
            }

            if (!respuesta.ok) {
                throw new Error(`Error HTTP ${respuesta.status}`);
            }

            window.location.assign("/portal-docente.html");

        } catch (error) {
            console.error("Error al iniciar sesión:", error);

            mensaje.textContent =
                "No fue posible iniciar sesión. Comprueba la conexión e inténtalo nuevamente.";

        } finally {
            botonIngresar.disabled = false;
            botonIngresar.textContent = "Ingresar";
        }
    });
});
