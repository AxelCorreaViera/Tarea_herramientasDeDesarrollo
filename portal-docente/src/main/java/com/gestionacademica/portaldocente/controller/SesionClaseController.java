package com.gestionacademica.portaldocente.controller;

import com.gestionacademica.portaldocente.dto.CrearSesionDTO;
import com.gestionacademica.portaldocente.dto.SesionClaseDTO;
import com.gestionacademica.portaldocente.service.SesionClaseService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/asignaciones")
public class SesionClaseController {

    private final SesionClaseService sesionClaseService;

    public SesionClaseController(SesionClaseService sesionClaseService) {
        this.sesionClaseService = sesionClaseService;
    }

    @GetMapping("/{asignacionId}/sesiones")
    public List<SesionClaseDTO> listar(
            @PathVariable Long asignacionId) {

        return sesionClaseService.listarPorAsignacion(asignacionId);
    }

    @PostMapping("/{asignacionId}/sesiones")
    public SesionClaseDTO crear(
            @PathVariable Long asignacionId,
            @Valid @RequestBody CrearSesionDTO datos) {

        return sesionClaseService.crear(asignacionId, datos);
    }
}
