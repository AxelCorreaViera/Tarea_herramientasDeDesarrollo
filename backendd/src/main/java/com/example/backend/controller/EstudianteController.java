
package com.example.backend.controller;

import com.example.backend.model.Estudiante;
import com.example.backend.service.EstudianteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estudiantes")
@CrossOrigin(origins = {
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8080"
})
public class EstudianteController {

    private final EstudianteService estudianteService;

    public EstudianteController(EstudianteService estudianteService) {
        this.estudianteService = estudianteService;
    }

    // Listar todos los estudiantes
    @GetMapping
    public ResponseEntity<List<Estudiante>> listar() {
        return ResponseEntity.ok(estudianteService.listar());
    }

    // Buscar un estudiante por su ID
    @GetMapping("/{id}")
    public ResponseEntity<Estudiante> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(estudianteService.buscar(id));
    }

    // Registrar un estudiante
    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Estudiante estudiante) {
        try {
            Estudiante guardado = estudianteService.guardar(estudiante);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(guardado);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(new MensajeRespuesta(e.getMessage()));
        }
    }

    // Actualizar un estudiante
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Long id,
            @RequestBody Estudiante datos) {
        try {
            Estudiante actualizado =
                    estudianteService.actualizar(id, datos);

            return ResponseEntity.ok(actualizado);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(new MensajeRespuesta(e.getMessage()));
        }
    }

    // Eliminar un estudiante
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            estudianteService.eliminar(id);
            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(new MensajeRespuesta(e.getMessage()));
        }
    }

    public record MensajeRespuesta(String mensaje) {}
}
