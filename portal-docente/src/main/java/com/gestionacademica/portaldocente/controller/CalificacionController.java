package com.gestionacademica.portaldocente.controller;

import com.gestionacademica.portaldocente.dto.CalificacionDTO;
import com.gestionacademica.portaldocente.dto.RegistrarCalificacionDTO;
import com.gestionacademica.portaldocente.service.CalificacionService;
import com.gestionacademica.portaldocente.service.ResultadoPromedio;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/matriculas")
public class CalificacionController {

    private final CalificacionService calificacionService;

    public CalificacionController(CalificacionService calificacionService) {
        this.calificacionService = calificacionService;
    }

    @PostMapping("/{matriculaId}/calificaciones/{actividadId}")
    public CalificacionDTO registrarCalificacion(
            @PathVariable Long matriculaId,
            @PathVariable Long actividadId,
            @Valid @RequestBody RegistrarCalificacionDTO datos) {

        return calificacionService.registrarOActualizarDTO(
                matriculaId, actividadId, datos.nota());
    }

    @GetMapping("/{matriculaId}/calificaciones")
    public List<CalificacionDTO> listarCalificaciones(
            @PathVariable Long matriculaId) {

        return calificacionService.listarDTOPorMatricula(matriculaId);
    }

    @GetMapping("/{matriculaId}/promedio")
    public ResultadoPromedio consultarPromedio(
            @PathVariable Long matriculaId) {

        return calificacionService.calcularPromedioPonderado(matriculaId);
    }
}
