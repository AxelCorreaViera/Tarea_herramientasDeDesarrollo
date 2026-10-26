package com.gestionacademica.portaldocente.service;

import java.math.BigDecimal;

public record ResultadoPromedio(
        BigDecimal promedio,
        boolean definitivo,
        int evaluacionesCalificadas,
        int evaluacionesTotales,
        BigDecimal porcentajeEvaluado) {
}
