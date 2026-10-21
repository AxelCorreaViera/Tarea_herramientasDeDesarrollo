package com.example.backend.repository;

import com.example.backend.model.Docente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DocenteRepository extends JpaRepository<Docente, Long> {
    Optional<Docente> findByCorreo(String correo);
    boolean existsByCorreo(String correo);
}