package com.gestionacademica.portaldocente.dto;

import com.gestionacademica.portaldocente.model.EstadoAsistencia;
import jakarta.validation.constraints.NotNull;

public record RegistrarAsistenciaDTO(
        @NotNull(message = "El estado de asistencia es obligatorio.")
        EstadoAsistencia estado) {
}
