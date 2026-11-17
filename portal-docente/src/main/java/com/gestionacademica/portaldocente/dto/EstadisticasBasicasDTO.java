
package com.gestionacademica.portaldocente.dto;

import java.math.BigDecimal;

public record EstadisticasBasicasDTO(
        long cursosActivos,
        long estudiantesMatriculados,
        long sesionesRegistradas,
        long evaluacionesActivas,
        BigDecimal promedioGeneral
) {
}
