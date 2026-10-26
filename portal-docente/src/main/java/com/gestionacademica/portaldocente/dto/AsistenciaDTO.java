package com.gestionacademica.portaldocente.dto;

import com.gestionacademica.portaldocente.model.EstadoAsistencia;
import java.time.LocalDate;

public record AsistenciaDTO(
        Long id,
        Long matriculaId,
        Long sesionId,
        LocalDate fecha,
        String descripcionSesion,
        EstadoAsistencia estado) {
}
