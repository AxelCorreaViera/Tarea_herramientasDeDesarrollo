package com.gestionacademica.portaldocente.model;

import java.time.LocalDate;

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
import jakarta.validation.constraints.NotNull;

@Entity
@Table(
    name = "sesiones_clase",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_sesion_asignacion_fecha",
            columnNames = {"asignacion_docente_id", "fecha"}
        )
    }
)
public class SesionClase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private LocalDate fecha;

    @Column(length = 250)
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "asignacion_docente_id", nullable = false)
    private AsignacionDocente asignacionDocente;

    public SesionClase() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public AsignacionDocente getAsignacionDocente() {
        return asignacionDocente;
    }

    public void setAsignacionDocente(AsignacionDocente asignacionDocente) {
        this.asignacionDocente = asignacionDocente;
    }
}
