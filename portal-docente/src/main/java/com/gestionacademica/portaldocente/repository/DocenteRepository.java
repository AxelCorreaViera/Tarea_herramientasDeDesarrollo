package com.gestionacademica.portaldocente.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestionacademica.portaldocente.model.Docente;

public interface DocenteRepository extends JpaRepository<Docente, Long> {

    Optional<Docente> findByCorreoIgnoreCase(String correo);
}
