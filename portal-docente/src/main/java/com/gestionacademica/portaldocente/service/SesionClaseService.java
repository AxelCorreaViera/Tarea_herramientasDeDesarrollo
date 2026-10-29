package com.gestionacademica.portaldocente.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gestionacademica.portaldocente.dto.CrearSesionDTO;
import com.gestionacademica.portaldocente.dto.SesionClaseDTO;
import com.gestionacademica.portaldocente.model.AsignacionDocente;
import com.gestionacademica.portaldocente.model.SesionClase;
import com.gestionacademica.portaldocente.repository.AsignacionDocenteRepository;
import com.gestionacademica.portaldocente.repository.SesionClaseRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional(readOnly = true)
public class SesionClaseService {

    private static final LocalTime HORA_MINIMA =
            LocalTime.of(7, 0);

    private static final LocalTime HORA_MAXIMA =
            LocalTime.of(23, 0);

    private final SesionClaseRepository sesionRepository;
    private final AsignacionDocenteRepository asignacionRepository;

    public SesionClaseService(
            SesionClaseRepository sesionRepository,
            AsignacionDocenteRepository asignacionRepository) {
        this.sesionRepository = sesionRepository;
        this.asignacionRepository = asignacionRepository;
    }

    public List<SesionClaseDTO> listarPorAsignacion(
            Long asignacionId) {

        verificarAsignacion(asignacionId);

        return sesionRepository
                .findByAsignacionDocente_IdOrderByFechaAscHoraInicioAsc(
                        asignacionId)
                .stream()
                .map(this::convertirDTO)
                .toList();
    }

    @Transactional
    public SesionClaseDTO crear(
            Long asignacionId,
            CrearSesionDTO datos) {

        if (datos == null) {
            throw new IllegalArgumentException(
                    "Debes proporcionar los datos de la sesión.");
        }

        LocalDate fecha = datos.fecha();
        LocalTime horaInicio = datos.horaInicio();
        LocalTime horaFin = datos.horaFin();

        if (fecha == null) {
            throw new IllegalArgumentException(
                    "La fecha de la sesión es obligatoria.");
        }

        if (fecha.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "No se pueden registrar sesiones en días pasados.");
        }

        if (horaInicio == null || horaFin == null) {
            throw new IllegalArgumentException(
                    "La hora de inicio y la hora de fin son obligatorias.");
        }

        if (horaInicio.isBefore(HORA_MINIMA)) {
            throw new IllegalArgumentException(
                    "La sesión no puede comenzar antes de las 07:00.");
        }

        if (horaFin.isAfter(HORA_MAXIMA)) {
            throw new IllegalArgumentException(
                    "La sesión no puede terminar después de las 23:00.");
        }

        if (!horaFin.isAfter(horaInicio)) {
            throw new IllegalArgumentException(
                    "La hora de fin debe ser posterior a la hora de inicio.");
        }

        AsignacionDocente asignacion =
                verificarAsignacion(asignacionId);

        if (!asignacion.isActiva()) {
            throw new IllegalStateException(
                    "No se pueden crear sesiones para una asignación inactiva.");
        }

        validarCruceHorario(
                asignacion, fecha, horaInicio, horaFin);

        SesionClase sesion = new SesionClase();
        sesion.setFecha(fecha);
        sesion.setHoraInicio(horaInicio);
        sesion.setHoraFin(horaFin);
        sesion.setDescripcion(datos.descripcion());
        sesion.setAsignacionDocente(asignacion);

        return convertirDTO(sesionRepository.save(sesion));
    }

    private void validarCruceHorario(
            AsignacionDocente asignacion,
            LocalDate fecha,
            LocalTime horaInicio,
            LocalTime horaFin) {

        Long docenteId = asignacion.getDocente().getId();

        List<SesionClase> sesionesDelDia =
                sesionRepository.findByFecha(fecha);

        for (SesionClase existente : sesionesDelDia) {

            Long docenteExistenteId = existente
                    .getAsignacionDocente()
                    .getDocente()
                    .getId();

            // Solo se comparan sesiones del mismo docente.
            if (!docenteId.equals(docenteExistenteId)) {
                continue;
            }

            boolean seSuperpone =
                    horaInicio.isBefore(existente.getHoraFin())
                    && horaFin.isAfter(existente.getHoraInicio());

            if (seSuperpone) {
                throw new IllegalStateException(
                        "El horario se cruza con otra sesión del mismo docente. "
                        + "Elige una hora diferente.");
            }
        }
    }

    private AsignacionDocente verificarAsignacion(
            Long asignacionId) {

        if (asignacionId == null) {
            throw new IllegalArgumentException(
                    "El identificador de la asignación es obligatorio.");
        }

        return asignacionRepository.findById(asignacionId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No existe la asignación con ID "
                                + asignacionId));
    }

    private SesionClaseDTO convertirDTO(SesionClase sesion) {

        String diaSemana = sesion.getFecha()
                .getDayOfWeek()
                .getDisplayName(
                        TextStyle.FULL,
                        Locale.forLanguageTag("es-PE"));

        diaSemana = diaSemana.substring(0, 1).toUpperCase()
                + diaSemana.substring(1);

        long duracionMinutos = Duration.between(
                sesion.getHoraInicio(),
                sesion.getHoraFin()
        ).toMinutes();

        return new SesionClaseDTO(
                sesion.getId(),
                sesion.getAsignacionDocente().getId(),
                sesion.getFecha(),
                diaSemana,
                sesion.getHoraInicio(),
                sesion.getHoraFin(),
                duracionMinutos,
                sesion.getDescripcion());
    }
}
