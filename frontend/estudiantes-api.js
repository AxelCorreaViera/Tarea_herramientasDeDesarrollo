
document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8080/api/estudiantes";

    const formulario = document.getElementById("formularioEstudiante");
    const estudiantesGrid = document.querySelector(".estudiantes-grid");
    const inputBusqueda = document.getElementById("codigoBusqueda");
    const btnBuscar = document.getElementById("btnBuscar");

    const parametros = new URLSearchParams(window.location.search);
    const parametroEditar = parametros.get("editar");

    let estudiantes = [];
    let estudianteEditando = null;

    function escapar(valor) {
        return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[caracter]);
    }

    function convertirCarrera(carrera) {
        const carreras = {
            "ingenieria-sistemas": "Ingeniería de Sistemas",
            "ingenieria-industrial": "Ingeniería Industrial",
            "administracion": "Administración",
            "contabilidad": "Contabilidad",
            "derecho": "Derecho"
        };

        return carreras[carrera] || carrera || "";
    }

    function convertirTurno(turno) {
        const turnos = {
            manana: "Mañana",
            tarde: "Tarde",
            noche: "Noche"
        };

        return turnos[turno] || turno || "";
    }

    function convertirModalidad(modalidad) {
        const modalidades = {
            presencial: "Presencial",
            virtual: "Virtual",
            semipresencial: "Semipresencial"
        };

        return modalidades[modalidad] || modalidad || "";
    }

    function mostrarMensaje(texto, tipo = "aviso") {
        let mensaje = document.getElementById("mensajeAPI");

        if (!mensaje) {
            mensaje = document.createElement("div");
            mensaje.id = "mensajeAPI";
            mensaje.className = "mensaje-aviso";

            if (formulario) {
                formulario.parentNode.insertBefore(mensaje, formulario);
            } else if (estudiantesGrid) {
                estudiantesGrid.parentNode.insertBefore(
                    mensaje,
                    estudiantesGrid
                );
            } else {
                return;
            }
        }

        mensaje.className = tipo === "error"
            ? "mensaje-aviso mensaje-error"
            : tipo === "exito"
                ? "mensaje-aviso mensaje-exito"
                : "mensaje-aviso";

        mensaje.textContent = texto;
        mensaje.style.display = "block";
    }

    async function solicitar(url, opciones = {}) {
        let respuesta;

        try {
            respuesta = await fetch(url, {
                ...opciones,
                headers: {
                    ...(opciones.body
                        ? { "Content-Type": "application/json" }
                        : {}),
                    ...opciones.headers
                }
            });
        } catch (error) {
            throw new Error(
                "No se pudo conectar con el backend. Comprueba que Spring Boot esté ejecutándose en el puerto 8080."
            );
        }

        if (!respuesta.ok) {
            const texto = await respuesta.text();
            let detalle = texto;

            try {
                const datos = JSON.parse(texto);
                detalle = datos.mensaje || datos.message || texto;
            } catch {
                // La respuesta no era JSON.
            }

            if (respuesta.status === 404) {
                throw new Error("No se encontró el estudiante solicitado.");
            }

            if (respuesta.status === 400) {
                throw new Error(
                    detalle && detalle.length < 300
                        ? detalle
                        : "No se pudieron guardar los datos. Revisa el formulario."
                );
            }

            throw new Error(
                "Error del servidor (" + respuesta.status + ")."
            );
        }

        if (respuesta.status === 204) {
            return null;
        }

        return respuesta.json();
    }

    async function cargarEstudiantes() {
        if (!estudiantesGrid) return;

        estudiantesGrid.innerHTML = "<p>Cargando estudiantes...</p>";

        try {
            estudiantes = await solicitar(API_URL);
            mostrarEstudiantes();
        } catch (error) {
            estudiantesGrid.innerHTML = "";
            mostrarMensaje(error.message, "error");
        }
    }

    function actualizarCantidad(cantidad) {
        const elemento = document.querySelector(".cantidad");

        if (elemento) {
            elemento.textContent = cantidad +
                (cantidad === 1
                    ? " estudiante encontrado"
                    : " estudiantes encontrados");
        }
    }

    function obtenerIniciales(nombre, apellido) {
        return (
            (nombre || "").charAt(0) +
            (apellido || "").charAt(0)
        ).toUpperCase();
    }

    function mostrarEstudiantes(lista = estudiantes) {
        if (!estudiantesGrid) return;

        estudiantesGrid.innerHTML = "";

        if (lista.length === 0) {
            estudiantesGrid.innerHTML = `
                <div class="mensaje-aviso">
                    No hay estudiantes que mostrar.
                </div>
            `;

            actualizarCantidad(0);
            return;
        }

        lista.forEach(estudiante => {
            const tarjeta = document.createElement("div");
            tarjeta.className = "estudiante-card";

            tarjeta.innerHTML = `
                <div class="estudiante-avatar">
                    ${escapar(obtenerIniciales(
                        estudiante.nombre,
                        estudiante.apellido
                    ))}
                </div>

                <div class="estudiante-info">
                    <h4>
                        ${escapar(estudiante.nombre)}
                        ${escapar(estudiante.apellido)}
                    </h4>

                    <p><strong>Código:</strong>
                        ${escapar(estudiante.codigo)}</p>

                    <p><strong>Carrera:</strong>
                        ${escapar(convertirCarrera(estudiante.carrera))}</p>

                    <div class="informacion-adicional" style="display:none">
                        <p><strong>DNI:</strong> ${escapar(estudiante.dni)}</p>
                        <p><strong>Correo:</strong> ${escapar(estudiante.correo)}</p>
                        <p><strong>Teléfono:</strong> ${escapar(estudiante.telefono)}</p>
                        <p><strong>Fecha de nacimiento:</strong>
                            ${escapar(estudiante.fechaNacimiento)}</p>
                        <p><strong>Ciclo:</strong> ${escapar(estudiante.ciclo)}</p>
                        <p><strong>Turno:</strong>
                            ${escapar(convertirTurno(estudiante.turno))}</p>
                        <p><strong>Modalidad:</strong>
                            ${escapar(convertirModalidad(estudiante.modalidad))}</p>
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

            const btnInfo = tarjeta.querySelector(".btn-info");
            const informacion = tarjeta.querySelector(
                ".informacion-adicional"
            );

            btnInfo.addEventListener("click", () => {
                const mostrar = informacion.style.display === "none";
                informacion.style.display = mostrar ? "block" : "none";
                btnInfo.textContent = mostrar
                    ? "Ocultar información"
                    : "Más información";
            });

            tarjeta.querySelector(".btn-editar").addEventListener(
                "click",
                () => {
                    window.location.href =
                        "formulario.html?editar=" +
                        encodeURIComponent(estudiante.id);
                }
            );

            tarjeta.querySelector(".btn-eliminar").addEventListener(
                "click",
                () => eliminarEstudiante(estudiante)
            );

            estudiantesGrid.appendChild(tarjeta);
        });

        actualizarCantidad(lista.length);
    }

    async function eliminarEstudiante(estudiante) {
        const confirmar = confirm(
            "¿Estás seguro de que deseas eliminar a " +
            estudiante.nombre + " " + estudiante.apellido + "?"
        );

        if (!confirmar) return;

        try {
            await solicitar(
                API_URL + "/" + encodeURIComponent(estudiante.id),
                { method: "DELETE" }
            );

            mostrarMensaje("Estudiante eliminado correctamente.", "exito");
            await cargarEstudiantes();
        } catch (error) {
            mostrarMensaje(error.message, "error");
        }
    }

    function buscarEstudiantes() {
        if (!estudiantesGrid) return;

        const busqueda = (inputBusqueda?.value || "")
            .trim()
            .toLowerCase();

        const resultados = estudiantes.filter(estudiante => {
            const campos = [
                estudiante.codigo,
                estudiante.nombre,
                estudiante.apellido,
                estudiante.dni,
                estudiante.correo,
                estudiante.telefono
            ];

            return campos.some(campo =>
                String(campo ?? "").toLowerCase().includes(busqueda)
            );
        });

        mostrarEstudiantes(resultados);
    }

    if (inputBusqueda) {
        inputBusqueda.addEventListener("input", buscarEstudiantes);
    }

    if (btnBuscar) {
        btnBuscar.addEventListener("click", buscarEstudiantes);
    }

    // Cargar datos de MySQL al abrir el formulario para editar.
    async function prepararEdicion() {
        if (!formulario || !parametroEditar) return;

        try {
            const todos = await solicitar(API_URL);

            estudianteEditando = todos.find(estudiante =>
                String(estudiante.id) === parametroEditar ||
                String(estudiante.codigo).toLowerCase() ===
                    parametroEditar.toLowerCase()
            );

            if (!estudianteEditando) {
                mostrarMensaje(
                    "No se encontró el estudiante que deseas editar.",
                    "error"
                );
                return;
            }

            const campos = [
                "codigo", "dni", "nombre", "apellido", "correo",
                "telefono", "fechaNacimiento", "carrera", "ciclo",
                "turno", "modalidad"
            ];

            campos.forEach(campo => {
                const elemento = document.getElementById(campo);

                if (elemento) {
                    elemento.value = estudianteEditando[campo] ?? "";
                }
            });

            const titulo = document.querySelector(".section-title h2");
            const boton = formulario.querySelector('button[type="submit"]');

            if (titulo) titulo.textContent = "Editar estudiante";
            if (boton) boton.textContent = "Guardar cambios";

            mostrarMensaje(
                "Editando la información del estudiante.",
                "aviso"
            );
        } catch (error) {
            mostrarMensaje(error.message, "error");
        }
    }

    // Registrar o actualizar el estudiante en el backend.
    if (formulario) {
        formulario.addEventListener("submit", async evento => {
            evento.preventDefault();

            if (!formulario.reportValidity()) return;

            const datos = {
                codigo: document.getElementById("codigo").value.trim(),
                dni: document.getElementById("dni").value.trim(),
                nombre: document.getElementById("nombre").value.trim(),
                apellido: document.getElementById("apellido").value.trim(),
                correo: document.getElementById("correo").value.trim(),
                telefono: document.getElementById("telefono").value.trim(),
                fechaNacimiento:
                    document.getElementById("fechaNacimiento").value,
                carrera: document.getElementById("carrera").value,
                ciclo: document.getElementById("ciclo").value,
                turno: document.getElementById("turno").value,
                modalidad: document.getElementById("modalidad").value
            };

            const boton = formulario.querySelector('button[type="submit"]');
            const textoOriginal = boton?.textContent;

            try {
                if (boton) {
                    boton.disabled = true;
                    boton.textContent = "Guardando...";
                }

                if (estudianteEditando) {
                    await solicitar(
                        API_URL + "/" +
                            encodeURIComponent(estudianteEditando.id),
                        {
                            method: "PUT",
                            body: JSON.stringify(datos)
                        }
                    );

                    alert("Estudiante actualizado correctamente.");
                } else {
                    await solicitar(API_URL, {
                        method: "POST",
                        body: JSON.stringify(datos)
                    });

                    alert("Estudiante registrado correctamente.");
                }

                window.location.href = "estudiantes.html";
            } catch (error) {
                mostrarMensaje(error.message, "error");
            } finally {
                if (boton) {
                    boton.disabled = false;
                    boton.textContent = textoOriginal;
                }
            }
        });

        prepararEdicion();
    }

    if (estudiantesGrid) {
        cargarEstudiantes();
    }
});
