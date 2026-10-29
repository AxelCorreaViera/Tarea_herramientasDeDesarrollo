package com.gestionacademica.portaldocente.service;

import com.gestionacademica.portaldocente.dto.CrearSesionDTO;
import com.gestionacademica.portaldocente.dto.SesionClaseDTO;
import com.gestionacademica.portaldocente.model.AsignacionDocente;
import com.gestionacademica.portaldocente.model.SesionClase;
import com.gestionacademica.portaldocente.repository.AsignacionDocenteRepository;
import com.gestionacademica.portaldocente.repository.SesionClaseRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SesionClaseService {

    private final SesionClaseRepository sesionRepository;
    private final AsignacionDocenteRepository asignacionRepository;

    public SesionClaseService(
            SesionClaseRepository sesionRepository,
            AsignacionDocenteRepository asignacionRepository) {
        this.sesionRepository = sesionRepository;
        this.asignacionRepository = asignacionRepository;
    }

    public List<SesionClaseDTO> listarPorAsignacion(Long asignacionId) {
        verificarAsignacion(asignacionId);

        return sesionRepository
                .findByAsignacionDocente_IdOrderByFechaAsc(asignacionId)
                .stream()
                .map(this::convertirDTO)
                .toList();
    }

    @Transactional
    public SesionClaseDTO crear(
            Long asignacionId,
            CrearSesionDTO datos) {

        if (datos == null || datos.fecha() == null) {
            throw new IllegalArgumentException(
                    "La fecha de la sesión es obligatoria.");
        }

        AsignacionDocente asignacion =
                verificarAsignacion(asignacionId);

        if (!asignacion.isActiva()) {
            throw new IllegalStateException(
                    "No se pueden crear sesiones para una asignación inactiva.");
        }

        SesionClase sesion = new SesionClase();
        sesion.setFecha(datos.fecha());
        sesion.setDescripcion(datos.descripcion());
        sesion.setAsignacionDocente(asignacion);

        return convertirDTO(sesionRepository.save(sesion));
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

    private SesionClaseDTO convertirDTO(SesionClase sesion) {
        return new SesionClaseDTO(
                sesion.getId(),
                sesion.getAsignacionDocente().getId(),
                sesion.getFecha(),
                sesion.getDescripcion());
    }
}
