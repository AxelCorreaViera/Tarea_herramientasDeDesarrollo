package com.gestionacademica.portaldocente.controller;

import com.gestionacademica.portaldocente.dto.AsignacionResumenDTO;
import com.gestionacademica.portaldocente.security.DocentePrincipal;
import com.gestionacademica.portaldocente.service.AsignacionDocenteService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docentes")
public class AsignacionDocenteController {

    private final AsignacionDocenteService asignacionDocenteService;

    public AsignacionDocenteController(
            AsignacionDocenteService asignacionDocenteService) {
        this.asignacionDocenteService = asignacionDocenteService;
    }

    @GetMapping("/me/asignaciones")
    public List<AsignacionResumenDTO> listarAsignaciones(
            @AuthenticationPrincipal DocentePrincipal principal) {

        return asignacionDocenteService
                .listarResumenesActivosPorDocente(principal.getId());
    }
}
