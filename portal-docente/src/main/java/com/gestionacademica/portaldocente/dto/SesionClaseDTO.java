package com.gestionacademica.portaldocente.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record SesionClaseDTO(
        Long id,
        Long asignacionId,
        LocalDate fecha,
        String diaSemana,
        LocalTime horaInicio,
        LocalTime horaFin,
        long duracionMinutos,
        String descripcion
) {
}
