package com.gestionacademica.portaldocente.controller;

import com.gestionacademica.portaldocente.dto.AsistenciaDTO;
import com.gestionacademica.portaldocente.dto.RegistrarAsistenciaDTO;
import com.gestionacademica.portaldocente.dto.RegistrarAsistenciaLoteDTO;
import com.gestionacademica.portaldocente.service.AsistenciaService;
import com.gestionacademica.portaldocente.service.ResumenAsistencia;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/matriculas")
@Validated
public class AsistenciaController {

    private final AsistenciaService asistenciaService;

    public AsistenciaController(AsistenciaService asistenciaService) {
        this.asistenciaService = asistenciaService;
    }

    // Registrar o actualizar asistencia individual
    @PostMapping("/{matriculaId}/asistencias/{sesionId}")
    public AsistenciaDTO registrarAsistencia(
            @PathVariable Long matriculaId,
            @PathVariable Long sesionId,
            @Valid @RequestBody RegistrarAsistenciaDTO datos) {

        return asistenciaService.registrarOActualizarDTO(
                matriculaId, sesionId, datos.estado());
    }

    // Registrar o actualizar asistencia de varios estudiantes
    // para una misma sesión
    @PostMapping("/sesiones/{sesionId}/asistencias")
    public List<AsistenciaDTO> registrarAsistenciasGrupales(
            @PathVariable Long sesionId,
            @NotEmpty @RequestBody List<@Valid RegistrarAsistenciaLoteDTO> datos) {

        return asistenciaService.registrarAsistenciasSesion(sesionId, datos);
    }

    // Consultar historial de asistencias de un estudiante
    @GetMapping("/{matriculaId}/asistencias")
    public List<AsistenciaDTO> listarAsistencias(
            @PathVariable Long matriculaId) {

        return asistenciaService.listarDTOPorMatricula(matriculaId);
    }

    // Consultar resumen de asistencia de un estudiante
    @GetMapping("/{matriculaId}/resumen-asistencia")
    public ResumenAsistencia consultarResumen(
            @PathVariable Long matriculaId) {

        return asistenciaService.obtenerResumen(matriculaId);
    }
}