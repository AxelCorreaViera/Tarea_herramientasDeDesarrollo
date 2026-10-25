package com.gestionacademica.portaldocente.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "matriculas",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_estudiante_asignacion",
            columnNames = {"estudiante_id", "asignacion_docente_id"}
        )
    }
)
public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "asignacion_docente_id", nullable = false)
    private AsignacionDocente asignacionDocente;

    @Column(nullable = false)
    private boolean activa = true;

    public Matricula() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Estudiante getEstudiante() {
        return estudiante;
    }

    public void setEstudiante(Estudiante estudiante) {
        this.estudiante = estudiante;
    }

    public AsignacionDocente getAsignacionDocente() {
        return asignacionDocente;
    }

    public void setAsignacionDocente(AsignacionDocente asignacionDocente) {
        this.asignacionDocente = asignacionDocente;
    }

    public boolean isActiva() {
        return activa;
    }

    public void setActiva(boolean activa) {
        this.activa = activa;
    }
}
