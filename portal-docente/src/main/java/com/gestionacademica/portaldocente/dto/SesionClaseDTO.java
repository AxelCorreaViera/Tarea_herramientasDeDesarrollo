package com.gestionacademica.portaldocente.dto;

import java.time.LocalDate;

public record SesionClaseDTO(
        Long id,
        Long asignacionId,
        LocalDate fecha,
        String descripcion) {
}
