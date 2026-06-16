package com.integrador.chantilly.auth.service;

import com.integrador.chantilly.auth.dto.AuthResponse;
import com.integrador.chantilly.auth.dto.CurrentSessionResponse;
import com.integrador.chantilly.auth.dto.LoginRequest;
import com.integrador.chantilly.auth.dto.MessageResponse;
import com.integrador.chantilly.auth.dto.RecoverRequest;
import com.integrador.chantilly.auth.dto.RegisterRequest;
import com.integrador.chantilly.auth.dto.ResetPasswordRequest;
import com.integrador.chantilly.auth.security.AuthCookieService;
import com.integrador.chantilly.shared.security.JwtUtil;
import com.integrador.chantilly.shared.security.TokenBlacklistService;
import com.integrador.chantilly.usuario.entity.Role;
import com.integrador.chantilly.usuario.entity.Usuario;
import com.integrador.chantilly.usuario.repository.RoleRepository;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;
    private final AuthRateLimitService authRateLimitService;
    private final AuthCookieService authCookieService;

    @Value("${app.auth.recovery.expose-token:false}")
    private boolean exposeRecoveryToken;

    public AuthService(UsuarioRepository usuarioRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       TokenBlacklistService tokenBlacklistService,
                       AuthRateLimitService authRateLimitService,
                       AuthCookieService authCookieService) {
        this.usuarioRepository = usuarioRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.tokenBlacklistService = tokenBlacklistService;
        this.authRateLimitService = authRateLimitService;
        this.authCookieService = authCookieService;
    }

    public MessageResponse register(RegisterRequest req) {
        if (usuarioRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("El email ya esta registrado");
        }

        Role rolCliente = roleRepository.findByNombre("CLIENTE")
                .orElseThrow(() -> new RuntimeException("Rol CLIENTE no configurado"));

        Usuario usuario = new Usuario();
        usuario.setNombre(req.getNombre());
        usuario.setApellido(req.getApellido());
        usuario.setEmail(req.getEmail());
        usuario.setTelefono(req.getTelefono());
        usuario.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        usuario.setActivo(true);
        usuario.setRol(rolCliente);

        usuarioRepository.save(usuario);

        return new MessageResponse("Usuario registrado exitosamente");
    }

    public AuthResponse login(LoginRequest req, String requestFingerprint, HttpServletResponse response) {
        String normalizedEmail = req.getEmail().trim().toLowerCase();
        String ipSubject = requestFingerprint;
        String credentialSubject = requestFingerprint + "|" + normalizedEmail;
        authRateLimitService.assertAllowed("LOGIN_IP", ipSubject);
        authRateLimitService.assertAllowed("LOGIN_CREDENTIAL", credentialSubject);

        Usuario usuario = usuarioRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> invalidCredentials(ipSubject, credentialSubject));

        if (!passwordEncoder.matches(req.getPassword(), usuario.getPasswordHash())) {
            throw invalidCredentials(ipSubject, credentialSubject);
        }
        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            authRateLimitService.recordFailure("LOGIN_IP", ipSubject);
            authRateLimitService.recordFailure("LOGIN_CREDENTIAL", credentialSubject);
            throw new RuntimeException("Usuario inactivo");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("id", usuario.getId());
        claims.put("rol", usuario.getRol().getNombre());

        UserDetails userDetails = org.springframework.security.core.userdetails.User.withUsername(usuario.getEmail())
                .password(usuario.getPasswordHash())
                .authorities(usuario.getRol().getNombre())
                .build();

        String token = jwtUtil.generateToken(userDetails, claims);
        authCookieService.writeAuthCookie(response, token);
        authRateLimitService.recordSuccess("LOGIN_IP", ipSubject);
        authRateLimitService.recordSuccess("LOGIN_CREDENTIAL", credentialSubject);

        return new AuthResponse(
                null,
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().getNombre()
        );
    }

    public MessageResponse recuperarPassword(RecoverRequest req, String requestFingerprint) {
        String normalizedEmail = req.getEmail().trim().toLowerCase();
        authRateLimitService.assertAllowed("RECOVERY_IP", requestFingerprint);
        authRateLimitService.recordAttempt("RECOVERY_IP", requestFingerprint);

        usuarioRepository.findByEmail(normalizedEmail).ifPresent(usuario -> {
            usuario.setTokenRecuperacion(UUID.randomUUID().toString());
            usuario.setTokenExpiracion(LocalDateTime.now().plusHours(1));
            usuarioRepository.save(usuario);
        });

        if (exposeRecoveryToken) {
            Usuario usuario = usuarioRepository.findByEmail(normalizedEmail).orElse(null);
            return new MessageResponse(usuario != null ? usuario.getTokenRecuperacion() : "NO_TOKEN");
        }
        return new MessageResponse("Si el correo existe, se envio un enlace de recuperacion");
    }

    public MessageResponse resetPassword(ResetPasswordRequest req) {
        Usuario usuario = usuarioRepository.findByTokenRecuperacion(req.getToken())
                .orElseThrow(() -> new RuntimeException("Enlace invalido o expirado"));

        if (usuario.getTokenExpiracion() == null || usuario.getTokenExpiracion().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El enlace de recuperacion ha expirado");
        }

        usuario.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        usuario.setTokenRecuperacion(null);
        usuario.setTokenExpiracion(null);

        usuarioRepository.save(usuario);
        return new MessageResponse("Contrasena actualizada exitosamente");
    }

    public MessageResponse logout(String token, HttpServletResponse response) {
        if (token == null || token.isBlank()) {
            authCookieService.clearAuthCookie(response);
            return new MessageResponse("Sesion cerrada correctamente");
        }
        Claims claims = jwtUtil.extractAllClaims(token);
        tokenBlacklistService.blacklistToken(token, claims.getExpiration());
        authCookieService.clearAuthCookie(response);
        return new MessageResponse("Sesion cerrada correctamente");
    }

    public CurrentSessionResponse getCurrentSession(Authentication authentication) {
        Usuario usuario = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return new CurrentSessionResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().getNombre()
        );
    }

    private RuntimeException invalidCredentials(String ipSubject, String credentialSubject) {
        authRateLimitService.recordFailure("LOGIN_IP", ipSubject);
        authRateLimitService.recordFailure("LOGIN_CREDENTIAL", credentialSubject);
        return new RuntimeException("Credenciales invalidas");
    }
}
