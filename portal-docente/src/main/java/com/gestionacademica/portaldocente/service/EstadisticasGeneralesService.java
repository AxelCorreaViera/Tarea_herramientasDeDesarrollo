
package com.gestionacademica.portaldocente.service;

import com.gestionacademica.portaldocente.dto.EstadisticasBasicasDTO;
import com.gestionacademica.portaldocente.repository.AsignacionDocenteRepository;
import com.gestionacademica.portaldocente.repository.DocenteRepository;
import com.gestionacademica.portaldocente.repository.MatriculaRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class EstadisticasGeneralesService {

    private final DocenteRepository docenteRepository;
    private final AsignacionDocenteRepository asignacionRepository;
    private final MatriculaRepository matriculaRepository;

    public EstadisticasGeneralesService(
            DocenteRepository docenteRepository,
            AsignacionDocenteRepository asignacionRepository,
            MatriculaRepository matriculaRepository) {

        this.docenteRepository = docenteRepository;
        this.asignacionRepository = asignacionRepository;
        this.matriculaRepository = matriculaRepository;
    }

    public EstadisticasBasicasDTO obtenerEstadisticas(Long docenteId) {

        docenteRepository.findById(docenteId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No existe el docente con ID " + docenteId));

        long cursosActivos =
                asignacionRepository.countByDocente_IdAndActivaTrue(docenteId);

        long estudiantesMatriculados =
                matriculaRepository.contarEstudiantesUnicosPorDocente(docenteId);

        return new EstadisticasBasicasDTO(
                cursosActivos,
                estudiantesMatriculados
        );
    }
}
