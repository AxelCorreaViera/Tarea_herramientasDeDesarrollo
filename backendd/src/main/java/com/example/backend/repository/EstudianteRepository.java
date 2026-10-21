
package com.example.backend.repository;

import com.example.backend.model.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstudianteRepository
        extends JpaRepository<Estudiante, Long> {

    boolean existsByCodigo(String codigo);
}
