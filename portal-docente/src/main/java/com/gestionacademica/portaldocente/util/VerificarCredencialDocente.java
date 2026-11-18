
package com.gestionacademica.portaldocente.util;

import java.io.Console;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Arrays;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class VerificarCredencialDocente {

    public static void main(String[] args) {

        Console console = System.console();

        if (console == null) {
            System.err.println("No se puede acceder a la consola segura.");
            return;
        }

        String passwordBD = System.getenv("PORTAL_DB_PASSWORD");

        if (passwordBD == null || passwordBD.isBlank()) {
            System.err.println("No está disponible PORTAL_DB_PASSWORD.");
            return;
        }

        String url = "jdbc:sqlserver://localhost;"
                + "instanceName=SQLEXPRESS;"
                + "databaseName=PortalDocenteDB;"
                + "encrypt=true;"
                + "trustServerCertificate=true";

        String sql = """
                SELECT correo, contrasena, activo
                FROM dbo.docentes
                WHERE id = ?
                """;

        char[] caracteres = console.readPassword(
                "Introduce la contraseña del docente: ");

        if (caracteres == null || caracteres.length == 0) {
            System.err.println("La contraseña está vacía.");
            return;
        }

        try {
            String contrasena = new String(caracteres);

            try (Connection conexion = DriverManager.getConnection(
                    url, "portal_app", passwordBD);
                 PreparedStatement consulta = conexion.prepareStatement(sql)) {

                consulta.setLong(1, 1L);

                try (ResultSet resultado = consulta.executeQuery()) {

                    if (!resultado.next()) {
                        System.out.println("No existe el docente con ID 1.");
                        return;
                    }

                    String correo = resultado.getString("correo");
                    String hash = resultado.getString("contrasena");
                    boolean activo = resultado.getBoolean("activo");

                    BCryptPasswordEncoder encoder =
                            new BCryptPasswordEncoder(12);

                    boolean coincide = encoder.matches(contrasena, hash);

                    System.out.println("\n--- RESULTADO ---");
                    System.out.println("Correo: " + correo);
                    System.out.println("Cuenta activa: " + activo);
                    System.out.println("Longitud del hash: " + hash.length());
                    System.out.println("Prefijo BCrypt: " + hash.substring(0, 7));
                    System.out.println("Contraseña coincide: " + coincide);
                }
            }

        } catch (Exception e) {
            System.err.println("Error durante la verificación: "
                    + e.getClass().getSimpleName());
        } finally {
            Arrays.fill(caracteres, '\0');
        }
    }
}
