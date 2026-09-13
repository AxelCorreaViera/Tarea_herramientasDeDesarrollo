document.addEventListener("DOMContentLoaded", function () {

    /*
     * ==========================================================
     * MENSAJE DE REGISTRO DESDE LA PÁGINA PRINCIPAL
     * ==========================================================
     */

    const parametros = new URLSearchParams(window.location.search);
    const accion = parametros.get("accion");

    if (accion === "registrar") {

        const formularioLogin = document.getElementById("formularioLogin");

        if (formularioLogin) {

            const mensaje = document.createElement("div");

            mensaje.className = "mensaje-aviso";

            mensaje.textContent =
                "Primero debes iniciar sesión como docente para registrar estudiantes.";

            formularioLogin.parentNode.insertBefore(
                mensaje,
                formularioLogin
            );
        }
    }


    /*
     * ==========================================================
     * VALIDACIÓN DEL FORMULARIO DE ESTUDIANTES
     * ==========================================================
     */

    const formularioEstudiante =
        document.getElementById("formularioEstudiante");

    if (formularioEstudiante) {

        formularioEstudiante.addEventListener("submit", function (evento) {

            evento.preventDefault();

            const codigo =
                document.getElementById("codigo").value.trim();

            const dni =
                document.getElementById("dni").value.trim();

            const nombre =
                document.getElementById("nombre").value.trim();

            const apellido =
                document.getElementById("apellido").value.trim();

            const correo =
                document.getElementById("correo").value.trim();

            const telefono =
                document.getElementById("telefono").value.trim();

            const fechaNacimiento =
                document.getElementById("fechaNacimiento").value;

            const carrera =
                document.getElementById("carrera").value;

            const ciclo =
                document.getElementById("ciclo").value;

            const turno =
                document.getElementById("turno").value;

            const modalidad =
                document.getElementById("modalidad").value;

            const contrasena =
                document.getElementById("contrasena").value;

            const confirmarContrasena =
                document.getElementById("confirmarContrasena").value;


            /*
             * Validación del DNI
             */

            if (!/^\d{8}$/.test(dni)) {

                mostrarMensaje(
                    formularioEstudiante,
                    "El DNI debe contener exactamente 8 números.",
                    "error"
                );

                return;
            }


            /*
             * Validación del teléfono
             */

            if (!/^9\d{8}$/.test(telefono)) {

                mostrarMensaje(
                    formularioEstudiante,
                    "El teléfono debe contener 9 números y comenzar con 9.",
                    "error"
                );

                return;
            }


            /*
             * Validación del código
             */

            if (codigo.length < 4) {

                mostrarMensaje(
                    formularioEstudiante,
                    "Ingrese un código de estudiante válido.",
                    "error"
                );

                return;
            }


            /*
             * Validación del nombre y apellido
             */

            if (nombre.length < 2) {

                mostrarMensaje(
                    formularioEstudiante,
                    "Ingrese un nombre válido.",
                    "error"
                );

                return;
            }

            if (apellido.length < 2) {

                mostrarMensaje(
                    formularioEstudiante,
                    "Ingrese un apellido válido.",
                    "error"
                );

                return;
            }


            /*
             * Validación de la contraseña
             */

            if (contrasena.length < 8) {

                mostrarMensaje(
                    formularioEstudiante,
                    "La contraseña debe tener al menos 8 caracteres.",
                    "error"
                );

                return;
            }


            /*
             * Confirmación de contraseña
             */

            if (contrasena !== confirmarContrasena) {

                mostrarMensaje(
                    formularioEstudiante,
                    "Las contraseñas no coinciden.",
                    "error"
                );

                return;
            }


            /*
             * Validación de los campos académicos
             */

            if (
                carrera === "" ||
                ciclo === "" ||
                turno === "" ||
                modalidad === "" ||
                fechaNacimiento === ""
            ) {

                mostrarMensaje(
                    formularioEstudiante,
                    "Complete todos los datos personales y académicos.",
                    "error"
                );

                return;
            }


            /*
             * Si todas las validaciones son correctas
             */

            mostrarMensaje(
                formularioEstudiante,
                "Formulario de estudiante validado correctamente.",
                "exito"
            );

        });
    }


    /*
     * ==========================================================
     * VALIDACIÓN DEL REGISTRO DE DOCENTE
     * ==========================================================
     */

    const formularioDocente =
        document.getElementById("formularioDocente");

    if (formularioDocente) {

        formularioDocente.addEventListener("submit", function (evento) {

            evento.preventDefault();

            const nombre =
                document.getElementById("nombre").value.trim();

            const apellido =
                document.getElementById("apellido").value.trim();

            const correo =
                document.getElementById("correo").value.trim();

            const telefono =
                document.getElementById("telefono").value.trim();

            const contrasena =
                document.getElementById("contrasena").value;

            const confirmarContrasena =
                document.getElementById("confirmarContrasena").value;


            if (nombre.length < 2) {

                mostrarMensaje(
                    formularioDocente,
                    "Ingrese un nombre válido.",
                    "error"
                );

                return;
            }


            if (apellido.length < 2) {

                mostrarMensaje(
                    formularioDocente,
                    "Ingrese un apellido válido.",
                    "error"
                );

                return;
            }


            if (!/^\d{9}$/.test(telefono)) {

                mostrarMensaje(
                    formularioDocente,
                    "El teléfono debe contener exactamente 9 números.",
                    "error"
                );

                return;
            }


            if (contrasena.length < 8) {

                mostrarMensaje(
                    formularioDocente,
                    "La contraseña debe tener al menos 8 caracteres.",
                    "error"
                );

                return;
            }


            if (contrasena !== confirmarContrasena) {

                mostrarMensaje(
                    formularioDocente,
                    "Las contraseñas no coinciden.",
                    "error"
                );

                return;
            }


            mostrarMensaje(
                formularioDocente,
                "Registro de docente validado correctamente.",
                "exito"
            );

        });
    }


    /*
     * ==========================================================
     * VALIDACIÓN DEL INICIO DE SESIÓN
     * ==========================================================
     */

    const formularioLogin =
        document.getElementById("formularioLogin");

    if (formularioLogin) {

        formularioLogin.addEventListener("submit", function (evento) {

            evento.preventDefault();

            const correo =
                document.getElementById("correo").value.trim();

            const contrasena =
                document.getElementById("contrasena").value;


            if (correo === "" || contrasena === "") {

                mostrarMensaje(
                    formularioLogin,
                    "Ingrese su correo y contraseña.",
                    "error"
                );

                return;
            }


            if (contrasena.length < 8) {

                mostrarMensaje(
                    formularioLogin,
                    "La contraseña debe tener al menos 8 caracteres.",
                    "error"
                );

                return;
            }


            mostrarMensaje(
                formularioLogin,
                "Datos de acceso validados correctamente.",
                "exito"
            );

        });
    }


    /*
     * ==========================================================
     * FUNCIÓN PARA MOSTRAR MENSAJES
     * ==========================================================
     */

    function mostrarMensaje(formulario, texto, tipo) {

        const mensajeAnterior =
            formulario.parentNode.querySelector(".mensaje-formulario");

        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }


        const mensaje =
            document.createElement("div");

        mensaje.className =
            "mensaje-formulario " +
            (tipo === "exito"
                ? "mensaje-exito"
                : "mensaje-error");

        mensaje.textContent = texto;


        formulario.parentNode.insertBefore(
            mensaje,
            formulario
        );
    }

});