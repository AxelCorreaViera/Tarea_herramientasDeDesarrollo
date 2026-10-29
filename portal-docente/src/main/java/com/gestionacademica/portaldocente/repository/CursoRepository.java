package com.gestionacademica.portaldocente.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestionacademica.portaldocente.model.Curso;

public interface CursoRepository extends JpaRepository<Curso, Long> {

    Optional<Curso> findByCodigoIgnoreCase(String codigo);
}
