package com.gestionacademica.portaldocente.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CrearActividadEvaluableDTO(
        @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 120)
        String nombre,

        @Size(max = 60)
        String tipo,

        @NotNull
        @DecimalMin("0.01")
        @DecimalMax("100.00")
        BigDecimal porcentaje,

        @NotNull
        @Positive
        Integer orden) {
}
