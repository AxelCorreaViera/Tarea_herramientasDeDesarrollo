
package main.java.com.example.backend.controller;

import com.example.backend.model.Docente;
import com.example.backend.service.DocenteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/docentes")
@CrossOrigin(origins = {
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8080"
})
public class DocenteController {

    private final DocenteService docenteService;

    public DocenteController(DocenteService docenteService) {
        this.docenteService = docenteService;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Docente docente) {
        try {
            Docente registrado = docenteService.registrar(docente);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(new MensajeRespuesta(
                            "Docente registrado correctamente",
                            registrado.getId()
                    ));

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(new MensajeRespuesta(e.getMessage(), null));
        }
    }

    public record MensajeRespuesta(String mensaje, Long id) {}
}
