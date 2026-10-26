package com.gestionacademica.portaldocente.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestionacademica.portaldocente.model.AsignacionDocente;

public interface AsignacionDocenteRepository
        extends JpaRepository<AsignacionDocente, Long> {

    List<AsignacionDocente> findByDocente_IdAndActivaTrue(Long docenteId);

    List<AsignacionDocente> findByDocente_Id(Long docenteId);
}
