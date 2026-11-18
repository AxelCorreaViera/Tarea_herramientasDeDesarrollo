
package com.gestionacademica.portaldocente.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CrearSesionDTO(

                @NotNull(message = "La fecha de la sesión es obligatoria.") LocalDate fecha,

                @NotNull(message = "La hora de inicio es obligatoria.") LocalTime horaInicio,

                @NotNull(message = "La hora de fin es obligatoria.") LocalTime horaFin,

                @Size(max = 250, message = "La descripción no puede superar los 250 caracteres.") String descripcion

) {
}
