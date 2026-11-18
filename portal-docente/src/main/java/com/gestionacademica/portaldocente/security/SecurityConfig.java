package com.gestionacademica.portaldocente.security;

import java.util.function.Supplier;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;
import org.springframework.util.StringUtils;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder);

        return provider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            DaoAuthenticationProvider authenticationProvider)
            throws Exception {

        http
            .authenticationProvider(authenticationProvider)

            .csrf(csrf -> csrf
                .csrfTokenRepository(
                    CookieCsrfTokenRepository.withHttpOnlyFalse()
                )
                .csrfTokenRequestHandler(
                    new SpaCsrfTokenRequestHandler()
                )
            )

            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/login.html",
                    "/login.css",
                    "/login.js",
                    "/error"
                ).permitAll()
                .anyRequest().authenticated()
            )

            .formLogin(form -> form
                .loginPage("/login.html")
                .loginProcessingUrl("/login")
                .failureUrl("/login.html?error")
                .defaultSuccessUrl("/portal-docente.html", true)
                .permitAll()
            )

            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login.html?logout")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID", "XSRF-TOKEN")
                .permitAll()
            )

            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .sessionFixation(fixation -> fixation.migrateSession())
            );

        return http.build();
    }

    /**
     * Gestiona los tokens CSRF para permitir su uso desde el frontend.
     * Mantiene la protección XOR para los atributos de las peticiones
     * y acepta el token original enviado mediante el encabezado HTTP.
     */
    private static final class SpaCsrfTokenRequestHandler
            implements CsrfTokenRequestHandler {

        private final CsrfTokenRequestHandler plain =
                new CsrfTokenRequestAttributeHandler();

        private final CsrfTokenRequestHandler xor =
                new XorCsrfTokenRequestAttributeHandler();

        @Override
        public void handle(
                HttpServletRequest request,
                HttpServletResponse response,
                Supplier<CsrfToken> csrfToken) {

            this.xor.handle(request, response, csrfToken);

            // Fuerza la generación de la cookie CSRF.
            csrfToken.get();
        }

        @Override
        public String resolveCsrfTokenValue(
                HttpServletRequest request,
                CsrfToken csrfToken) {

            String headerValue =
                    request.getHeader(csrfToken.getHeaderName());

            CsrfTokenRequestHandler handler =
                    StringUtils.hasText(headerValue)
                            ? this.plain
                            : this.xor;

            return handler.resolveCsrfTokenValue(request, csrfToken);
        }
    }
}
