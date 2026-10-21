
package com.example.backend.service;

import com.example.backend.model.Docente;
import com.example.backend.repository.DocenteRepository;
import org.springframework.stereotype.Service;

@Service
public class DocenteService {

    private final DocenteRepository repository;

    public DocenteService(DocenteRepository repository) {
        this.repository = repository;
    }

    public Docente registrar(Docente docente) {
        if (repository.existsByCorreo(docente.getCorreo())) {
            throw new RuntimeException("El correo ya está registrado");
        }

        return repository.save(docente);
    }
}
