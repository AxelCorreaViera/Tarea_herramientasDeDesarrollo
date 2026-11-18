package com.gestionacademica.portaldocente.service;

import com.gestionacademica.portaldocente.dto.EstudianteMatriculadoDTO;
import com.gestionacademica.portaldocente.model.AsignacionDocente;
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
        private final AutorizacionDocenteService autorizacionDocenteService;

        public MatriculaService(
                        MatriculaRepository matriculaRepository,
                        AsignacionDocenteRepository asignacionDocenteRepository,
                        AutorizacionDocenteService autorizacionDocenteService) {
                this.matriculaRepository = matriculaRepository;
                this.asignacionDocenteRepository = asignacionDocenteRepository;
                this.autorizacionDocenteService = autorizacionDocenteService;
        }

        public List<Matricula> listarActivasPorAsignacion(Long asignacionId) {
                autorizacionDocenteService.verificarAsignacion(asignacionId);

                AsignacionDocente asignacion = asignacionDocenteRepository
                                .findById(asignacionId)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "No se encontró la asignación solicitada."));

                if (!asignacion.isActiva()) {
                        throw new IllegalStateException(
                                        "La asignación docente está inactiva.");
                }

                return matriculaRepository
                                .findByAsignacionDocente_IdAndActivaTrue(asignacionId);
        }

        public Matricula buscarPorId(Long matriculaId) {
                if (matriculaId == null) {
                        throw new IllegalArgumentException(
                                        "El identificador de la matrícula es obligatorio.");
                }

                Matricula matricula = matriculaRepository.findById(matriculaId)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "No se encontró la matrícula solicitada."));

                autorizacionDocenteService.verificarAsignacion(
                                matricula.getAsignacionDocente().getId());

                return matricula;
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
