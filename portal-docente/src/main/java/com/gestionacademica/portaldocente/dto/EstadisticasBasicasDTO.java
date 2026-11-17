
package com.gestionacademica.portaldocente.dto;

public record EstadisticasBasicasDTO(
        long cursosActivos,
        long estudiantesMatriculados,
        long sesionesRegistradas,
        long evaluacionesActivas
) {
}
