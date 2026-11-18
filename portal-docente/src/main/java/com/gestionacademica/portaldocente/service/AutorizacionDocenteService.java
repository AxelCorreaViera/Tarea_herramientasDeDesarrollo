
package com.gestionacademica.portaldocente.service;

import com.gestionacademica.portaldocente.model.AsignacionDocente;
import com.gestionacademica.portaldocente.model.Matricula;
import com.gestionacademica.portaldocente.repository.AsignacionDocenteRepository;
import com.gestionacademica.portaldocente.repository.MatriculaRepository;
import com.gestionacademica.portaldocente.security.DocentePrincipal;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AutorizacionDocenteService {

    private final AsignacionDocenteRepository asignacionRepository;
    private final MatriculaRepository matriculaRepository;

    public AutorizacionDocenteService(
            AsignacionDocenteRepository asignacionRepository,
            MatriculaRepository matriculaRepository) {
        this.asignacionRepository = asignacionRepository;
        this.matriculaRepository = matriculaRepository;
    }

    public void verificarAsignacion(Long asignacionId) {

        if (asignacionId == null) {
            throw new IllegalArgumentException(
                    "El identificador de la asignación es obligatorio.");
        }

        DocentePrincipal docente = obtenerDocenteAutenticado();

        AsignacionDocente asignacion = asignacionRepository.findById(asignacionId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No se encontró la asignación solicitada."));

        if (!docente.getId().equals(asignacion.getDocente().getId())) {
            throw new EntityNotFoundException(
                    "No se encontró la asignación solicitada.");
        }
    }

    public void verificarMatricula(Long matriculaId) {

        if (matriculaId == null) {
            throw new IllegalArgumentException(
                    "El identificador de la matrícula es obligatorio.");
        }

        DocentePrincipal docente = obtenerDocenteAutenticado();

        Matricula matricula = matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No se encontró la matrícula solicitada."));

        Long docenteAsignadoId = matricula.getAsignacionDocente()
                .getDocente().getId();

        if (!docente.getId().equals(docenteAsignadoId)) {
            throw new EntityNotFoundException(
                    "No se encontró la matrícula solicitada.");
        }
    }

    private DocentePrincipal obtenerDocenteAutenticado() {

        Authentication autenticacion =
                SecurityContextHolder.getContext().getAuthentication();

        if (autenticacion == null
                || !(autenticacion.getPrincipal() instanceof DocentePrincipal docente)) {
            throw new EntityNotFoundException(
                    "No se encontró el docente autenticado.");
        }

        return docente;
    }
}
