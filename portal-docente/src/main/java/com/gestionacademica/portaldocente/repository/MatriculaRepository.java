package com.gestionacademica.portaldocente.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestionacademica.portaldocente.model.Matricula;

public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

    List<Matricula> findByAsignacionDocente_IdAndActivaTrue(
            Long asignacionDocenteId);

    Optional<Matricula> findByEstudiante_IdAndAsignacionDocente_Id(
            Long estudianteId, Long asignacionDocenteId);

    List<Matricula> findByEstudiante_IdAndActivaTrue(Long estudianteId);
}
