package com.gestionacademica.portaldocente.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestionacademica.portaldocente.model.Calificacion;

public interface CalificacionRepository
        extends JpaRepository<Calificacion, Long> {

    List<Calificacion> findByMatricula_Id(Long matriculaId);

    Optional<Calificacion>
        findByMatricula_IdAndActividadEvaluable_Id(
            Long matriculaId, Long actividadEvaluableId);

    List<Calificacion>
        findByActividadEvaluable_Id(Long actividadEvaluableId);
}
