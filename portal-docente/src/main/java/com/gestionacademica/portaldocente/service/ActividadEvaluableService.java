package com.gestionacademica.portaldocente.service;

import com.gestionacademica.portaldocente.model.ActividadEvaluable;
import com.gestionacademica.portaldocente.model.AsignacionDocente;
import com.gestionacademica.portaldocente.repository.ActividadEvaluableRepository;
import com.gestionacademica.portaldocente.repository.AsignacionDocenteRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ActividadEvaluableService {

    private static final BigDecimal CIEN = new BigDecimal("100.00");

    private final ActividadEvaluableRepository actividadRepository;
    private final AsignacionDocenteRepository asignacionRepository;

    public ActividadEvaluableService(
            ActividadEvaluableRepository actividadRepository,
            AsignacionDocenteRepository asignacionRepository) {
        this.actividadRepository = actividadRepository;
        this.asignacionRepository = asignacionRepository;
    }

    public List<ActividadEvaluable> listarActivasPorAsignacion(
            Long asignacionId) {

        verificarAsignacion(asignacionId);

        return actividadRepository
                .findByAsignacionDocente_IdAndActivaTrueOrderByOrdenAsc(
                        asignacionId);
    }

    public ActividadEvaluable buscarPorId(Long actividadId) {
        if (actividadId == null) {
            throw new IllegalArgumentException(
                    "El identificador de la evaluación es obligatorio.");
        }

        return actividadRepository.findById(actividadId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No existe la evaluación con ID " + actividadId));
    }

    @Transactional
    public ActividadEvaluable crear(ActividadEvaluable actividad) {
        validarDatos(actividad);

        Long asignacionId = actividad.getAsignacionDocente().getId();
        AsignacionDocente asignacion = verificarAsignacion(asignacionId);

        if (!asignacion.isActiva()) {
            throw new IllegalStateException(
                    "No se pueden crear evaluaciones en una asignación inactiva.");
        }

        actividad.setId(null);
        actividad.setAsignacionDocente(asignacion);

        validarSumaMaxima(asignacionId, actividad.getPorcentaje(), null);

        return actividadRepository.save(actividad);
    }

    @Transactional
    public ActividadEvaluable actualizar(
            Long actividadId,
            ActividadEvaluable datos) {

        if (actividadId == null) {
            throw new IllegalArgumentException(
                    "El identificador de la evaluación es obligatorio.");
        }

        validarDatos(datos);

        ActividadEvaluable existente = buscarPorId(actividadId);

        if (!existente.isActiva()) {
            throw new IllegalStateException(
                    "No se puede actualizar una evaluación inactiva.");
        }

        Long asignacionOriginalId =
                existente.getAsignacionDocente().getId();

        Long asignacionNuevaId =
                datos.getAsignacionDocente().getId();

        if (!asignacionOriginalId.equals(asignacionNuevaId)) {
            throw new IllegalArgumentException(
                    "No se puede trasladar una evaluación a otra asignación.");
        }

        AsignacionDocente asignacion =
                verificarAsignacion(asignacionOriginalId);

        if (!asignacion.isActiva()) {
            throw new IllegalStateException(
                    "No se puede modificar una asignación inactiva.");
        }

        validarSumaMaxima(
                asignacionOriginalId,
                datos.getPorcentaje(),
                actividadId);

        existente.setNombre(datos.getNombre());
        existente.setTipo(datos.getTipo());
        existente.setPorcentaje(datos.getPorcentaje());
        existente.setOrden(datos.getOrden());

        return actividadRepository.save(existente);
    }

    public void validarPonderaciones(Long asignacionId) {
        List<ActividadEvaluable> actividades =
                listarActivasPorAsignacion(asignacionId);

        if (actividades.isEmpty()) {
            throw new IllegalStateException(
                    "La asignación todavía no tiene evaluaciones activas.");
        }

        BigDecimal suma = actividades.stream()
                .map(ActividadEvaluable::getPorcentaje)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (suma.compareTo(CIEN) != 0) {
            throw new IllegalStateException(
                    "Las ponderaciones deben sumar 100 %. Suma actual: "
                            + suma.toPlainString() + " %.");
        }
    }

    private void validarSumaMaxima(
            Long asignacionId,
            BigDecimal nuevoPorcentaje,
            Long actividadExcluidaId) {

        List<ActividadEvaluable> existentes =
                actividadRepository
                        .findByAsignacionDocente_IdAndActivaTrueOrderByOrdenAsc(
                                asignacionId);

        BigDecimal suma = existentes.stream()
                .filter(a -> actividadExcluidaId == null
                        || !a.getId().equals(actividadExcluidaId))
                .map(ActividadEvaluable::getPorcentaje)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        suma = suma.add(nuevoPorcentaje);

        if (suma.compareTo(CIEN) > 0) {
            throw new IllegalArgumentException(
                    "La suma de las ponderaciones no puede superar el 100 %. "
                            + "Suma resultante: " + suma.toPlainString() + " %.");
        }
    }

    private void validarDatos(ActividadEvaluable actividad) {
        if (actividad == null) {
            throw new IllegalArgumentException(
                    "Los datos de la evaluación son obligatorios.");
        }

        if (actividad.getNombre() == null
                || actividad.getNombre().isBlank()) {
            throw new IllegalArgumentException(
                    "El nombre de la evaluación es obligatorio.");
        }

        if (actividad.getPorcentaje() == null
                || actividad.getPorcentaje().compareTo(
                        new BigDecimal("0.01")) < 0
                || actividad.getPorcentaje().compareTo(CIEN) > 0) {
            throw new IllegalArgumentException(
                    "La ponderación debe estar entre 0.01 % y 100 %.");
        }

        if (actividad.getOrden() == null || actividad.getOrden() <= 0) {
            throw new IllegalArgumentException(
                    "El orden debe ser un número positivo.");
        }

        if (actividad.getAsignacionDocente() == null
                || actividad.getAsignacionDocente().getId() == null) {
            throw new IllegalArgumentException(
                    "Debe especificarse una asignación docente.");
        }
    }

    private AsignacionDocente verificarAsignacion(Long asignacionId) {
        if (asignacionId == null) {
            throw new IllegalArgumentException(
                    "El identificador de la asignación es obligatorio.");
        }

        return asignacionRepository.findById(asignacionId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No existe la asignación con ID " + asignacionId));
    }
}
