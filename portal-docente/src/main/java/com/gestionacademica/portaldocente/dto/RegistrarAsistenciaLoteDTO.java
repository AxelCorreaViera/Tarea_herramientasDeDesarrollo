package com.gestionacademica.portaldocente.dto;

import com.gestionacademica.portaldocente.model.EstadoAsistencia;
import jakarta.validation.constraints.NotNull;

public record RegistrarAsistenciaLoteDTO(
        @NotNull Long matriculaId,
        @NotNull EstadoAsistencia estado) {
}