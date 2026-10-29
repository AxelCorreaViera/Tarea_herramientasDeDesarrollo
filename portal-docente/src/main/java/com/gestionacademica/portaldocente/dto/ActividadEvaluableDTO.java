package com.gestionacademica.portaldocente.dto;

import java.math.BigDecimal;

public record ActividadEvaluableDTO(
        Long id,
        String nombre,
        String tipo,
        BigDecimal porcentaje,
        Integer orden) {
}
