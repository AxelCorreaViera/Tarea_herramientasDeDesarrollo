package com.gestionacademica.portaldocente.service;

import com.gestionacademica.portaldocente.model.ActividadEvaluable;
import com.gestionacademica.portaldocente.model.Calificacion;
import com.gestionacademica.portaldocente.model.Matricula;
import com.gestionacademica.portaldocente.repository.ActividadEvaluableRepository;
import com.gestionacademica.portaldocente.repository.CalificacionRepository;
import com.gestionacademica.portaldocente.repository.MatriculaRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CalificacionService {

    private static final BigDecimal CERO = new BigDecimal("0.00");
    private static final BigDecimal VEINTE = new BigDecimal("20.00");
    private static final BigDecimal CIEN = new BigDecimal("100.00");

    private final CalificacionRepository calificacionRepository;
    private final MatriculaRepository matriculaRepository;
    private final ActividadEvaluableRepository actividadRepository;

    public CalificacionService(
            CalificacionRepository calificacionRepository,
            MatriculaRepository matriculaRepository,
            ActividadEvaluableRepository actividadRepository) {
        this.calificacionRepository = calificacionRepository;
        this.matriculaRepository = matriculaRepository;
        this.actividadRepository = actividadRepository;
    }

    @Transactional
    public Calificacion registrarOActualizar(
            Long matriculaId,
            Long actividadId,
            BigDecimal nota) {

        validarNota(nota);

        Matricula matricula = matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No existe la matrícula con ID " + matriculaId));

        ActividadEvaluable actividad = actividadRepository
                .findById(actividadId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No existe la evaluación con ID " + actividadId));

        if (!matricula.isActiva()) {
            throw new IllegalStateException(
                    "No se puede calificar una matrícula inactiva.");
        }

        if (!actividad.isActiva()) {
            throw new IllegalStateException(
                    "No se puede calificar una evaluación inactiva.");
        }

        Long asignacionMatriculaId =
                matricula.getAsignacionDocente().getId();

        Long asignacionActividadId =
                actividad.getAsignacionDocente().getId();

        if (!asignacionMatriculaId.equals(asignacionActividadId)) {
            throw new IllegalArgumentException(
                    "La matrícula y la evaluación pertenecen "
                            + "a asignaciones docentes diferentes.");
        }

        Calificacion calificacion = calificacionRepository
                .findByMatricula_IdAndActividadEvaluable_Id(
                        matriculaId, actividadId)
                .orElseGet(Calificacion::new);

        calificacion.setMatricula(matricula);
        calificacion.setActividadEvaluable(actividad);
        calificacion.setNota(nota);

        return calificacionRepository.save(calificacion);
    }

    public List<Calificacion> listarPorMatricula(Long matriculaId) {
        if (matriculaId == null) {
            throw new IllegalArgumentException(
                    "El identificador de la matrícula es obligatorio.");
        }

        if (!matriculaRepository.existsById(matriculaId)) {
            throw new EntityNotFoundException(
                    "No existe la matrícula con ID " + matriculaId);
        }

        return calificacionRepository.findByMatricula_Id(matriculaId);
    }

    public ResultadoPromedio calcularPromedioPonderado(Long matriculaId) {
        if (matriculaId == null) {
            throw new IllegalArgumentException(
                    "El identificador de la matrícula es obligatorio.");
        }

        Matricula matricula = matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No existe la matrícula con ID " + matriculaId));

        Long asignacionId =
                matricula.getAsignacionDocente().getId();

        List<ActividadEvaluable> actividades = actividadRepository
                .findByAsignacionDocente_IdAndActivaTrueOrderByOrdenAsc(
                        asignacionId);

        if (actividades.isEmpty()) {
            throw new IllegalStateException(
                    "La asignación no tiene evaluaciones activas.");
        }

        BigDecimal sumaPorcentajes = actividades.stream()
                .map(ActividadEvaluable::getPorcentaje)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (sumaPorcentajes.compareTo(CIEN) != 0) {
            throw new IllegalStateException(
                    "Las ponderaciones activas deben sumar 100 %. "
                            + "Suma actual: " + sumaPorcentajes + " %.");
        }

        BigDecimal puntosPonderados = BigDecimal.ZERO;
        BigDecimal porcentajeEvaluado = BigDecimal.ZERO;
        int evaluacionesCalificadas = 0;

        for (ActividadEvaluable actividad : actividades) {
            var calificacion = calificacionRepository
                    .findByMatricula_IdAndActividadEvaluable_Id(
                            matriculaId, actividad.getId());

            if (calificacion.isPresent()) {
                BigDecimal nota = calificacion.get().getNota();

                puntosPonderados = puntosPonderados.add(
                        nota.multiply(actividad.getPorcentaje())
                                .divide(CIEN, 4, RoundingMode.HALF_UP));

                porcentajeEvaluado = porcentajeEvaluado.add(
                        actividad.getPorcentaje());

                evaluacionesCalificadas++;
            }
        }

        if (evaluacionesCalificadas == 0) {
            return new ResultadoPromedio(
                    null,
                    false,
                    0,
                    actividades.size(),
                    CERO);
        }

        boolean definitivo =
                evaluacionesCalificadas == actividades.size();

        BigDecimal promedio = puntosPonderados
                .multiply(CIEN)
                .divide(porcentajeEvaluado, 2, RoundingMode.HALF_UP);

        return new ResultadoPromedio(
                promedio,
                definitivo,
                evaluacionesCalificadas,
                actividades.size(),
                porcentajeEvaluado.setScale(2, RoundingMode.HALF_UP));
    }

    private void validarNota(BigDecimal nota) {
        if (nota == null
                || nota.compareTo(CERO) < 0
                || nota.compareTo(VEINTE) > 0) {
            throw new IllegalArgumentException(
                    "La nota debe estar entre 0 y 20.");
        }
    }
}
