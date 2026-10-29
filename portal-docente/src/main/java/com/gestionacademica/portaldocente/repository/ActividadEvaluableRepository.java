package com.gestionacademica.portaldocente.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestionacademica.portaldocente.model.ActividadEvaluable;

public interface ActividadEvaluableRepository
        extends JpaRepository<ActividadEvaluable, Long> {

    List<ActividadEvaluable>
        findByAsignacionDocente_IdAndActivaTrueOrderByOrdenAsc(
            Long asignacionDocenteId);

    List<ActividadEvaluable>
        findByAsignacionDocente_IdOrderByOrdenAsc(
            Long asignacionDocenteId);
}
