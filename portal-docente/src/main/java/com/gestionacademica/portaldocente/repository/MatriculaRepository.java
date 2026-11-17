package com.gestionacademica.portaldocente.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestionacademica.portaldocente.model.Matricula;

public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

    List<Matricula> findByAsignacionDocente_IdAndActivaTrue(
            Long asignacionDocenteId);

    Optional<Matricula> findByEstudiante_IdAndAsignacionDocente_Id(
            Long estudianteId, Long asignacionDocenteId);

    List<Matricula> findByEstudiante_IdAndActivaTrue(Long estudianteId);

    @Query("""
    SELECT COUNT(DISTINCT m.estudiante.id)
    FROM Matricula m
    WHERE m.activa = true
      AND m.asignacionDocente.docente.id = :docenteId
      AND m.asignacionDocente.activa = true
""")
long contarEstudiantesUnicosPorDocente(
        @Param("docenteId") Long docenteId);

        List<Matricula> findByAsignacionDocente_Docente_IdAndAsignacionDocente_ActivaTrueAndActivaTrue(
                Long docenteId);
}
