
package com.example.backend.service;

import com.example.backend.model.Estudiante;
import com.example.backend.repository.EstudianteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EstudianteService {

    private final EstudianteRepository repository;

    public EstudianteService(EstudianteRepository repository) {
        this.repository = repository;
    }

    public List<Estudiante> listar() {
        return repository.findAll();
    }

    public Estudiante buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Estudiante no encontrado"));
    }

    public Estudiante guardar(Estudiante estudiante) {
        if (repository.existsByCodigo(estudiante.getCodigo())) {
            throw new RuntimeException("El código ya está registrado");
        }

        return repository.save(estudiante);
    }

    public Estudiante actualizar(Long id, Estudiante datos) {
        Estudiante estudiante = buscar(id);

        if (!estudiante.getCodigo().equals(datos.getCodigo())
                && repository.existsByCodigo(datos.getCodigo())) {
            throw new RuntimeException("El código ya está registrado");
        }

        estudiante.setCodigo(datos.getCodigo());
        estudiante.setDni(datos.getDni());
        estudiante.setNombre(datos.getNombre());
        estudiante.setApellido(datos.getApellido());
        estudiante.setCorreo(datos.getCorreo());
        estudiante.setTelefono(datos.getTelefono());
        estudiante.setFechaNacimiento(datos.getFechaNacimiento());
        estudiante.setCarrera(datos.getCarrera());
        estudiante.setCiclo(datos.getCiclo());
        estudiante.setTurno(datos.getTurno());
        estudiante.setModalidad(datos.getModalidad());

        return repository.save(estudiante);
    }

    public void eliminar(Long id) {
        Estudiante estudiante = buscar(id);
        repository.delete(estudiante);
    }
}
