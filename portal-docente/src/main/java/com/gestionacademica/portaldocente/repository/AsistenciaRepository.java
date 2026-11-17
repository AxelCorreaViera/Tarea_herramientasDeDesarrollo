
package com.gestionacademica.portaldocente.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gestionacademica.portaldocente.model.Asistencia;
import com.gestionacademica.portaldocente.model.EstadoAsistencia;

public interface AsistenciaRepository
        extends JpaRepository<Asistencia, Long> {

    List<Asistencia> findByMatricula_Id(Long matriculaId);

    List<Asistencia> findBySesionClase_Id(Long sesionClaseId);

    Optional<Asistencia> findByMatricula_IdAndSesionClase_Id(
            Long matriculaId, Long sesionClaseId);

    @Query("""
        SELECT COUNT(a)
        FROM Asistencia a
        WHERE a.matricula.activa = true
          AND a.matricula.asignacionDocente.activa = true
          AND a.matricula.asignacionDocente.docente.id = :docenteId
    """)
    long contarAsistenciasDeDocente(
            @Param("docenteId") Long docenteId);

    @Query("""
        SELECT COUNT(a)
        FROM Asistencia a
        WHERE a.estado = :estado
          AND a.matricula.activa = true
          AND a.matricula.asignacionDocente.activa = true
          AND a.matricula.asignacionDocente.docente.id = :docenteId
    """)
    long contarAsistenciasPorEstadoDeDocente(
            @Param("docenteId") Long docenteId,
            @Param("estado") EstadoAsistencia estado);
}
