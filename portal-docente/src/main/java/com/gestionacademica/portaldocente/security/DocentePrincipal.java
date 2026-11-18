package com.gestionacademica.portaldocente.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.gestionacademica.portaldocente.model.Docente;

public class DocentePrincipal implements UserDetails {

    private final Long id;
    private final String correo;
    private final String contrasena;
    private final String nombres;
    private final String apellidos;
    private final boolean activo;

    public DocentePrincipal(Docente docente) {
        this.id = docente.getId();
        this.correo = docente.getCorreo();
        this.contrasena = docente.getContrasena();
        this.nombres = docente.getNombres();
        this.apellidos = docente.getApellidos();
        this.activo = docente.isActivo();
    }

    public Long getId() {
        return id;
    }

    public String getCorreo() {
        return correo;
    }

    public String getNombres() {
        return nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_DOCENTE"));
    }

    @Override
    public String getPassword() {
        return contrasena;
    }

    @Override
    public String getUsername() {
        return correo;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return activo;
    }
}