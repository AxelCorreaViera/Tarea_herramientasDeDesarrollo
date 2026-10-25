package com.gestionacademica.portaldocente.service;

import com.gestionacademica.portaldocente.model.AsignacionDocente;
import com.gestionacademica.portaldocente.repository.AsignacionDocenteRepository;
import com.gestionacademica.portaldocente.repository.DocenteRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AsignacionDocenteService {

    private final AsignacionDocenteRepository asignacionDocenteRepository;
    private final DocenteRepository docenteRepository;

    public AsignacionDocenteService(
            AsignacionDocenteRepository asignacionDocenteRepository,
            DocenteRepository docenteRepository) {
        this.asignacionDocenteRepository = asignacionDocenteRepository;
        this.docenteRepository = docenteRepository;
    }

    public List<AsignacionDocente> listarActivasPorDocente(Long docenteId) {
        if (docenteId == null) {
            throw new IllegalArgumentException(
                    "El identificador del docente es obligatorio.");
        }

        docenteRepository.findById(docenteId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No existe el docente con ID " + docenteId));

        return asignacionDocenteRepository
                .findByDocente_IdAndActivaTrue(docenteId);
    }

    public AsignacionDocente buscarPorId(Long asignacionId) {
        if (asignacionId == null) {
            throw new IllegalArgumentException(
                    "El identificador de la asignación es obligatorio.");
        }

        return asignacionDocenteRepository.findById(asignacionId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No existe la asignación con ID " + asignacionId));
    }
}
