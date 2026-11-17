package com.gestionacademica.portaldocente.service;

import com.gestionacademica.portaldocente.dto.AsistenciaDTO;
import com.gestionacademica.portaldocente.dto.RegistrarAsistenciaLoteDTO;
import com.gestionacademica.portaldocente.model.Asistencia;
import com.gestionacademica.portaldocente.model.EstadoAsistencia;
import com.gestionacademica.portaldocente.model.Matricula;
import com.gestionacademica.portaldocente.model.SesionClase;
import com.gestionacademica.portaldocente.repository.AsistenciaRepository;
import com.gestionacademica.portaldocente.repository.MatriculaRepository;
import com.gestionacademica.portaldocente.repository.SesionClaseRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AsistenciaService {

    private final AsistenciaRepository asistenciaRepository;
    private final MatriculaRepository matriculaRepository;
    private final SesionClaseRepository sesionClaseRepository;

    public AsistenciaService(
            AsistenciaRepository asistenciaRepository,
            MatriculaRepository matriculaRepository,
            SesionClaseRepository sesionClaseRepository) {

        this.asistenciaRepository = asistenciaRepository;
        this.matriculaRepository = matriculaRepository;
        this.sesionClaseRepository = sesionClaseRepository;
    }

    @Transactional
    public Asistencia registrarOActualizar(
            Long matriculaId,
            Long sesionId,
            EstadoAsistencia estado) {

        if (matriculaId == null || sesionId == null) {
            throw new IllegalArgumentException(
                    "La matrícula y la sesión son obligatorias.");
        }

        if (estado == null) {
            throw new IllegalArgumentException(
                    "Debe especificarse el estado de asistencia.");
        }

        Matricula matricula = matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No existe la matrícula con ID " + matriculaId));

        SesionClase sesion = sesionClaseRepository.findById(sesionId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "No existe la sesión de clase con ID " + sesionId));

        if (!matricula.isActiva()) {
            throw new IllegalStateException(
                    "No se puede registrar asistencia para una matrícula inactiva.");
        }

        Long asignacionMatriculaId = matricula.getAsignacionDocente().getId();
        Long asignacionSesionId = sesion.getAsignacionDocente().getId();

        if (!asignacionMatriculaId.equals(asignacionSesionId)) {
            throw new IllegalArgumentException(
                    "La matrícula y la sesión pertenecen "
                    + "a asignaciones docentes diferentes.");
        }

        Asistencia asistencia = asistenciaRepository
                .findByMatricula_IdAndSesionClase_Id(matriculaId, sesionId)
                .orElseGet(Asistencia::new);

        asistencia.setMatricula(matricula);
        asistencia.setSesionClase(sesion);
        asistencia.setEstado(estado);

        return asistenciaRepository.save(asistencia);
    }

    // Registra o actualiza la asistencia de todos los estudiantes
    // para una misma sesión, dentro de una única transacción.
    @Transactional
    public List<AsistenciaDTO> registrarAsistenciasSesion(
            Long sesionId,
            List<RegistrarAsistenciaLoteDTO> registros) {

        if (sesionId == null) {
            throw new IllegalArgumentException(
                    "La sesión es obligatoria.");
        }

        if (registros == null || registros.isEmpty()) {
            throw new IllegalArgumentException(
                    "Debes enviar al menos un registro de asistencia.");
        }

        // Verificamos que la sesión exista antes de procesar los registros.
        if (!sesionClaseRepository.existsById(sesionId)) {
            throw new EntityNotFoundException(
                    "No existe la sesión de clase con ID " + sesionId);
        }

        // Evitamos que una matrícula aparezca dos veces en la misma petición.
        Set<Long> matriculasProcesadas = new HashSet<>();

        for (RegistrarAsistenciaLoteDTO registro : registros) {

            if (registro == null
                    || registro.matriculaId() == null
                    || registro.estado() == null) {

                throw new IllegalArgumentException(
                        "Todos los estudiantes deben tener matrícula y estado.");
            }

            if (!matriculasProcesadas.add(registro.matriculaId())) {
                throw new IllegalArgumentException(
                        "Una matrícula aparece más de una vez en el registro.");
            }
        }

        // Se guardan todos los registros. Si alguno falla,
        // la transacción revierte los cambios anteriores.
        return registros.stream()
                .map(registro -> {
                    Asistencia asistencia = registrarOActualizar(
                            registro.matriculaId(),
                            sesionId,
                            registro.estado());

                    return convertirDTO(asistencia);
                })
                .collect(Collectors.toList());
    }

    public List<Asistencia> listarPorMatricula(Long matriculaId) {

        if (matriculaId == null) {
            throw new IllegalArgumentException(
                    "El identificador de la matrícula es obligatorio.");
        }

        if (!matriculaRepository.existsById(matriculaId)) {
            throw new EntityNotFoundException(
                    "No existe la matrícula con ID " + matriculaId);
        }

        return asistenciaRepository.findByMatricula_Id(matriculaId);
    }

    public ResumenAsistencia obtenerResumen(Long matriculaId) {

        List<Asistencia> asistencias = listarPorMatricula(matriculaId);

        int presentes = 0;
        int faltas = 0;
        int faltasJustificadas = 0;

        for (Asistencia asistencia : asistencias) {
            switch (asistencia.getEstado()) {
                case PRESENTE -> presentes++;
                case FALTA -> faltas++;
                case FALTA_JUSTIFICADA -> faltasJustificadas++;
            }
        }

        int clasesRegistradas = asistencias.size();

        BigDecimal porcentaje = BigDecimal.ZERO;

        if (clasesRegistradas > 0) {
            porcentaje = BigDecimal.valueOf(presentes)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(
                            BigDecimal.valueOf(clasesRegistradas),
                            2,
                            RoundingMode.HALF_UP);
        }

        return new ResumenAsistencia(
                clasesRegistradas,
                presentes,
                faltas,
                faltasJustificadas,
                porcentaje);
    }

    @Transactional
    public AsistenciaDTO registrarOActualizarDTO(
            Long matriculaId,
            Long sesionId,
            EstadoAsistencia estado) {

        Asistencia asistencia = registrarOActualizar(
                matriculaId, sesionId, estado);

        return convertirDTO(asistencia);
    }

    public List<AsistenciaDTO> listarDTOPorMatricula(Long matriculaId) {

        return listarPorMatricula(matriculaId)
                .stream()
                .map(this::convertirDTO)
                .collect(Collectors.toList());
    }

    private AsistenciaDTO convertirDTO(Asistencia asistencia) {

        return new AsistenciaDTO(
                asistencia.getId(),
                asistencia.getMatricula().getId(),
                asistencia.getSesionClase().getId(),
                asistencia.getSesionClase().getFecha(),
                asistencia.getSesionClase().getDescripcion(),
                asistencia.getEstado());
    }
}