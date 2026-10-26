package com.gestionacademica.portaldocente.service;

import com.gestionacademica.portaldocente.model.AsignacionDocente;
import com.gestionacademica.portaldocente.dto.EstudianteMatriculadoDTO;
import com.gestionacademica.portaldocente.model.Matricula;
import com.gestionacademica.portaldocente.repository.AsignacionDocenteRepository;
import com.gestionacademica.portaldocente.repository.MatriculaRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class MatriculaService {

    private final MatriculaRepository matriculaRepository;
    private final AsignacionDocenteRepository asignacionDocenteRepository;

    public MatriculaService(
            MatriculaRepository matriculaRepository,
            AsignacionDocenteRepository asignacionDocenteRepository) {
        this.matriculaRepository = matriculaRepository;
        this.asignacionDocenteRepository = asignacionDocenteRepository;
    }

    public List<Matricula> listarActivasPorAsignacion(Long asignacionId) {
        if (asignacionId == null) {
            throw new IllegalArgumentException(
                    "El identificador de la asignación es obligatorio.");
        }

        AsignacionDocente asignacion = asignacionDocenteRepository
                .findById(asignacionId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No existe la asignación con ID " + asignacionId));

        if (!asignacion.isActiva()) {
            throw new IllegalStateException(
                    "No se pueden consultar matrículas de una asignación inactiva.");
        }

        return matriculaRepository
                .findByAsignacionDocente_IdAndActivaTrue(asignacionId);
    }

    public Matricula buscarPorId(Long matriculaId) {
        if (matriculaId == null) {
            throw new IllegalArgumentException(
                    "El identificador de la matrícula es obligatorio.");
        }

        return matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No existe la matrícula con ID " + matriculaId));
    }

    public List<EstudianteMatriculadoDTO> listarEstudiantesPorAsignacion(
            Long asignacionId) {

        return listarActivasPorAsignacion(asignacionId)
                .stream()
                .map(matricula -> new EstudianteMatriculadoDTO(
                        matricula.getId(),
                        matricula.getEstudiante().getId(),
                        matricula.getEstudiante().getCodigoEstudiante(),
                        matricula.getEstudiante().getNombres(),
                        matricula.getEstudiante().getApellidos(),
                        matricula.getEstudiante().getCorreo()))
                .toList();
    }

}