package com.gestionacademica.portaldocente.config;

import com.gestionacademica.portaldocente.model.ActividadEvaluable;
import com.gestionacademica.portaldocente.model.AsignacionDocente;
import com.gestionacademica.portaldocente.model.Curso;
import com.gestionacademica.portaldocente.model.Docente;
import com.gestionacademica.portaldocente.model.Estudiante;
import com.gestionacademica.portaldocente.model.Matricula;
import com.gestionacademica.portaldocente.repository.ActividadEvaluableRepository;
import com.gestionacademica.portaldocente.repository.AsignacionDocenteRepository;
import com.gestionacademica.portaldocente.repository.CursoRepository;
import com.gestionacademica.portaldocente.repository.DocenteRepository;
import com.gestionacademica.portaldocente.repository.EstudianteRepository;
import com.gestionacademica.portaldocente.repository.MatriculaRepository;

import java.math.BigDecimal;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatosIniciales {

    @Bean
    CommandLineRunner cargarDatos(
            DocenteRepository docenteRepository,
            CursoRepository cursoRepository,
            AsignacionDocenteRepository asignacionRepository,
            EstudianteRepository estudianteRepository,
            MatriculaRepository matriculaRepository,
            ActividadEvaluableRepository actividadRepository) {

        return args -> {

            // Evita duplicar datos si ya existe información.
            if (docenteRepository.count() > 0
                    || cursoRepository.count() > 0
                    || asignacionRepository.count() > 0
                    || estudianteRepository.count() > 0
                    || matriculaRepository.count() > 0
                    || actividadRepository.count() > 0) {

                System.out.println(
                        "Datos iniciales omitidos: ya existen registros.");

                return;
            }

            // 1. Crear un docente de demostración.
            Docente docente = new Docente();
            docente.setNombres("Carlos");
            docente.setApellidos("Ramírez Torres");
            docente.setCorreo("carlos.ramirez@demo.edu.pe");

            // Marcador provisional: todavía no implementamos autenticación.
            docente.setContrasena("PENDIENTE_DE_CONFIGURAR_SEGURIDAD");

            docente = docenteRepository.save(docente);

            // 2. Crear dos cursos.
            Curso programacion = new Curso();
            programacion.setCodigo("SIS101");
            programacion.setNombre("Programación I");
            programacion.setDescripcion(
                    "Fundamentos de programación y algoritmos.");

            programacion = cursoRepository.save(programacion);

            Curso basesDatos = new Curso();
            basesDatos.setCodigo("SIS202");
            basesDatos.setNombre("Base de Datos");
            basesDatos.setDescripcion(
                    "Diseño y gestión de bases de datos.");

            basesDatos = cursoRepository.save(basesDatos);

            // 3. Asignar los cursos al docente.
            AsignacionDocente asignacionProgramacion =
                    new AsignacionDocente();

            asignacionProgramacion.setDocente(docente);
            asignacionProgramacion.setCurso(programacion);
            asignacionProgramacion.setSeccion("A");
            asignacionProgramacion.setPeriodoAcademico("2026-II");

            asignacionProgramacion =
                    asignacionRepository.save(asignacionProgramacion);

            AsignacionDocente asignacionBasesDatos =
                    new AsignacionDocente();

            asignacionBasesDatos.setDocente(docente);
            asignacionBasesDatos.setCurso(basesDatos);
            asignacionBasesDatos.setSeccion("A");
            asignacionBasesDatos.setPeriodoAcademico("2026-II");

            asignacionRepository.save(asignacionBasesDatos);

            // 4. Crear estudiantes existentes.
            Estudiante estudiante1 = crearEstudiante(
                    "20260001", "Ana", "García López",
                    "ana.garcia@demo.edu.pe");

            Estudiante estudiante2 = crearEstudiante(
                    "20260002", "Luis", "Pérez Díaz",
                    "luis.perez@demo.edu.pe");

            Estudiante estudiante3 = crearEstudiante(
                    "20260003", "María", "Torres Ruiz",
                    "maria.torres@demo.edu.pe");

            estudiante1 = estudianteRepository.save(estudiante1);
            estudiante2 = estudianteRepository.save(estudiante2);
            estudiante3 = estudianteRepository.save(estudiante3);

            // 5. Matricular a los estudiantes en Programación I.
            matriculaRepository.save(
                    crearMatricula(estudiante1, asignacionProgramacion));

            matriculaRepository.save(
                    crearMatricula(estudiante2, asignacionProgramacion));

            matriculaRepository.save(
                    crearMatricula(estudiante3, asignacionProgramacion));

            // 6. Crear evaluaciones que suman exactamente 100 %.
            actividadRepository.save(crearActividad(
                    "Práctica 1", "Práctica", "30.00",
                    1, asignacionProgramacion));

            actividadRepository.save(crearActividad(
                    "Examen parcial", "Examen", "30.00",
                    2, asignacionProgramacion));

            actividadRepository.save(crearActividad(
                    "Examen final", "Examen", "40.00",
                    3, asignacionProgramacion));

            System.out.println(
                    "Datos de demostración cargados correctamente.");
        };
    }

    private Estudiante crearEstudiante(
            String codigo,
            String nombres,
            String apellidos,
            String correo) {

        Estudiante estudiante = new Estudiante();
        estudiante.setCodigoEstudiante(codigo);
        estudiante.setNombres(nombres);
        estudiante.setApellidos(apellidos);
        estudiante.setCorreo(correo);

        return estudiante;
    }

    private Matricula crearMatricula(
            Estudiante estudiante,
            AsignacionDocente asignacion) {

        Matricula matricula = new Matricula();
        matricula.setEstudiante(estudiante);
        matricula.setAsignacionDocente(asignacion);

        return matricula;
    }

    private ActividadEvaluable crearActividad(
            String nombre,
            String tipo,
            String porcentaje,
            int orden,
            AsignacionDocente asignacion) {

        ActividadEvaluable actividad = new ActividadEvaluable();
        actividad.setNombre(nombre);
        actividad.setTipo(tipo);
        actividad.setPorcentaje(new BigDecimal(porcentaje));
        actividad.setOrden(orden);
        actividad.setAsignacionDocente(asignacion);

        return actividad;
    }
}
