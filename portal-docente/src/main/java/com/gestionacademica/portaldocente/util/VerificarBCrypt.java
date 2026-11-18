package com.gestionacademica.portaldocente.util;

import java.io.Console;
import java.util.Arrays;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class VerificarBCrypt {

    public static void main(String[] args) {

        Console console = System.console();

        if (console == null) {
            System.err.println("No se puede acceder a la consola segura.");
            return;
        }

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

        char[] caracteres = console.readPassword("Introduce la contraseña elegida: ");

        if (caracteres == null || caracteres.length == 0) {
            System.err.println("La contraseña no puede estar vacía.");
            return;
        }

        try {
            String contrasena = new String(caracteres);

            String hash = args.length > 0 ? args[0] : "";

            System.out.println(
                encoder.matches(contrasena, hash)
                    ? "RESULTADO: La contraseña coincide con el hash."
                    : "RESULTADO: La contraseña NO coincide con el hash."
            );

        } finally {
            Arrays.fill(caracteres, '\0');
        }
    }
}