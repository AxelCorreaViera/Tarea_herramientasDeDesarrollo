
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
                        // Cada curso tendrá su propia sección en el periodo 2026-II.
                        List<AsignacionDocente> asignaciones = new ArrayList<>();

                        String[] secciones = { "A", "B", "A", "C", "B" };

                        for (int i = 0; i < cursos.size(); i++) {
                                AsignacionDocente asignacion = new AsignacionDocente();

                                asignacion.setDocente(docente);
                                asignacion.setCurso(cursos.get(i));
                                asignacion.setSeccion(secciones[i]);
                                asignacion.setPeriodoAcademico("2026-II");

                                asignaciones.add(asignacionRepository.save(asignacion));
                        }

                        // 4. Crear 123 estudiantes ficticios con datos diferenciados por curso.
                        // Cada curso tiene su propio grupo de nombres y apellidos.

                        String[][] nombresPorCurso = {
                                        {
                                                        "Ana", "Luis", "Maria", "Jose", "Lucia", "Carlos",
                                                        "Valeria", "Diego", "Camila", "Andres", "Daniela",
                                                        "Miguel", "Sofia", "Jorge", "Paola", "Elena",
                                                        "Martin", "Claudia", "Rafael", "Irene", "Mateo", "Alma"
                                        },
                                        {
                                                        "Gabriela", "Fernando", "Isabella", "Ricardo", "Monica",
                                                        "Sebastian", "Natalia", "Adrian", "Valentina", "Bruno",
                                                        "Ximena", "Alonso", "Patricia", "Emilio", "Julieta",
                                                        "Franco", "Renata", "Cristian", "Fabiola", "Oscar",
                                                        "Jimena", "Alvaro", "Hector", "Marina", "Esteban", "Lidia"
                                        },
                                        {
                                                        "Daniel", "Alejandra", "Rodrigo", "Carolina", "Bianca",
                                                        "Gabriel", "Kiara", "Raul", "Antonella", "Mauricio",
                                                        "Lorena", "Ivan", "Pilar", "Gonzalo", "Ariana",
                                                        "Nicolas", "Veronica", "Leonardo", "Abril", "Cecilia",
                                                        "Facundo", "Diana", "Renzo", "Silvia"
                                        },
                                        {
                                                        "Andrea", "Samuel", "Fernanda", "Eduardo", "Micaela",
                                                        "Joaquin", "Tatiana", "Marco", "Florencia", "Alberto",
                                                        "Rocio", "Enrique", "Beatriz", "Cesar", "Noelia",
                                                        "Ignacio", "Carla", "Benjamin", "Olivia", "Felipe",
                                                        "Teresa", "Santiago", "Miranda", "Pedro", "Alicia",
                                                        "Julian", "Eva", "Manuel", "Amparo", "Agustin"
                                        },
                                        {
                                                        "Mariano", "Tomasa", "Nicolas", "Valeria", "Dario",
                                                        "Belen", "Lorenzo", "Amelia", "Ezequiel", "Clara",
                                                        "Salvador", "Estela", "Ruben", "Lourdes", "Axel",
                                                        "Violeta", "Ismael", "Tamara", "Pablo", "Carmen",
                                                        "Ernesto"
                                        }
                        };

                        String[][] apellidosPorCurso = {
                                        {
                                                        "Garcia Lopez", "Perez Diaz", "Torres Ruiz", "Flores Sanchez",
                                                        "Rojas Mendoza", "Vargas Castro", "Chavez Medina",
                                                        "Ramirez Silva",
                                                        "Herrera Cruz", "Diaz Romero", "Castillo Vega", "Morales Rios",
                                                        "Navarro Leon", "Cordova Reyes", "Mendoza Paredes",
                                                        "Soto Aguilar",
                                                        "Campos Fuentes", "Salazar Ortiz", "Ponce Cabrera",
                                                        "Vera Lozano",
                                                        "Espinoza Rivas", "Acosta Peña"
                                        },
                                        {
                                                        "Fernandez Soto", "Gutierrez Campos", "Mendoza Rojas",
                                                        "Silva Paredes",
                                                        "Cabrera Torres", "Aguilar Navarro", "Fuentes Ramirez",
                                                        "Ortiz Castillo",
                                                        "Lozano Herrera", "Rivas Morales", "Peña Vargas",
                                                        "Reyes Salazar",
                                                        "Cruz Espinoza", "Vega Ponce", "Romero Acosta", "Leon Flores",
                                                        "Medina Garcia", "Ruiz Fernandez", "Duran Castro",
                                                        "Bravo Cardenas",
                                                        "Mejia Valdez", "Palacios Soto", "Quispe Huaman",
                                                        "Yupanqui Flores",
                                                        "Chumpitaz Rojas", "Arce Mendoza"
                                        },
                                        {
                                                        "Benavides Cruz", "Valdez Romero", "Cardenas Vega",
                                                        "Huaman Rios",
                                                        "Quispe Leon", "Yupanqui Castro", "Arce Flores",
                                                        "Duran Herrera",
                                                        "Mejia Silva", "Palacios Reyes", "Bravo Medina", "Soto Chavez",
                                                        "Fuentes Morales", "Ponce Vargas", "Acosta Ramirez",
                                                        "Lozano Torres",
                                                        "Espinoza Diaz", "Cabrera Garcia", "Salazar Flores",
                                                        "Ortiz Mendoza",
                                                        "Rivas Paredes", "Aguilar Ruiz", "Campos Navarro",
                                                        "Gutierrez Vega"
                                        },
                                        {
                                                        "Huerta Salas", "Valencia Rojas", "Montoya Cruz",
                                                        "Bustamante Leon",
                                                        "Caceres Silva", "Vasquez Ponce", "Delgado Reyes",
                                                        "Maldonado Ruiz",
                                                        "Carrasco Vega", "Tapia Mendoza", "Ochoa Ramirez",
                                                        "Miranda Flores",
                                                        "Saavedra Castro", "Zamora Torres", "Cueva Morales",
                                                        "Luna Herrera",
                                                        "Arias Navarro", "Pacheco Diaz", "Villanueva Soto",
                                                        "Benites Garcia",
                                                        "Cornejo Rios", "Zuniga Medina", "Samaniego Lopez",
                                                        "Paredes Chavez",
                                                        "Alvarado Campos", "Espinoza Leon", "Chirinos Vera",
                                                        "Pinto Acosta",
                                                        "Peralta Quispe", "Noriega Huaman"
                                        },
                                        {
                                                        "Alarcon Rivas", "Bustillos Paredes", "Calderon Soto",
                                                        "Del Carpio Ruiz",
                                                        "Escobar Vega", "Figueroa Torres", "Gamarra Leon",
                                                        "Huertas Castro",
                                                        "Ibarra Flores", "Jauregui Mendoza", "Lazo Herrera",
                                                        "Mori Ramirez",
                                                        "Navarrete Cruz", "Olivares Silva", "Paz Salazar",
                                                        "Quezada Reyes",
                                                        "Roldan Medina", "Sarmiento Diaz", "Tello Navarro",
                                                        "Urbina Morales",
                                                        "Valdivia Rojas"
                                        }
                        };

                        int[] cantidadesEstudiantes = { 22, 26, 24, 30, 21 };
                        int numeroEstudiante = 1;

                        for (int i = 0; i < asignaciones.size(); i++) {
                                AsignacionDocente asignacion = asignaciones.get(i);

                                for (int j = 0; j < cantidadesEstudiantes[i]; j++) {

                                        String codigo = String.format(
                                                        "2026%04d", numeroEstudiante);

                                        String correo = String.format(
                                                        "estudiante%03d@demo.edu.pe", numeroEstudiante);

                                        Estudiante estudiante = crearEstudiante(
                                                        codigo,
                                                        nombresPorCurso[i][j],
                                                        apellidosPorCurso[i][j],
                                                        correo);

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
