package com.gestionacademica.portaldocente.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestionacademica.portaldocente.model.SesionClase;

public interface SesionClaseRepository
        extends JpaRepository<SesionClase, Long> {

    List<SesionClase>
        findByAsignacionDocente_IdOrderByFechaAsc(
            Long asignacionDocenteId);
}
