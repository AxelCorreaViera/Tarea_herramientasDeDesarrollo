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
import jakarta.validation.constraints.NotNull;

@Entity
@Table(
    name = "calificaciones",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_calificacion_matricula_actividad",
            columnNames = {"matricula_id", "actividad_evaluable_id"}
        )
    }
)
public class Calificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @DecimalMin("0.00")
    @DecimalMax("20.00")
    @Digits(integer = 2, fraction = 2)
    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal nota;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "matricula_id", nullable = false)
    private Matricula matricula;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "actividad_evaluable_id", nullable = false)
    private ActividadEvaluable actividadEvaluable;

    public Calificacion() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getNota() {
        return nota;
    }

    public void setNota(BigDecimal nota) {
        this.nota = nota;
    }

    public Matricula getMatricula() {
        return matricula;
    }

    public void setMatricula(Matricula matricula) {
        this.matricula = matricula;
    }

    public ActividadEvaluable getActividadEvaluable() {
        return actividadEvaluable;
    }

    public void setActividadEvaluable(ActividadEvaluable actividadEvaluable) {
        this.actividadEvaluable = actividadEvaluable;
    }
}
