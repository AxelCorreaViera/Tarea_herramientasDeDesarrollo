package com.gestionacademica.portaldocente.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record RegistrarCalificacionDTO(
        @NotNull(message = "La nota es obligatoria.")
        @DecimalMin(value = "0.00", message = "La nota mínima es 0.")
        @DecimalMax(value = "20.00", message = "La nota máxima es 20.")
        BigDecimal nota) {
}
