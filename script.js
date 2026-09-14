document.addEventListener("DOMContentLoaded", function () {

    // *============================================================*
    // *MENSAJE DE ACCESO AL REGISTRO DE ESTUDIANTES*
    // *============================================================*

    const parametros = new URLSearchParams(window.location.search);

    const accion = parametros.get("accion");

    if (accion === "registrar") {

        mostrarMensaje(
            "Debes iniciar sesión como docente para registrar un estudiante.",
            "aviso",
            "mensaje-aviso"
        );

    }


    // *============================================================*
    // *REGISTRO DE ESTUDIANTES*
    // *============================================================*

    const formularioEstudiante =
        document.getElementById("formularioEstudiante");

    if (formularioEstudiante) {

        formularioEstudiante.addEventListener("submit", function (evento) {

            evento.preventDefault();


            // *Obtener datos del formulario*

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

            const curso =
                document.getElementById("curso").value;

            const ciclo =
                document.getElementById("ciclo").value;

            const turno =
                document.getElementById("turno").value;

            const modalidad =
                document.getElementById("modalidad").value;


            // *====================================================*
            // *VALIDACIONES*
            // *====================================================*

            if (
                !codigo ||
                !dni ||
                !nombre ||
                !apellido ||
                !correo ||
                !telefono ||
                !fechaNacimiento ||
                !carrera ||
                !curso ||
                !ciclo ||
                !turno ||
                !modalidad
            ) {

                mostrarMensaje(
                    "Por favor, completa todos los campos del formulario.",
                    "error",
                    "mensaje-formulario"
                );

                return;

            }


            // *====================================================*
            // *OBTENER ESTUDIANTES GUARDADOS*
            // *====================================================*

            const estudiantesGuardados =
                JSON.parse(localStorage.getItem("estudiantes")) || [];


            // *====================================================*
            // *VALIDAR CÓDIGO DUPLICADO*
            // *====================================================*

            const codigoExiste =
                estudiantesGuardados.some(function (estudiante) {

                    return estudiante.codigo.toLowerCase() ===
                        codigo.toLowerCase();

                });


            if (codigoExiste) {

                mostrarMensaje(
                    "Ya existe un estudiante registrado con ese código.",
                    "error",
                    "mensaje-formulario"
                );

                return;

            }


            // *====================================================*
            // *CREAR NUEVO ESTUDIANTE*
            // *====================================================*

            const nuevoEstudiante = {

                codigo: codigo,
                dni: dni,
                nombre: nombre,
                apellido: apellido,
                correo: correo,
                telefono: telefono,
                fechaNacimiento: fechaNacimiento,
                carrera: carrera,
                curso: curso,
                ciclo: ciclo,
                turno: turno,
                modalidad: modalidad

            };


            // *====================================================*
            // *GUARDAR ESTUDIANTE*
            // *====================================================*

            estudiantesGuardados.push(nuevoEstudiante);

            localStorage.setItem(
                "estudiantes",
                JSON.stringify(estudiantesGuardados)
            );


            // *====================================================*
            // *MOSTRAR MENSAJE DE ÉXITO*
            // *====================================================*

            mostrarMensaje(
                "Estudiante registrado correctamente.",
                "exito",
                "mensaje-formulario"
            );


            // *Limpiar formulario*

            formularioEstudiante.reset();

        });

    }


    // *============================================================*
    // *MOSTRAR ESTUDIANTES EN LA PÁGINA DE GESTIÓN*
    // *============================================================*

    const estudiantesGrid =
        document.querySelector(".estudiantes-grid");

    if (estudiantesGrid) {

        mostrarEstudiantes();

    }


    // *============================================================*
    // *BOTÓN DE BÚSQUEDA*
    // *============================================================*

    const btnBuscar =
        document.getElementById("btnBuscar");

    if (btnBuscar) {

        btnBuscar.addEventListener("click", function () {

            buscarEstudiantes();

        });

    }


    // *============================================================*
    // *FUNCIÓN PARA MOSTRAR ESTUDIANTES*
    // *============================================================*

    function mostrarEstudiantes() {

        const estudiantes =
            JSON.parse(localStorage.getItem("estudiantes")) || [];


        if (estudiantes.length === 0) {

            estudiantesGrid.innerHTML = `
                <div class="mensaje-aviso">
                    No hay estudiantes registrados actualmente.
                </div>
            `;

            actualizarCantidad(0);

            return;

        }


        estudiantesGrid.innerHTML = "";


        estudiantes.forEach(function (estudiante) {

            const iniciales =
                obtenerIniciales(
                    estudiante.nombre,
                    estudiante.apellido
                );


            const tarjeta =
                document.createElement("div");

            tarjeta.classList.add("estudiante-card");


            tarjeta.innerHTML = `
                <div class="estudiante-avatar">
                    ${iniciales}
                </div>

                <div class="estudiante-info">

                    <h4>
                        ${estudiante.nombre}
                        ${estudiante.apellido}
                    </h4>

                    <p>
                        <strong>Código:</strong>
                        ${estudiante.codigo}
                    </p>

                    <p>
                        <strong>Carrera:</strong>
                        ${convertirCarrera(estudiante.carrera)}
                    </p>

                    <p>
                        <strong>Curso:</strong>
                        ${convertirCurso(estudiante.curso)}
                    </p>

                    <p>
                        <strong>Ciclo:</strong>
                        ${estudiante.ciclo}
                    </p>

                    <p>
                        <strong>Turno:</strong>
                        ${convertirTurno(estudiante.turno)}
                    </p>

                    <p>
                        <strong>Modalidad:</strong>
                        ${convertirModalidad(estudiante.modalidad)}
                    </p>

                    <a href="#" class="btn">
                        Ver información
                    </a>

                </div>
            `;


            estudiantesGrid.appendChild(tarjeta);

        });


        actualizarCantidad(estudiantes.length);

    }


    // *============================================================*
    // *BUSCAR Y FILTRAR ESTUDIANTES*
    // *============================================================*

function buscarEstudiantes() {

    const codigoBusqueda =
        document.getElementById("codigoBusqueda").value
            .trim()
            .toLowerCase();

    const estudiantes =
        JSON.parse(localStorage.getItem("estudiantes")) || [];

    const resultados =
        estudiantes.filter(function (estudiante) {

            return estudiante.codigo
                .toLowerCase()
                .includes(codigoBusqueda);

        });

    mostrarResultados(resultados);
}


    // *============================================================*
    // *MOSTRAR RESULTADOS DE LA BÚSQUEDA*
    // *============================================================*

    function mostrarResultados(resultados) {

        if (resultados.length === 0) {

            estudiantesGrid.innerHTML = `
                <div class="mensaje-aviso">
                    No se encontraron estudiantes con el codigo ingresado.
                </div>
            `;

            actualizarCantidad(0);

            return;

        }


        estudiantesGrid.innerHTML = "";


        resultados.forEach(function (estudiante) {

            const iniciales =
                obtenerIniciales(
                    estudiante.nombre,
                    estudiante.apellido
                );


            const tarjeta =
                document.createElement("div");

            tarjeta.classList.add("estudiante-card");


            tarjeta.innerHTML = `
                <div class="estudiante-avatar">
                    ${iniciales}
                </div>

                <div class="estudiante-info">

                    <h4>
                        ${estudiante.nombre}
                        ${estudiante.apellido}
                    </h4>

                    <p>
                        <strong>Código:</strong>
                        ${estudiante.codigo}
                    </p>

                    <p>
                        <strong>Carrera:</strong>
                        ${convertirCarrera(estudiante.carrera)}
                    </p>

                    <p>
                        <strong>Curso:</strong>
                        ${convertirCurso(estudiante.curso)}
                    </p>

                    <p>
                        <strong>Ciclo:</strong>
                        ${estudiante.ciclo}
                    </p>

                    <p>
                        <strong>Turno:</strong>
                        ${convertirTurno(estudiante.turno)}
                    </p>

                    <p>
                        <strong>Modalidad:</strong>
                        ${convertirModalidad(estudiante.modalidad)}
                    </p>

                    <a href="#" class="btn">
                        Ver información
                    </a>

                </div>
            `;


            estudiantesGrid.appendChild(tarjeta);

        });


        actualizarCantidad(resultados.length);

    }


    // *============================================================*
    // *ACTUALIZAR CANTIDAD DE ESTUDIANTES*
    // *============================================================*

    function actualizarCantidad(cantidad) {

        const cantidadElemento =
            document.querySelector(".cantidad");


        if (!cantidadElemento) {

            return;

        }


        cantidadElemento.textContent =
            cantidad +
            (
                cantidad === 1
                    ? " estudiante encontrado"
                    : " estudiantes encontrados"
            );

    }


    // *============================================================*
    // *OBTENER INICIALES*
    // *============================================================*

    function obtenerIniciales(nombre, apellido) {

        const inicialNombre =
            nombre.charAt(0).toUpperCase();


        const inicialApellido =
            apellido.charAt(0).toUpperCase();


        return inicialNombre + inicialApellido;

    }


    // *============================================================*
    // *CONVERTIR CARRERA*
    // *============================================================*

    function convertirCarrera(carrera) {

        const carreras = {

            "ingenieria-sistemas":
                "Ingeniería de Sistemas",

            "ingenieria-industrial":
                "Ingeniería Industrial",

            "administracion":
                "Administración",

            "contabilidad":
                "Contabilidad",

            "derecho":
                "Derecho"

        };


        return carreras[carrera] || carrera;

    }


    // *============================================================*
    // *CONVERTIR CURSO*
    // *============================================================*

    function convertirCurso(curso) {

        const cursos = {

            "programacion-web":
                "Programación Web",

            "base-de-datos":
                "Base de Datos",

            "ingenieria-software":
                "Ingeniería de Software",

            "algoritmos":
                "Algoritmos"

        };


        return cursos[curso] || curso;

    }


    // *============================================================*
    // *CONVERTIR TURNO*
    // *============================================================*

    function convertirTurno(turno) {

        const turnos = {

            "manana": "Mañana",

            "tarde": "Tarde",

            "noche": "Noche"

        };


        return turnos[turno] || turno;

    }


    // *============================================================*
    // *CONVERTIR MODALIDAD*
    // *============================================================*

    function convertirModalidad(modalidad) {

        const modalidades = {

            "presencial": "Presencial",

            "virtual": "Virtual",

            "semipresencial": "Semipresencial"

        };


        return modalidades[modalidad] || modalidad;

    }


    // *============================================================*
    // *REGISTRO DE DOCENTE*
    // *============================================================*

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


            if (
                !nombre ||
                !apellido ||
                !correo ||
                !telefono ||
                !contrasena ||
                !confirmarContrasena
            ) {

                mostrarMensaje(
                    "Por favor, completa todos los campos.",
                    "error",
                    "mensaje-formulario"
                );

                return;

            }


            if (contrasena !== confirmarContrasena) {

                mostrarMensaje(
                    "Las contraseñas no coinciden.",
                    "error",
                    "mensaje-formulario"
                );

                return;

            }


            mostrarMensaje(
                "Docente registrado correctamente.",
                "exito",
                "mensaje-formulario"
            );


            formularioDocente.reset();

        });

    }


    // *============================================================*
    // *LOGIN DEL DOCENTE*
    // *============================================================*

    const formularioLogin =
        document.getElementById("formularioLogin");


    if (formularioLogin) {

        formularioLogin.addEventListener("submit", function (evento) {

            evento.preventDefault();


            const correo =
                document.getElementById("correo").value.trim();


            const contrasena =
                document.getElementById("contrasena").value;


            if (!correo || !contrasena) {

                mostrarMensaje(
                    "Ingresa tu correo y contraseña.",
                    "error",
                    "mensaje-formulario"
                );

                return;

            }


            mostrarMensaje(
                "Inicio de sesión correcto.",
                "exito",
                "mensaje-formulario"
            );

        });

    }


    // *============================================================*
    // *FUNCIÓN GENERAL PARA MOSTRAR MENSAJES*
    // *============================================================*

    function mostrarMensaje(texto, tipo, clase) {

        const mensajeAnterior =
            document.querySelector(
                ".mensaje-formulario, .mensaje-aviso"
            );


        if (mensajeAnterior) {

            mensajeAnterior.remove();

        }


        const mensaje =
            document.createElement("div");


        mensaje.classList.add(clase);


        if (tipo === "error") {

            mensaje.classList.add("mensaje-error");

        }


        if (tipo === "exito") {

            mensaje.classList.add("mensaje-exito");

        }


        if (tipo === "aviso") {

            mensaje.classList.add("mensaje-aviso");

        }


        mensaje.textContent = texto;


        const formulario =
            document.querySelector("form");


        if (formulario) {

            formulario.parentNode.insertBefore(
                mensaje,
                formulario
            );

        }

    }

});