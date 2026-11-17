
package com.gestionacademica.portaldocente.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import com.gestionacademica.portaldocente.dto.EstadisticasBasicasDTO;
import com.gestionacademica.portaldocente.model.Matricula;
import com.gestionacademica.portaldocente.repository.AsignacionDocenteRepository;
import com.gestionacademica.portaldocente.repository.DocenteRepository;
import com.gestionacademica.portaldocente.repository.MatriculaRepository;
import com.gestionacademica.portaldocente.repository.SesionClaseRepository;
import com.gestionacademica.portaldocente.repository.ActividadEvaluableRepository;
import com.gestionacademica.portaldocente.model.EstadoAsistencia;
import com.gestionacademica.portaldocente.repository.AsistenciaRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class EstadisticasGeneralesService {

    private final DocenteRepository docenteRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final AsignacionDocenteRepository asignacionRepository;
    private final MatriculaRepository matriculaRepository;
    private final SesionClaseRepository sesionClaseRepository;
    private final ActividadEvaluableRepository actividadEvaluableRepository;
    private final CalificacionService calificacionService;

    public EstadisticasGeneralesService(
        AsistenciaRepository asistenciaRepository,
            DocenteRepository docenteRepository,
            AsignacionDocenteRepository asignacionRepository,
            MatriculaRepository matriculaRepository,
            SesionClaseRepository sesionClaseRepository,
            ActividadEvaluableRepository actividadEvaluableRepository,
            CalificacionService calificacionService) {

        this.docenteRepository = docenteRepository;
        this.asistenciaRepository = asistenciaRepository;
        this.asignacionRepository = asignacionRepository;
        this.matriculaRepository = matriculaRepository;
        this.sesionClaseRepository = sesionClaseRepository;
        this.actividadEvaluableRepository = actividadEvaluableRepository;
        this.calificacionService = calificacionService;
    }

    public EstadisticasBasicasDTO obtenerEstadisticas(Long docenteId) {

        docenteRepository.findById(docenteId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No existe el docente con ID " + docenteId));

        long cursosActivos =
                asignacionRepository.countByDocente_IdAndActivaTrue(docenteId);

        long estudiantesMatriculados =
                matriculaRepository.contarEstudiantesUnicosPorDocente(docenteId);

        long sesionesRegistradas =
                sesionClaseRepository
                        .countByAsignacionDocente_Docente_IdAndAsignacionDocente_ActivaTrue(
                                docenteId);

        long evaluacionesActivas =
                actividadEvaluableRepository
                        .countByAsignacionDocente_Docente_IdAndAsignacionDocente_ActivaTrueAndActivaTrue(
                                docenteId);

        BigDecimal promedioGeneral = calcularPromedioGeneral(docenteId);

        BigDecimal porcentajeAsistencia =
        calcularPorcentajeAsistencia(docenteId);

        return new EstadisticasBasicasDTO(
                cursosActivos,
                estudiantesMatriculados,
                sesionesRegistradas,
                evaluacionesActivas,
                promedioGeneral,
                porcentajeAsistencia
        );
    }

    private BigDecimal calcularPromedioGeneral(Long docenteId) {

        List<Matricula> matriculas =
                matriculaRepository
                        .findByAsignacionDocente_Docente_IdAndAsignacionDocente_ActivaTrueAndActivaTrue(
                                docenteId);

        BigDecimal sumaPromedios = BigDecimal.ZERO;
        int cantidadPromedios = 0;

        for (Matricula matricula : matriculas) {

            try {
                ResultadoPromedio resultado =
                        calificacionService.calcularPromedioPonderado(
                                matricula.getId());

                if (resultado.promedio() != null) {
                    sumaPromedios = sumaPromedios.add(resultado.promedio());
                    cantidadPromedios++;
                }

            } catch (IllegalStateException e) {
    
            }
        }

        if (cantidadPromedios == 0) {
            return null;
        }

        return sumaPromedios.divide(
                BigDecimal.valueOf(cantidadPromedios),
                2,
                RoundingMode.HALF_UP
        );
    }

    private BigDecimal calcularPorcentajeAsistencia(Long docenteId) {

        long totalAsistencias =
                asistenciaRepository.contarAsistenciasDeDocente(docenteId);
    
        if (totalAsistencias == 0) {
            return null;
        }
    
        long presentes =
                asistenciaRepository.contarAsistenciasPorEstadoDeDocente(
                        docenteId,
                        EstadoAsistencia.PRESENTE
                );
    
        return BigDecimal.valueOf(presentes)
                .multiply(BigDecimal.valueOf(100))
                .divide(
                        BigDecimal.valueOf(totalAsistencias),
                        2,
                        RoundingMode.HALF_UP
                );
    }
}
