package com.gestionacademica.portaldocente.util;

import java.io.Console;
import java.util.Arrays;

public class GeneradorBCrypt {

    public static void main(String[] args) {

        Console console = System.console();

        if (console == null) {
            System.err.println("No se puede acceder a la consola segura.");
            return;
        }

        char[] caracteres = console.readPassword(
            "Introduce una contraseña de prueba: "
        );

        if (caracteres == null) {
            System.out.println("No se recibió ningún valor.");
            return;
        }

        try {
            System.out.println("Longitud capturada: " + caracteres.length);
            System.out.println("¿Está vacía?: " + (caracteres.length == 0));

        } finally {
            Arrays.fill(caracteres, '\0');
        }
    }
}