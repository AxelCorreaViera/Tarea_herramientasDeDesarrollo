package com.gestionacademica.portaldocente.exception;

import com.gestionacademica.portaldocente.dto.ApiErrorDTO;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiErrorDTO> manejarNoEncontrado(
            EntityNotFoundException ex,
            HttpServletRequest request) {

        return crearRespuesta(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                request);
    }

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ApiErrorDTO> manejarRecursoNoEncontrado(
            RecursoNoEncontradoException ex,
            HttpServletRequest request) {

        return crearRespuesta(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                request);
    }
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorDTO> manejarArgumentoInvalido(
            IllegalArgumentException ex,
            HttpServletRequest request) {

        return crearRespuesta(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                request);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorDTO> manejarEstadoInvalido(
            IllegalStateException ex,
            HttpServletRequest request) {

        return crearRespuesta(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorDTO> manejarValidacion(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        String mensaje = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::formatearErrorCampo)
                .distinct()
                .reduce((a, b) -> a + "; " + b)
                .orElse("Los datos enviados no son válidos.");

        return crearRespuesta(
                HttpStatus.BAD_REQUEST,
                mensaje,
                request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorDTO> manejarCuerpoInvalido(
            HttpMessageNotReadableException ex,
            HttpServletRequest request) {

        return crearRespuesta(
                HttpStatus.BAD_REQUEST,
                "El cuerpo de la solicitud no es válido. "
                        + "Verifica el formato JSON, las fechas y los valores enviados.",
                request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorDTO> manejarIntegridad(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {

        return crearRespuesta(
                HttpStatus.CONFLICT,
                "La operación no puede completarse porque los datos "
                        + "entran en conflicto con una restricción de la base de datos.",
                request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorDTO> manejarErrorInterno(
            Exception ex,
            HttpServletRequest request) {

        return crearRespuesta(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Ocurrió un error interno al procesar la solicitud.",
                request);
    }

    private String formatearErrorCampo(FieldError error) {
        return error.getField() + ": " + error.getDefaultMessage();
    }

    private ResponseEntity<ApiErrorDTO> crearRespuesta(
            HttpStatus estado,
            String mensaje,
            HttpServletRequest request) {

        ApiErrorDTO error = new ApiErrorDTO(
                Instant.now(),
                estado.value(),
                estado.getReasonPhrase(),
                mensaje,
                request.getRequestURI());

        return ResponseEntity.status(estado).body(error);
    }
}
