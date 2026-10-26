package com.gestionacademica.portaldocente.dto;

import java.math.BigDecimal;

public record CalificacionDTO(
        Long id,
        Long matriculaId,
        Long actividadEvaluableId,
        String nombreEvaluacion,
        BigDecimal nota) {
}
