package com.gestionacademica.portaldocente.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestionacademica.portaldocente.model.Asistencia;

public interface AsistenciaRepository
        extends JpaRepository<Asistencia, Long> {

    List<Asistencia> findByMatricula_Id(Long matriculaId);

    List<Asistencia> findBySesionClase_Id(Long sesionClaseId);

    Optional<Asistencia>
        findByMatricula_IdAndSesionClase_Id(
            Long matriculaId, Long sesionClaseId);
}
