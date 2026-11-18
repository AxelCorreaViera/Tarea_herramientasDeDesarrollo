package com.gestionacademica.portaldocente.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gestionacademica.portaldocente.model.Docente;
import com.gestionacademica.portaldocente.repository.DocenteRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final DocenteRepository docenteRepository;

    public CustomUserDetailsService(DocenteRepository docenteRepository) {
        this.docenteRepository = docenteRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String correo)
            throws UsernameNotFoundException {

        Docente docente = docenteRepository.findByCorreoIgnoreCase(correo)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Credenciales inválidas."));

        return new DocentePrincipal(docente);
    }
}