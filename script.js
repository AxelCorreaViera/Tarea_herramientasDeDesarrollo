document.addEventListener("DOMContentLoaded", function () {

    // ============================================================
    // MENSAJE DE ACCESO AL REGISTRO DE ESTUDIANTES
    // ============================================================

    const parametros = new URLSearchParams(window.location.search);

    const accion = parametros.get("accion");

    if (accion === "registrar") {

        mostrarMensaje(
            "Debes iniciar sesión como docente para registrar un estudiante.",
            "aviso",
            "mensaje-aviso"
        );
    }


    // ============================================================
    // REGISTRO Y EDICIÓN DE ESTUDIANTES
    // ============================================================

    const formularioEstudiante =
        document.getElementById("formularioEstudiante");

    if (formularioEstudiante) {

        // ========================================================
        // DETECTAR SI SE ESTÁ EDITANDO UN ESTUDIANTE
        // ========================================================

        const codigoEditar = parametros.get("editar");

        if (codigoEditar) {

            const estudiantes =
                JSON.parse(localStorage.getItem("estudiantes")) || [];

            const estudianteEditar =
                estudiantes.find(function (estudiante) {

                    return estudiante.codigo.toLowerCase() ===
                        codigoEditar.toLowerCase();

                });

            if (estudianteEditar) {

                document.getElementById("codigo").value =
                    estudianteEditar.codigo;

                document.getElementById("dni").value =
                    estudianteEditar.dni;

                document.getElementById("nombre").value =
                    estudianteEditar.nombre;

                document.getElementById("apellido").value =
                    estudianteEditar.apellido;

                document.getElementById("correo").value =
                    estudianteEditar.correo;

                document.getElementById("telefono").value =
                    estudianteEditar.telefono;

                document.getElementById("fechaNacimiento").value =
                    estudianteEditar.fechaNacimiento;

                document.getElementById("carrera").value =
                    estudianteEditar.carrera;

                document.getElementById("ciclo").value =
                    estudianteEditar.ciclo;

                document.getElementById("turno").value =
                    estudianteEditar.turno;

                document.getElementById("modalidad").value =
                    estudianteEditar.modalidad;

                mostrarMensaje(
                    "Editando información del estudiante.",
                    "aviso",
                    "mensaje-aviso"
                );
            }
        }


        // ========================================================
        // ENVIAR FORMULARIO
        // ========================================================

        formularioEstudiante.addEventListener("submit", function (evento) {

            evento.preventDefault();


            // ====================================================
            // OBTENER DATOS DEL FORMULARIO
            // ====================================================

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


            // ====================================================
            // VALIDACIONES
            // ====================================================

            if (
                !codigo ||
                !dni ||
                !nombre ||
                !apellido ||
                !correo ||
                !telefono ||
                !fechaNacimiento ||
                !carrera ||
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


            // ====================================================
            // OBTENER ESTUDIANTES GUARDADOS
            // ====================================================

            const estudiantesGuardados =
                JSON.parse(localStorage.getItem("estudiantes")) || [];


            // ====================================================
            // EDITAR ESTUDIANTE
            // ====================================================

            if (codigoEditar) {

                const indiceEstudiante =
                    estudiantesGuardados.findIndex(function (estudiante) {

                        return estudiante.codigo.toLowerCase() ===
                            codigoEditar.toLowerCase();

                    });


                if (indiceEstudiante === -1) {

                    mostrarMensaje(
                        "No se encontró el estudiante que deseas editar.",
                        "error",
                        "mensaje-formulario"
                    );

                    return;
                }


                // =================================================
                // VALIDAR CÓDIGO DUPLICADO AL EDITAR
                // =================================================

                const codigoExiste =
                    estudiantesGuardados.some(function (estudiante, indice) {

                        return indice !== indiceEstudiante &&
                            estudiante.codigo.toLowerCase() ===
                            codigo.toLowerCase();

                    });


                if (codigoExiste) {

                    mostrarMensaje(
                        "Ya existe otro estudiante registrado con ese código.",
                        "error",
                        "mensaje-formulario"
                    );

                    return;
                }


                // =================================================
                // ACTUALIZAR ESTUDIANTE
                // =================================================

                estudiantesGuardados[indiceEstudiante] = {

                    codigo: codigo,
                    dni: dni,
                    nombre: nombre,
                    apellido: apellido,
                    correo: correo,
                    telefono: telefono,
                    fechaNacimiento: fechaNacimiento,
                    carrera: carrera,
                    ciclo: ciclo,
                    turno: turno,
                    modalidad: modalidad

                };


                // =================================================
                // GUARDAR CAMBIOS
                // =================================================

                localStorage.setItem(
                    "estudiantes",
                    JSON.stringify(estudiantesGuardados)
                );


                alert("Estudiante actualizado correctamente.");

                window.location.href = "estudiantes.html";

                return;
            }


            // ====================================================
            // VALIDAR CÓDIGO DUPLICADO AL REGISTRAR
            // ====================================================

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


            // ====================================================
            // CREAR NUEVO ESTUDIANTE
            // ====================================================

            const nuevoEstudiante = {

                codigo: codigo,
                dni: dni,
                nombre: nombre,
                apellido: apellido,
                correo: correo,
                telefono: telefono,
                fechaNacimiento: fechaNacimiento,
                carrera: carrera,
                ciclo: ciclo,
                turno: turno,
                modalidad: modalidad

            };


            // ====================================================
            // GUARDAR ESTUDIANTE
            // ====================================================

            estudiantesGuardados.push(nuevoEstudiante);

            localStorage.setItem(
                "estudiantes",
                JSON.stringify(estudiantesGuardados)
            );


            // ====================================================
            // MOSTRAR MENSAJE DE ÉXITO
            // ====================================================

            mostrarMensaje(
                "Estudiante registrado correctamente.",
                "exito",
                "mensaje-formulario"
            );


            // Limpiar formulario
            formularioEstudiante.reset();

        });
    }


    // ============================================================
    // MOSTRAR ESTUDIANTES EN LA PÁGINA DE GESTIÓN
    // ============================================================

    const estudiantesGrid =
        document.querySelector(".estudiantes-grid");

    if (estudiantesGrid) {

        mostrarEstudiantes();

    }


    // ============================================================
    // BOTÓN DE BÚSQUEDA
    // ============================================================

    const btnBuscar =
        document.getElementById("btnBuscar");

    if (btnBuscar) {

        btnBuscar.addEventListener("click", function () {

            buscarEstudiantes();

        });

    }


    // ============================================================
    // FUNCIÓN PARA MOSTRAR ESTUDIANTES
    // ============================================================

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

            crearTarjetaEstudiante(estudiante);

        });


        actualizarCantidad(estudiantes.length);

    }


    // ============================================================
    // CREAR TARJETA DE ESTUDIANTE
    // ============================================================

    function crearTarjetaEstudiante(estudiante) {

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

        <div class="informacion-adicional" style="display: none;">

            <p>
                <strong>DNI:</strong>
                ${estudiante.dni}
            </p>

            <p>
                <strong>Correo:</strong>
                ${estudiante.correo}
            </p>

            <p>
                <strong>Teléfono:</strong>
                ${estudiante.telefono}
            </p>

            <p>
                <strong>Fecha de nacimiento:</strong>
                ${estudiante.fechaNacimiento}
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

        </div>

        <div class="acciones-estudiante">

            <button type="button" class="btn btn-info">
                Más información
            </button>

            <button type="button" class="btn btn-editar">
                Editar
            </button>

            <button type="button" class="btn btn-eliminar">
                Eliminar
            </button>

        </div>

    </div>
`;
// ========================================================
// BOTÓN MÁS INFORMACIÓN
// ========================================================

const btnInfo =
    tarjeta.querySelector(".btn-info");

const informacionAdicional =
    tarjeta.querySelector(".informacion-adicional");

btnInfo.addEventListener("click", function () {

    if (informacionAdicional.style.display === "none") {

        informacionAdicional.style.display = "block";

        btnInfo.textContent = "Ocultar información";

    } else {

        informacionAdicional.style.display = "none";

        btnInfo.textContent = "Más información";

    }

});

        // ========================================================
        // BOTÓN EDITAR
        // ========================================================

        const btnEditar =
            tarjeta.querySelector(".btn-editar");

        btnEditar.addEventListener("click", function () {

            window.location.href =
                "formulario.html?editar=" +
                encodeURIComponent(estudiante.codigo);

        });


        // ========================================================
        // BOTÓN ELIMINAR
        // ========================================================

        const btnEliminar =
            tarjeta.querySelector(".btn-eliminar");

        btnEliminar.addEventListener("click", function () {

            eliminarEstudiante(estudiante.codigo);

        });


        estudiantesGrid.appendChild(tarjeta);

    }


    // ============================================================
    // ELIMINAR ESTUDIANTE
    // ============================================================

    function eliminarEstudiante(codigo) {

        const confirmar =
            confirm(
                "¿Estás seguro de que deseas eliminar a este estudiante?"
            );


        if (!confirmar) {

            return;

        }


        const estudiantes =
            JSON.parse(localStorage.getItem("estudiantes")) || [];


        const estudiantesActualizados =
            estudiantes.filter(function (estudiante) {

                return estudiante.codigo.toLowerCase() !==
                    codigo.toLowerCase();

            });


        localStorage.setItem(
            "estudiantes",
            JSON.stringify(estudiantesActualizados)
        );


        mostrarEstudiantes();

    }


    // ============================================================
    // BUSCAR ESTUDIANTES POR CÓDIGO
    // ============================================================

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


    // ============================================================
    // MOSTRAR RESULTADOS DE LA BÚSQUEDA
    // ============================================================

    function mostrarResultados(resultados) {

        if (resultados.length === 0) {

            estudiantesGrid.innerHTML = `
                <div class="mensaje-aviso">
                    No se encontró ningún estudiante con ese código.
                </div>
            `;

            actualizarCantidad(0);

            return;
        }


        estudiantesGrid.innerHTML = "";


        resultados.forEach(function (estudiante) {

            crearTarjetaEstudiante(estudiante);

        });


        actualizarCantidad(resultados.length);

    }


    // ============================================================
    // ACTUALIZAR CANTIDAD DE ESTUDIANTES
    // ============================================================

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


    // ============================================================
    // OBTENER INICIALES
    // ============================================================

    function obtenerIniciales(nombre, apellido) {

        const inicialNombre =
            nombre.charAt(0).toUpperCase();


        const inicialApellido =
            apellido.charAt(0).toUpperCase();


        return inicialNombre + inicialApellido;

    }


    // ============================================================
    // CONVERTIR CARRERA
    // ============================================================

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

    // ============================================================
    // CONVERTIR TURNO
    // ============================================================

    function convertirTurno(turno) {

        const turnos = {

            "manana": "Mañana",
            "tarde": "Tarde",
            "noche": "Noche"

        };


        return turnos[turno] || turno;

    }


    // ============================================================
    // CONVERTIR MODALIDAD
    // ============================================================

    function convertirModalidad(modalidad) {

        const modalidades = {

            "presencial": "Presencial",
            "virtual": "Virtual",
            "semipresencial": "Semipresencial"

        };


        return modalidades[modalidad] || modalidad;

    }


    // ============================================================
    // REGISTRO DE DOCENTE
    // ============================================================

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


    // ============================================================
    // LOGIN DEL DOCENTE
    // ============================================================

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


    // ============================================================
    // FUNCIÓN GENERAL PARA MOSTRAR MENSAJES
    // ============================================================

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