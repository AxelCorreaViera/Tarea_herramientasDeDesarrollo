
package com.gestionacademica.portaldocente.controller;

import com.gestionacademica.portaldocente.dto.EstadisticasBasicasDTO;
import com.gestionacademica.portaldocente.service.EstadisticasGeneralesService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/docentes")
public class EstadisticasGeneralesController {

    private final EstadisticasGeneralesService estadisticasService;

    public EstadisticasGeneralesController(
            EstadisticasGeneralesService estadisticasService) {

        this.estadisticasService = estadisticasService;
    }

    @GetMapping("/{docenteId}/estadisticas")
    public EstadisticasBasicasDTO obtenerEstadisticas(
            @PathVariable Long docenteId) {

        return estadisticasService.obtenerEstadisticas(docenteId);
    }
}
