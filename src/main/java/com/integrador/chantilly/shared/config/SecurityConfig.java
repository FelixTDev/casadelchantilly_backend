package com.integrador.chantilly.shared.config;

import com.integrador.chantilly.shared.security.JwtFilter;
import com.integrador.chantilly.shared.security.RestAccessDeniedHandler;
import com.integrador.chantilly.shared.security.RestAuthenticationEntryPoint;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;
    private final boolean secureCsrfCookie;
    private final String csrfCookieSameSite;

    public SecurityConfig(JwtFilter jwtFilter,
                          @Value("${app.csrf.cookie.secure:false}") boolean secureCsrfCookie,
                          @Value("${app.csrf.cookie.same-site:Lax}") String csrfCookieSameSite,
                          RestAuthenticationEntryPoint authenticationEntryPoint,
                          RestAccessDeniedHandler accessDeniedHandler) {
        this.jwtFilter = jwtFilter;
        this.secureCsrfCookie = secureCsrfCookie;
        this.csrfCookieSameSite = csrfCookieSameSite;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfTokenRepository.setCookieCustomizer(builder -> builder
                .sameSite(csrfCookieSameSite)
                .secure(secureCsrfCookie));

        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfTokenRepository)
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                        .ignoringRequestMatchers(
                                "/actuator/**",
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/recuperar-password",
                                "/api/auth/reset-password"
                        )
                )
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/actuator/health",
                                "/actuator/health/**",
                                "/actuator/info"
                        ).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/recuperar-password",
                                "/api/auth/reset-password"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/csrf").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/productos/**", "/api/categorias/**", "/api/promociones/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/productos/**", "/api/categorias/**", "/api/promociones/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/productos/**", "/api/categorias/**", "/api/promociones/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/productos/**", "/api/categorias/**", "/api/promociones/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/pedidos").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/pedidos/*/estado").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/pagos").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/pagos/*/confirmar").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/pagos/*/estado").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/reclamos").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/reclamos/*/resolver").hasAuthority("ADMIN")
                        .requestMatchers("/api/reportes/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/usuarios/admin/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/usuarios/**").authenticated()
                        .requestMatchers("/api/carrito/**").authenticated()
                        .requestMatchers("/api/pedidos/**").authenticated()
                        .requestMatchers("/api/pagos/**").authenticated()
                        .requestMatchers("/api/reclamos/**").authenticated()
                        .requestMatchers("/api/notificaciones/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/auth/session").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
