package com.gestionacademica.portaldocente.controller;

import com.gestionacademica.portaldocente.dto.EstudianteMatriculadoDTO;
import com.gestionacademica.portaldocente.service.MatriculaService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/asignaciones")
public class MatriculaController {

    private final MatriculaService matriculaService;

    public MatriculaController(MatriculaService matriculaService) {
        this.matriculaService = matriculaService;
    }

    @GetMapping("/{asignacionId}/estudiantes")
    public List<EstudianteMatriculadoDTO> listarEstudiantes(
            @PathVariable Long asignacionId) {

        return matriculaService
                .listarEstudiantesPorAsignacion(asignacionId);
    }
}
