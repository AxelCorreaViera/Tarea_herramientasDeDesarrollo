package com.gestionacademica.portaldocente.dto;

import java.time.Instant;

public record ApiErrorDTO(
        Instant fechaHora,
        int estado,
        String error,
        String mensaje,
        String ruta) {
}
