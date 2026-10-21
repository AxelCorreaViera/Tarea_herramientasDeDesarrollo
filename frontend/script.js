
const API_ESTUDIANTES = "http://localhost:8080/api/estudiantes";

document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formularioEstudiante");

    if (formulario) {
        iniciarFormulario(formulario);
    }

    const contenedor = document.querySelector(".estudiantes-grid");

    if (contenedor) {
        iniciarListaEstudiantes();
    }
});

// ================================
// REGISTRO DE ESTUDIANTES
// ================================

function iniciarFormulario(formulario) {
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        if (!formulario.reportValidity()) {
            return;
        }

        const estudiante = {
            codigo: document.getElementById("codigo").value.trim(),
            dni: document.getElementById("dni").value.trim(),
            nombre: document.getElementById("nombre").value.trim(),
            apellido: document.getElementById("apellido").value.trim(),
            correo: document.getElementById("correo").value.trim(),
            telefono: document.getElementById("telefono").value.trim(),
            fechaNacimiento: document.getElementById("fechaNacimiento").value,
            carrera: document.getElementById("carrera").value,
            ciclo: document.getElementById("ciclo").value,
            turno: document.getElementById("turno").value,
            modalidad: document.getElementById("modalidad").value
        };

        try {
            const respuesta = await fetch(API_ESTUDIANTES, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(estudiante)
            });

            const resultado = await respuesta.json().catch(() => null);

            if (!respuesta.ok) {
                throw new Error(
                    resultado?.mensaje ||
                    resultado?.message ||
                    "No se pudo registrar al estudiante."
                );
            }

            alert("Estudiante registrado correctamente en la base de datos.");

            formulario.reset();

            window.location.href = "estudiantes.html";

        } catch (error) {
            console.error("Error al registrar estudiante:", error);

            alert(
                "No se pudo registrar al estudiante.\n\n" +
                (error.message.includes("Failed to fetch")
                    ? "Verifica que Spring Boot esté ejecutándose y que el servidor permita la conexión."
                    : error.message)
            );
        }
    });
}

// ================================
// LISTA Y BÚSQUEDA DE ESTUDIANTES
// ================================

let estudiantesCargados = [];

function iniciarListaEstudiantes() {
    const campoBusqueda = document.getElementById("codigoBusqueda");
    const botonBuscar = document.getElementById("btnBuscar");

    if (campoBusqueda) {
        campoBusqueda.addEventListener("input", mostrarResultados);
    }

    if (botonBuscar) {
        botonBuscar.addEventListener("click", mostrarResultados);
    }

    cargarEstudiantes();
}

async function cargarEstudiantes() {
    const contenedor = document.querySelector(".estudiantes-grid");

    contenedor.innerHTML = "<p>Cargando estudiantes...</p>";

    try {
        const respuesta = await fetch(API_ESTUDIANTES);

        if (!respuesta.ok) {
            throw new Error("No se pudo obtener la lista de estudiantes.");
        }

        estudiantesCargados = await respuesta.json();
        mostrarResultados();

    } catch (error) {
        console.error("Error al cargar estudiantes:", error);

        contenedor.innerHTML =
            "<p>No se pudieron cargar los estudiantes. " +
            "Verifica que el backend esté funcionando.</p>";

        actualizarCantidad(0);
    }
}

