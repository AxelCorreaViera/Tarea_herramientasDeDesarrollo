package com.gestionacademica.portaldocente.service;

import java.math.BigDecimal;

public record ResumenAsistencia(
        int clasesRegistradas,
        int presentes,
        int faltas,
        int faltasJustificadas,
        BigDecimal porcentajeAsistencia) {
}
