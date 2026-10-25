package com.gestionacademica.portaldocente.dto;

public record EstudianteMatriculadoDTO(
        Long matriculaId,
        Long estudianteId,
        String codigoEstudiante,
        String nombres,
        String apellidos,
        String correo) {
}