function mostrarResultados() {
    const contenedor = document.querySelector(".estudiantes-grid");
    const campoBusqueda = document.getElementById("codigoBusqueda");

    if (!contenedor) return;

    const busqueda = campoBusqueda
        ? campoBusqueda.value.trim().toLowerCase()
        : "";

    const resultados = estudiantesCargados.filter((estudiante) => {
        const texto = [
            estudiante.codigo,
            estudiante.nombre,
            estudiante.apellido,
            estudiante.dni,
            estudiante.correo,
            estudiante.telefono
        ].join(" ").toLowerCase();

        return texto.includes(busqueda);
    });

    actualizarCantidad(resultados.length);

    if (resultados.length === 0) {
        contenedor.innerHTML =
            "<p>No se encontraron estudiantes registrados.</p>";
        return;
    }

    contenedor.innerHTML = resultados.map((estudiante) => `
        <article class="estudiante-card">
            <h3>${escaparHTML(estudiante.nombre)} ${escaparHTML(estudiante.apellido)}</h3>

            <p><strong>Código:</strong> ${escaparHTML(estudiante.codigo)}</p>
            <p><strong>DNI:</strong> ${escaparHTML(estudiante.dni)}</p>
            <p><strong>Correo:</strong> ${escaparHTML(estudiante.correo)}</p>
            <p><strong>Teléfono:</strong> ${escaparHTML(estudiante.telefono)}</p>
            <p><strong>Carrera:</strong> ${escaparHTML(estudiante.carrera)}</p>
            <p><strong>Ciclo:</strong> ${escaparHTML(estudiante.ciclo)}</p>
            <p><strong>Turno:</strong> ${escaparHTML(estudiante.turno)}</p>
            <p><strong>Modalidad:</strong> ${escaparHTML(estudiante.modalidad)}</p>

            <div class="acciones-estudiante">
                <button type="button" class="btn btn-editar"
                    data-accion="editar" data-id="${estudiante.id}">
                    Editar
                </button>

                <button type="button" class="btn btn-eliminar"
                    data-accion="eliminar" data-id="${estudiante.id}">
                    Eliminar
                </button>
            </div>
        </article>
    `).join("");
    
    contenedor.querySelectorAll("button[data-accion]").forEach((boton) => {
        boton.addEventListener("click", () => {
            const id = Number(boton.dataset.id);

            if (boton.dataset.accion === "eliminar") {
                eliminarEstudiante(id);
            } else if (boton.dataset.accion === "editar") {
                editarEstudiante(id);
            }
        });
    });
}

function actualizarCantidad(cantidad) {
    const elemento = document.querySelector(".cantidad");

    if (elemento) {
        elemento.textContent =
            `${cantidad} ${cantidad === 1 ? "estudiante encontrado" : "estudiantes encontrados"}`;
    }
}

// ================================
// ELIMINAR ESTUDIANTE
// ================================

async function eliminarEstudiante(id) {
    const estudiante = estudiantesCargados.find((e) => e.id === id);

    if (!estudiante) {
        alert("No se encontró el estudiante.");
        return;
    }

    const confirmar = confirm(
        `¿Seguro que deseas eliminar a ${estudiante.nombre} ${estudiante.apellido}?`
    );

    if (!confirmar) return;

    try {
        const respuesta = await fetch(`${API_ESTUDIANTES}/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo eliminar al estudiante.");
        }

        alert("Estudiante eliminado correctamente.");
        await cargarEstudiantes();

    } catch (error) {
        console.error("Error al eliminar:", error);
        alert(error.message);
    }
}

// ================================
// EDITAR ESTUDIANTE
// ================================

function editarEstudiante(id) {
    const estudiante = estudiantesCargados.find((e) => e.id === id);

    if (!estudiante) {
        alert("No se encontró el estudiante.");
        return;
    }

    const nombre = prompt("Nombre:", estudiante.nombre);
    if (nombre === null) return;

    const apellido = prompt("Apellido:", estudiante.apellido);
    if (apellido === null) return;

    const correo = prompt("Correo electrónico:", estudiante.correo || "");
    if (correo === null) return;

    const telefono = prompt("Teléfono:", estudiante.telefono || "");
    if (telefono === null) return;

    const datos = {
        ...estudiante,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: correo.trim(),
        telefono: telefono.trim()
    };

    guardarEdicion(id, datos);
}

async function guardarEdicion(id, datos) {
    if (!datos.nombre || !datos.apellido) {
        alert("El nombre y el apellido son obligatorios.");
        return;
    }

    try {
        const respuesta = await fetch(`${API_ESTUDIANTES}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
            throw new Error(
                resultado?.mensaje ||
                resultado?.message ||
                "No se pudo actualizar al estudiante."
            );
        }

        alert("Estudiante actualizado correctamente.");
        await cargarEstudiantes();

    } catch (error) {
        console.error("Error al actualizar:", error);
        alert(error.message);
    }
}


function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, (caracter) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);
}
