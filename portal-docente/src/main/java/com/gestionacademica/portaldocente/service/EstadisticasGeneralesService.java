
package com.gestionacademica.portaldocente.service;

import com.gestionacademica.portaldocente.dto.EstadisticasBasicasDTO;
import com.gestionacademica.portaldocente.repository.AsignacionDocenteRepository;
import com.gestionacademica.portaldocente.repository.DocenteRepository;
import com.gestionacademica.portaldocente.repository.MatriculaRepository;
import com.gestionacademica.portaldocente.repository.SesionClaseRepository;
import com.gestionacademica.portaldocente.repository.ActividadEvaluableRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class EstadisticasGeneralesService {

    private final DocenteRepository docenteRepository;
    private final AsignacionDocenteRepository asignacionRepository;
    private final MatriculaRepository matriculaRepository;
    private final SesionClaseRepository sesionClaseRepository;
    private final ActividadEvaluableRepository actividadEvaluableRepository;

    public EstadisticasGeneralesService(
            DocenteRepository docenteRepository,
            AsignacionDocenteRepository asignacionRepository,
            MatriculaRepository matriculaRepository,
            SesionClaseRepository sesionClaseRepository,
            ActividadEvaluableRepository actividadEvaluableRepository) {

        this.docenteRepository = docenteRepository;
        this.asignacionRepository = asignacionRepository;
        this.matriculaRepository = matriculaRepository;
        this.sesionClaseRepository = sesionClaseRepository;
        this.actividadEvaluableRepository = actividadEvaluableRepository;
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

        return new EstadisticasBasicasDTO(
                cursosActivos,
                estudiantesMatriculados,
                sesionesRegistradas,
                evaluacionesActivas
        );
    }
}
