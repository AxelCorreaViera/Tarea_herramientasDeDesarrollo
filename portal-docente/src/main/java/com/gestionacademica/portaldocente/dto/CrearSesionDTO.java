package com.gestionacademica.portaldocente.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CrearSesionDTO(
        @NotNull(message = "La fecha de la sesión es obligatoria.")
        LocalDate fecha,

        @Size(max = 250)
        String descripcion) {
}
