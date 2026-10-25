package com.gestionacademica.portaldocente.dto;

public record AsignacionResumenDTO(
        Long id,
        String codigoCurso,
        String nombreCurso,
        String seccion,
        String periodoAcademico) {
}
