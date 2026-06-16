package com.integrador.chantilly.auth.controller;

import com.integrador.chantilly.auth.dto.AuthResponse;
import com.integrador.chantilly.auth.dto.CurrentSessionResponse;
import com.integrador.chantilly.auth.dto.LoginRequest;
import com.integrador.chantilly.auth.dto.MessageResponse;
import com.integrador.chantilly.auth.dto.RecoverRequest;
import com.integrador.chantilly.auth.dto.RegisterRequest;
import com.integrador.chantilly.auth.service.AuthService;
import com.integrador.chantilly.auth.security.AuthCookieService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AuthCookieService authCookieService;

    public AuthController(AuthService authService, AuthCookieService authCookieService) {
        this.authService = authService;
        this.authCookieService = authCookieService;
    }

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletRequest httpRequest,
                                              HttpServletResponse httpResponse) {
        return ResponseEntity.ok(authService.login(request, fingerprint(httpRequest), httpResponse));
    }

    @PostMapping("/recuperar-password")
    public ResponseEntity<MessageResponse> recuperarPassword(@Valid @RequestBody RecoverRequest request,
                                                             HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.recuperarPassword(request, fingerprint(httpRequest)));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody com.integrador.chantilly.auth.dto.ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(HttpServletRequest request, HttpServletResponse response) {
        return ResponseEntity.ok(authService.logout(resolveToken(request), response));
    }

    @GetMapping("/session")
    public ResponseEntity<CurrentSessionResponse> currentSession(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentSession(authentication));
    }

    @GetMapping("/csrf")
    public ResponseEntity<MessageResponse> csrf(CsrfToken token) {
        return ResponseEntity.ok(new MessageResponse(token.getToken()));
    }

    private String fingerprint(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String resolveToken(HttpServletRequest request) {
        String cookieToken = authCookieService.resolveToken(request);
        if (cookieToken != null && !cookieToken.isBlank()) {
            return cookieToken;
        }
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
