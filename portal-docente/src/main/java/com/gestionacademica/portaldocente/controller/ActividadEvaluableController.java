package com.gestionacademica.portaldocente.controller;

import com.gestionacademica.portaldocente.dto.ActividadEvaluableDTO;
import com.gestionacademica.portaldocente.dto.CrearActividadEvaluableDTO;
import com.gestionacademica.portaldocente.model.ActividadEvaluable;
import com.gestionacademica.portaldocente.model.AsignacionDocente;
import com.gestionacademica.portaldocente.service.ActividadEvaluableService;
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
public class ActividadEvaluableController {

    private final ActividadEvaluableService actividadService;

    public ActividadEvaluableController(
            ActividadEvaluableService actividadService) {
        this.actividadService = actividadService;
    }

    @GetMapping("/{asignacionId}/evaluaciones")
    public List<ActividadEvaluableDTO> listar(
            @PathVariable Long asignacionId) {

        return actividadService
                .listarActivasPorAsignacion(asignacionId)
                .stream()
                .map(this::convertirDTO)
                .toList();
    }

    @PostMapping("/{asignacionId}/evaluaciones")
    public ActividadEvaluableDTO crear(
            @PathVariable Long asignacionId,
            @Valid @RequestBody CrearActividadEvaluableDTO datos) {

        AsignacionDocente asignacion = new AsignacionDocente();
        asignacion.setId(asignacionId);

        ActividadEvaluable actividad = new ActividadEvaluable();
        actividad.setNombre(datos.nombre());
        actividad.setTipo(datos.tipo());
        actividad.setPorcentaje(datos.porcentaje());
        actividad.setOrden(datos.orden());
        actividad.setAsignacionDocente(asignacion);

        ActividadEvaluable guardada = actividadService.crear(actividad);

        return convertirDTO(guardada);
    }

    private ActividadEvaluableDTO convertirDTO(
            ActividadEvaluable actividad) {

        return new ActividadEvaluableDTO(
                actividad.getId(),
                actividad.getNombre(),
                actividad.getTipo(),
                actividad.getPorcentaje(),
                actividad.getOrden());
    }
}
