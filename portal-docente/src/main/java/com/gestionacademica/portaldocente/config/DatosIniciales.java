
package com.gestionacademica.portaldocente.config;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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

                        // 1. Crear el docente de demostración.
                        Docente docente = new Docente();
                        docente.setNombres("Carlos");
                        docente.setApellidos("Ramírez Torres");
                        docente.setCorreo("carlos.ramirez@demo.edu.pe");
                        docente.setContrasena(
                                        "PENDIENTE_DE_CONFIGURAR_SEGURIDAD");

                        docente = docenteRepository.save(docente);

                        // 2. Definir los cinco cursos de demostración.
                        String[][] datosCursos = {
                                        {
                                                        "SIS101",
                                                        "Fundamentos de Programación",
                                                        "Fundamentos de programación y algoritmos."
                                        },
                                        {
                                                        "SIS202",
                                                        "Base de Datos I",
                                                        "Diseño, consultas y gestión de bases de datos."
                                        },
                                        {
                                                        "SIS203",
                                                        "Ingeniería de Software",
                                                        "Análisis, diseño y desarrollo de software."
                                        },
                                        {
                                                        "SIS204",
                                                        "Redes y Comunicaciones",
                                                        "Fundamentos de redes y comunicaciones."
                                        },
                                        {
                                                        "SIS205",
                                                        "Desarrollo de Aplicaciones Web",
                                                        "Desarrollo de aplicaciones web modernas."
                                        }
                        };

                        List<Curso> cursos = new ArrayList<>();

                        for (String[] datos : datosCursos) {
                                Curso curso = new Curso();
                                curso.setCodigo(datos[0]);
                                curso.setNombre(datos[1]);
                                curso.setDescripcion(datos[2]);

                                cursos.add(cursoRepository.save(curso));
                        }

                        // 3. Asignar cada curso al docente.
                        List<AsignacionDocente> asignaciones = new ArrayList<>();

                        for (Curso curso : cursos) {
                                AsignacionDocente asignacion = new AsignacionDocente();

                                asignacion.setDocente(docente);
                                asignacion.setCurso(curso);
                                asignacion.setSeccion("A");
                                asignacion.setPeriodoAcademico("2026-II");

                                asignaciones.add(
                                                asignacionRepository.save(asignacion));
                        }

                        // 4. Datos ficticios para los 75 estudiantes.
                        String[] nombres = {
                                        "Ana", "Luis", "María", "José", "Lucía",
                                        "Carlos", "Valeria", "Diego", "Camila", "Andrés",
                                        "Daniela", "Miguel", "Sofía", "Jorge", "Paola"
                        };

                        String[] apellidos = {
                                        "García López",
                                        "Pérez Díaz",
                                        "Torres Ruiz",
                                        "Flores Sánchez",
                                        "Rojas Mendoza"
                        };

                        // 5. Crear 15 estudiantes y 15 matrículas por curso.
                        int numeroEstudiante = 1;

                        for (int i = 0; i < asignaciones.size(); i++) {
                                AsignacionDocente asignacion = asignaciones.get(i);

                                for (int j = 0; j < 15; j++) {

                                        Estudiante estudiante = crearEstudiante(
                                                        String.format(
                                                                        "2026%04d", numeroEstudiante),
                                                        nombres[j],
                                                        apellidos[i],
                                                        String.format(
                                                                        "estudiante%03d@demo.edu.pe",
                                                                        numeroEstudiante));

                                        estudiante = estudianteRepository.save(estudiante);

                                        Matricula matricula = crearMatricula(
                                                        estudiante, asignacion);

                                        matriculaRepository.save(matricula);

                                        numeroEstudiante++;
                                }
                        }

                        // 6. Crear tres actividades evaluables por curso.
                        // Los porcentajes suman exactamente el 100 %.
                        for (AsignacionDocente asignacion : asignaciones) {

                                actividadRepository.save(crearActividad(
                                                "Práctica 1",
                                                "Práctica",
                                                "30.00",
                                                1,
                                                asignacion));

                                actividadRepository.save(crearActividad(
                                                "Examen parcial",
                                                "Examen",
                                                "30.00",
                                                2,
                                                asignacion));

                                actividadRepository.save(crearActividad(
                                                "Examen final",
                                                "Examen",
                                                "40.00",
                                                3,
                                                asignacion));
                        }

                        System.out.println(
                                        "Datos de demostración cargados correctamente.");
                        System.out.println("Cursos creados: " + cursos.size());
                        System.out.println("Estudiantes creados: "
                                        + (numeroEstudiante - 1));
                        System.out.println("Matrículas creadas: "
                                        + (numeroEstudiante - 1));
                        System.out.println("Actividades evaluables creadas: "
                                        + (asignaciones.size() * 3));
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
