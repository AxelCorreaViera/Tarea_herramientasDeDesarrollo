package com.gestionacademica.portaldocente.model;

import java.math.BigDecimal;

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
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(
    name = "actividades_evaluables",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_actividad_asignacion",
            columnNames = {"asignacion_docente_id", "nombre"}
        )
    }
)
public class ActividadEvaluable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(length = 60)
    private String tipo;

    @NotNull
    @DecimalMin("0.01")
    @DecimalMax("100.00")
    @Digits(integer = 3, fraction = 2)
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal porcentaje;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer orden;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "asignacion_docente_id", nullable = false)
    private AsignacionDocente asignacionDocente;

    @Column(nullable = false)
    private boolean activa = true;

    public ActividadEvaluable() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public BigDecimal getPorcentaje() {
        return porcentaje;
    }

    public void setPorcentaje(BigDecimal porcentaje) {
        this.porcentaje = porcentaje;
    }

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
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
