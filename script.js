document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const CLAVES = {
        estudiantes: "estudiantes",
        docentes: "docentes",
        sesion: "docenteSesion"
    };

    const parametros = new URLSearchParams(window.location.search);
    const pagina = window.location.pathname.split("/").pop().toLowerCase();

    // UTILIDADES DE ALMACENAMIENTO

    function leerLista(clave) {
        try {
            const valor = JSON.parse(localStorage.getItem(clave) || "[]");
            return Array.isArray(valor) ? valor : [];
        } catch (error) {
            console.error(`No se pudo leer el almacenamiento "${clave}":`, error);
            return [];
        }
    }

    function guardarLista(clave, lista) {
        try {
            localStorage.setItem(clave, JSON.stringify(lista));
            return true;
        } catch (error) {
            console.error(`No se pudo guardar el almacenamiento "${clave}":`, error);
            mostrarMensaje(
                "No se pudieron guardar los datos. Comprueba el espacio disponible del navegador.",
                "error",
                "mensaje-formulario"
            );
            return false;
        }
    }

    function normalizar(valor) {
        return String(valor ?? "").trim().toLocaleLowerCase("es");
    }

    function obtenerSesion() {
        try {
            const sesion = JSON.parse(localStorage.getItem(CLAVES.sesion) || "null");
            if (!sesion || !sesion.correo) return null;

            const docenteExiste = leerLista(CLAVES.docentes).some(function (docente) {
                return normalizar(docente.correo) === normalizar(sesion.correo);
            });

            return docenteExiste ? sesion : null;
        } catch (error) {
            return null;
        }
    }

    function cerrarSesion() {
        localStorage.removeItem(CLAVES.sesion);
    }

    // MENSAJES DE ESTADO
    function mostrarMensaje(texto, tipo, claseBase) {
        document.querySelectorAll(
            ".mensaje-formulario, .mensaje-aviso, .mensaje-error, .mensaje-exito"
        ).forEach(function (mensajeAnterior) {
            mensajeAnterior.remove();
        });

        const mensaje = document.createElement("div");
        mensaje.classList.add(claseBase || "mensaje-formulario");
        mensaje.classList.add(
            tipo === "error" ? "mensaje-error" :
            tipo === "exito" ? "mensaje-exito" :
            "mensaje-aviso"
        );
        mensaje.setAttribute("role", tipo === "error" ? "alert" : "status");
        mensaje.textContent = texto;

        const formulario = document.querySelector("form");
        if (formulario && formulario.parentNode) {
            formulario.parentNode.insertBefore(mensaje, formulario);
        } else {
            const contenedor = document.querySelector("main") || document.body;
            contenedor.prepend(mensaje);
        }
        return mensaje;
    }

    function validarCorreo(correo) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    }

    function validarTelefono(telefono) {
        return /^\d{9}$/.test(telefono);
    }

    function leerCampo(id) {
        const elemento = document.getElementById(id);
        return elemento ? elemento.value.trim() : "";
    }

    function establecerCampo(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) elemento.value = valor ?? "";
    }
    // PROTECCIÓN DE PÁGINAS PARA LA DEMOSTRACIÓN
    const paginasProtegidas = ["estudiantes.html", "formulario.html"];
    const sesionActual = obtenerSesion();

    if (paginasProtegidas.includes(pagina) && !sesionActual) {
        const destino = `${pagina}${window.location.search}`;
        window.location.replace(`login.html?redirigir=${encodeURIComponent(destino)}`);
        return;
    }

    // El enlace "Cerrar sesión" puede apuntar a login.html, pero debe limpiar
    // la sesión antes de navegar. Se identifica por el texto visible del enlace.
    document.querySelectorAll("a").forEach(function (enlace) {
        if (normalizar(enlace.textContent).includes("cerrar sesión") ||
            normalizar(enlace.textContent).includes("cerrar sesion")) {
            enlace.addEventListener("click", function (evento) {
                evento.preventDefault();
                cerrarSesion();
                window.location.href = "login.html?cerrado=1";
            });
        }
    });

    if (parametros.get("cerrado") === "1") {
        mostrarMensaje("Has cerrado sesión correctamente.", "exito", "mensaje-formulario");
    }

    // REGISTRO Y EDICIÓN DE ESTUDIANTES
    const formularioEstudiante = document.getElementById("formularioEstudiante");

    if (formularioEstudiante) {
        const codigoEditar = parametros.get("editar");
        let codigoOriginal = codigoEditar || "";
        let estudianteEncontrado = null;

        if (codigoEditar) {
            const estudiantes = leerLista(CLAVES.estudiantes);
            estudianteEncontrado = estudiantes.find(function (estudiante) {
                return normalizar(estudiante.codigo) === normalizar(codigoEditar);
            });

            if (!estudianteEncontrado) {
                mostrarMensaje("No se encontró el estudiante que deseas editar.", "error", "mensaje-formulario");
            } else {
                [
                    "codigo", "dni", "nombre", "apellido", "correo", "telefono",
                    "fechaNacimiento", "carrera", "ciclo", "turno", "modalidad"
                ].forEach(function (campo) {
                    establecerCampo(campo, estudianteEncontrado[campo]);
                });
                mostrarMensaje("Estás editando la información del estudiante.", "aviso", "mensaje-aviso");
            }
        }

        if (parametros.get("accion") === "registrar") {
            mostrarMensaje("Completa el formulario para registrar un estudiante.", "aviso", "mensaje-aviso");
        }

        formularioEstudiante.addEventListener("submit", function (evento) {
            evento.preventDefault();

            const estudiante = {
                codigo: leerCampo("codigo"),
                dni: leerCampo("dni"),
                nombre: leerCampo("nombre"),
                apellido: leerCampo("apellido"),
                correo: leerCampo("correo"),
                telefono: leerCampo("telefono"),
                fechaNacimiento: leerCampo("fechaNacimiento"),
                carrera: leerCampo("carrera"),
                ciclo: leerCampo("ciclo"),
                turno: leerCampo("turno"),
                modalidad: leerCampo("modalidad")
            };

            if (Object.values(estudiante).some(function (valor) { return !valor; })) {
                mostrarMensaje("Por favor, completa todos los campos del formulario.", "error", "mensaje-formulario");
                return;
            }

            if (!/^\d{8}$/.test(estudiante.dni)) {
                mostrarMensaje("El DNI debe contener exactamente 8 dígitos.", "error", "mensaje-formulario");
                return;
            }

            if (!validarCorreo(estudiante.correo)) {
                mostrarMensaje("Ingresa un correo electrónico válido.", "error", "mensaje-formulario");
                return;
            }

            if (!validarTelefono(estudiante.telefono)) {
                mostrarMensaje("El teléfono debe contener exactamente 9 dígitos.", "error", "mensaje-formulario");
                return;
            }

            const fechaNacimiento = new Date(`${estudiante.fechaNacimiento}T00:00:00`);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            if (Number.isNaN(fechaNacimiento.getTime()) || fechaNacimiento > hoy) {
                mostrarMensaje("La fecha de nacimiento no puede ser una fecha futura.", "error", "mensaje-formulario");
                return;
            }

            const estudiantes = leerLista(CLAVES.estudiantes);
            const indiceOriginal = codigoOriginal
                ? estudiantes.findIndex(function (item) {
                    return normalizar(item.codigo) === normalizar(codigoOriginal);
                })
                : -1;

            if (codigoOriginal && indiceOriginal === -1) {
                mostrarMensaje("El estudiante que intentas editar ya no existe. Actualiza la página e inténtalo de nuevo.", "error", "mensaje-formulario");
                return;
            }

            const codigoDuplicado = estudiantes.some(function (item, indice) {
                return indice !== indiceOriginal && normalizar(item.codigo) === normalizar(estudiante.codigo);
            });
            if (codigoDuplicado) {
                mostrarMensaje("Ya existe un estudiante registrado con ese código.", "error", "mensaje-formulario");
                return;
            }

            const dniDuplicado = estudiantes.some(function (item, indice) {
                return indice !== indiceOriginal && normalizar(item.dni) === normalizar(estudiante.dni);
            });
            if (dniDuplicado) {
                mostrarMensaje("Ya existe un estudiante registrado con ese DNI.", "error", "mensaje-formulario");
                return;
            }

            const correoDuplicado = estudiantes.some(function (item, indice) {
                return indice !== indiceOriginal && normalizar(item.correo) === normalizar(estudiante.correo);
            });
            if (correoDuplicado) {
                mostrarMensaje("Ya existe un estudiante registrado con ese correo.", "error", "mensaje-formulario");
                return;
            }

            const telefonoDuplicado = estudiantes.some(function (item, indice) {
                return indice !== indiceOriginal && normalizar(item.telefono) === normalizar(estudiante.telefono);
            });
            if (telefonoDuplicado) {
                mostrarMensaje("Ya existe un estudiante registrado con ese número de celular.", "error", "mensaje-formulario");
                return;
            }

            if (indiceOriginal >= 0) {
                estudiantes[indiceOriginal] = estudiante;
                if (!guardarLista(CLAVES.estudiantes, estudiantes)) return;
                window.location.href = "estudiantes.html";
                return;
            }

            estudiantes.push(estudiante);
            if (!guardarLista(CLAVES.estudiantes, estudiantes)) return;

            mostrarMensaje("Estudiante registrado correctamente.", "exito", "mensaje-formulario");
            formularioEstudiante.reset();
        });
    }

    // LISTADO, BÚSQUEDA, DETALLE Y ELIMINACIÓN DE ESTUDIANTES
    const estudiantesGrid = document.querySelector(".estudiantes-grid");
    const campoBusqueda = document.getElementById("codigoBusqueda");
    const btnBuscar = document.getElementById("btnBuscar");

    function convertirCarrera(carrera) {
        const carreras = {
            "ingenieria-sistemas": "Ingeniería de Sistemas",
            "ingenieria-industrial": "Ingeniería Industrial",
            administracion: "Administración",
            contabilidad: "Contabilidad",
            derecho: "Derecho"
        };
        return carreras[carrera] || carrera || "No especificada";
    }

    function convertirTurno(turno) {
        const turnos = { manana: "Mañana", tarde: "Tarde", noche: "Noche" };
        return turnos[turno] || turno || "No especificado";
    }

    function convertirModalidad(modalidad) {
        const modalidades = {
            presencial: "Presencial",
            virtual: "Virtual",
            semipresencial: "Semipresencial"
        };
        return modalidades[modalidad] || modalidad || "No especificada";
    }

    function actualizarCantidad(cantidad) {
        const elemento = document.querySelector(".cantidad");
        if (!elemento) return;
        elemento.textContent = `${cantidad} ${cantidad === 1 ? "estudiante encontrado" : "estudiantes encontrados"}`;
    }

    function crearParrafoDetalle(etiqueta, valor) {
        const parrafo = document.createElement("p");
        const fuerte = document.createElement("strong");
        fuerte.textContent = `${etiqueta}: `;
        parrafo.append(fuerte, document.createTextNode(String(valor ?? "—")));
        return parrafo;
    }

    function crearBoton(texto, clases) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = clases;
        boton.textContent = texto;
        return boton;
    }

    function crearTarjetaEstudiante(estudiante) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "estudiante-card";

        const avatar = document.createElement("div");
        avatar.className = "estudiante-avatar";
        avatar.textContent = `${String(estudiante.nombre || "").charAt(0)}${String(estudiante.apellido || "").charAt(0)}`.toLocaleUpperCase("es");

        const info = document.createElement("div");
        info.className = "estudiante-info";

        const nombre = document.createElement("h4");
        nombre.textContent = `${estudiante.nombre || ""} ${estudiante.apellido || ""}`.trim() || "Estudiante sin nombre";

        info.append(
            nombre,
            crearParrafoDetalle("Código", estudiante.codigo),
            crearParrafoDetalle("Carrera", convertirCarrera(estudiante.carrera))
        );

        const detalles = document.createElement("div");
        detalles.className = "informacion-adicional";
        detalles.style.display = "none";
        detalles.append(
            crearParrafoDetalle("DNI", estudiante.dni),
            crearParrafoDetalle("Correo", estudiante.correo),
            crearParrafoDetalle("Teléfono", estudiante.telefono),
            crearParrafoDetalle("Fecha de nacimiento", estudiante.fechaNacimiento),
            crearParrafoDetalle("Ciclo", estudiante.ciclo),
            crearParrafoDetalle("Turno", convertirTurno(estudiante.turno)),
            crearParrafoDetalle("Modalidad", convertirModalidad(estudiante.modalidad))
        );

        const acciones = document.createElement("div");
        acciones.className = "acciones-estudiante";
        const btnInfo = crearBoton("Más información", "btn btn-info");
        const btnEditar = crearBoton("Editar", "btn btn-editar");
        const btnEliminar = crearBoton("Eliminar", "btn btn-eliminar");

        btnInfo.setAttribute("aria-expanded", "false");
        btnInfo.addEventListener("click", function () {
            const mostrar = detalles.style.display === "none";
            detalles.style.display = mostrar ? "block" : "none";
            btnInfo.textContent = mostrar ? "Ocultar información" : "Más información";
            btnInfo.setAttribute("aria-expanded", String(mostrar));
        });

        btnEditar.addEventListener("click", function () {
            window.location.href = `formulario.html?editar=${encodeURIComponent(estudiante.codigo)}`;
        });

        btnEliminar.addEventListener("click", function () {
            const confirmado = window.confirm(`¿Deseas eliminar a ${estudiante.nombre || "este estudiante"}?`);
            if (!confirmado) return;

            const todos = leerLista(CLAVES.estudiantes);
            const actualizados = todos.filter(function (item) {
                return normalizar(item.codigo) !== normalizar(estudiante.codigo);
            });
            if (!guardarLista(CLAVES.estudiantes, actualizados)) return;
            aplicarBusqueda();
        });

        acciones.append(btnInfo, btnEditar, btnEliminar);
        info.append(detalles, acciones);
        tarjeta.append(avatar, info);
        estudiantesGrid.appendChild(tarjeta);
    }

    function renderizarEstudiantes(lista, mensajeVacio) {
        if (!estudiantesGrid) return;
        estudiantesGrid.replaceChildren();

        if (lista.length === 0) {
            const mensaje = document.createElement("div");
            mensaje.className = "mensaje-aviso";
            mensaje.textContent = mensajeVacio || "No hay estudiantes registrados actualmente.";
            estudiantesGrid.appendChild(mensaje);
            actualizarCantidad(0);
            return;
        }

        lista.forEach(crearTarjetaEstudiante);
        actualizarCantidad(lista.length);
    }

    function aplicarBusqueda() {
        if (!estudiantesGrid) return;
        const estudiantes = leerLista(CLAVES.estudiantes);
        const consulta = normalizar(campoBusqueda ? campoBusqueda.value : "");

        if (!consulta) {
            renderizarEstudiantes(estudiantes, "No hay estudiantes registrados actualmente.");
            return;
        }

        const resultados = estudiantes.filter(function (estudiante) {
            return normalizar(estudiante.codigo).includes(consulta);
        });
        renderizarEstudiantes(resultados, "No se encontró ningún estudiante con ese código.");
    }

    if (estudiantesGrid) {
        aplicarBusqueda();
    }

    if (btnBuscar) {
        btnBuscar.addEventListener("click", aplicarBusqueda);
    }

    if (campoBusqueda) {
        campoBusqueda.addEventListener("keydown", function (evento) {
            if (evento.key === "Enter") {
                evento.preventDefault();
                aplicarBusqueda();
            }
        });
        campoBusqueda.addEventListener("input", aplicarBusqueda);
    }

    // REGISTRO DE DOCENTES
    const formularioDocente = document.getElementById("formularioDocente");

    if (formularioDocente) {
        formularioDocente.addEventListener("submit", function (evento) {
            evento.preventDefault();

            const docente = {
                nombre: leerCampo("nombre"),
                apellido: leerCampo("apellido"),
                correo: leerCampo("correo"),
                telefono: leerCampo("telefono"),
                contrasena: document.getElementById("contrasena")?.value || "",
                confirmarContrasena: document.getElementById("confirmarContrasena")?.value || ""
            };

            if (!docente.nombre || !docente.apellido || !docente.correo || !docente.telefono || !docente.contrasena || !docente.confirmarContrasena) {
                mostrarMensaje("Por favor, completa todos los campos.", "error", "mensaje-formulario");
                return;
            }
            if (!validarCorreo(docente.correo)) {
                mostrarMensaje("Ingresa un correo electrónico válido.", "error", "mensaje-formulario");
                return;
            }
            if (!validarTelefono(docente.telefono)) {
                mostrarMensaje("El teléfono debe contener exactamente 9 dígitos.", "error", "mensaje-formulario");
                return;
            }
            if (docente.contrasena.length < 8) {
                mostrarMensaje("La contraseña debe tener al menos 8 caracteres.", "error", "mensaje-formulario");
                return;
            }
            if (docente.contrasena !== docente.confirmarContrasena) {
                mostrarMensaje("Las contraseñas no coinciden.", "error", "mensaje-formulario");
                return;
            }

            const docentes = leerLista(CLAVES.docentes);
            if (docentes.some(function (item) { return normalizar(item.correo) === normalizar(docente.correo); })) {
                mostrarMensaje("Ya existe una cuenta registrada con ese correo.", "error", "mensaje-formulario");
                return;
            }

            // Demo local: nunca guardar contraseñas reales en localStorage.
            docentes.push({
                nombre: docente.nombre,
                apellido: docente.apellido,
                correo: docente.correo,
                telefono: docente.telefono,
                contrasena: docente.contrasena
            });

            if (!guardarLista(CLAVES.docentes, docentes)) return;
            mostrarMensaje("Docente registrado. Ahora puedes iniciar sesión.", "exito", "mensaje-formulario");
            formularioDocente.reset();
            window.setTimeout(function () {
                window.location.href = "login.html";
            }, 900);
        });
    }

    // INICIO DE SESIÓN DE DOCENTES
    const formularioLogin = document.getElementById("formularioLogin");

    if (formularioLogin) {
        formularioLogin.addEventListener("submit", function (evento) {
            evento.preventDefault();

            const correo = leerCampo("correo");
            const contrasena = document.getElementById("contrasena")?.value || "";

            if (!correo || !contrasena) {
                mostrarMensaje("Ingresa tu correo y contraseña.", "error", "mensaje-formulario");
                return;
            }
            if (!validarCorreo(correo)) {
                mostrarMensaje("Ingresa un correo electrónico válido.", "error", "mensaje-formulario");
                return;
            }

            const docente = leerLista(CLAVES.docentes).find(function (item) {
                return normalizar(item.correo) === normalizar(correo) && item.contrasena === contrasena;
            });

            if (!docente) {
                mostrarMensaje("Correo o contraseña incorrectos. Si aún no tienes una cuenta, regístrate como docente.", "error", "mensaje-formulario");
                return;
            }

            try {
                localStorage.setItem(CLAVES.sesion, JSON.stringify({
                    correo: docente.correo,
                    nombre: docente.nombre,
                    apellido: docente.apellido,
                    inicio: new Date().toISOString()
                }));
            } catch (error) {
                mostrarMensaje("No se pudo iniciar la sesión en este navegador.", "error", "mensaje-formulario");
                return;
            }

            const destinoSolicitado = parametros.get("redirigir") || "estudiantes.html";
            const destinoValido = /^(estudiantes\.html|formulario\.html)(\?.*)?$/.test(destinoSolicitado)
                ? destinoSolicitado
                : "estudiantes.html";

            mostrarMensaje("Inicio de sesión correcto. Redirigiendo…", "exito", "mensaje-formulario");
            window.setTimeout(function () {
                window.location.href = destinoValido;
            }, 500);
        });
    }
});
