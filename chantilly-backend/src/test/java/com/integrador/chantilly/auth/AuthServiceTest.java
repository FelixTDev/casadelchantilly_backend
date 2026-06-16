package com.integrador.chantilly.auth;

import com.integrador.chantilly.auth.dto.LoginRequest;
import com.integrador.chantilly.auth.dto.RecoverRequest;
import com.integrador.chantilly.auth.dto.RegisterRequest;
import com.integrador.chantilly.auth.security.AuthCookieService;
import com.integrador.chantilly.auth.service.AuthRateLimitService;
import com.integrador.chantilly.auth.service.AuthService;
import com.integrador.chantilly.shared.security.JwtUtil;
import com.integrador.chantilly.shared.security.TokenBlacklistService;
import com.integrador.chantilly.usuario.entity.Role;
import com.integrador.chantilly.usuario.entity.Usuario;
import com.integrador.chantilly.usuario.repository.RoleRepository;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private TokenBlacklistService tokenBlacklistService;
    @Mock
    private AuthRateLimitService authRateLimitService;
    @Mock
    private AuthCookieService authCookieService;
    @Mock
    private HttpServletResponse response;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                usuarioRepository,
                roleRepository,
                passwordEncoder,
                jwtUtil,
                tokenBlacklistService,
                authRateLimitService,
                authCookieService
        );
        ReflectionTestUtils.setField(authService, "exposeRecoveryToken", false);
    }

    @Test
    void registerRejectsDuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("duplicado@test.com");

        when(usuarioRepository.existsByEmail("duplicado@test.com")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.register(request));

        assertEquals("El email ya esta registrado", exception.getMessage());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void loginRejectsInactiveUsers() {
        LoginRequest request = new LoginRequest();
        request.setEmail("cliente@test.com");
        request.setPassword("clave123");

        Usuario usuario = new Usuario();
        usuario.setEmail("cliente@test.com");
        usuario.setPasswordHash("hashed");
        usuario.setActivo(false);
        usuario.setRol(new Role("CLIENTE"));

        when(usuarioRepository.findByEmail("cliente@test.com")).thenReturn(Optional.of(usuario));
        when(passwordEncoder.matches("clave123", "hashed")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.login(request, "127.0.0.1", response));

        assertEquals("Usuario inactivo", exception.getMessage());
    }

    @Test
    void recoveryDoesNotExposeTokenWhenDisabled() {
        RecoverRequest request = new RecoverRequest();
        request.setEmail("cliente@test.com");

        Usuario usuario = new Usuario();
        usuario.setEmail("cliente@test.com");

        when(usuarioRepository.findByEmail("cliente@test.com")).thenReturn(Optional.of(usuario));

        String message = authService.recuperarPassword(request, "127.0.0.1").getMensaje();

        assertEquals("Si el correo existe, se envio un enlace de recuperacion", message);
    }
}
