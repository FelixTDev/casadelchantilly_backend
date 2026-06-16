package com.integrador.chantilly.notificacion.controller;

import com.integrador.chantilly.notificacion.dto.NotificacionDTO;
import com.integrador.chantilly.notificacion.service.NotificacionService;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    private final NotificacionService notificacionService;
    private final UsuarioRepository usuarioRepository;

    public NotificacionController(NotificacionService notificacionService, UsuarioRepository usuarioRepository) {
        this.notificacionService = notificacionService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public ResponseEntity<List<NotificacionDTO>> listarPorUsuario(Authentication authentication) {
        return ResponseEntity.ok(notificacionService.listarPorUsuario(obtenerUsuarioId(authentication)));
    }

    @PutMapping("/{id}/leer")
    public ResponseEntity<Void> marcarLeida(@PathVariable Integer id) {
        notificacionService.marcarLeida(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/leer-todas")
    public ResponseEntity<Void> marcarTodasLeidas(Authentication authentication) {
        notificacionService.marcarTodasLeidas(obtenerUsuarioId(authentication));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/no-leidas")
    public ResponseEntity<Map<String, Long>> contarNoLeidas(Authentication authentication) {
        long total = notificacionService.contarNoLeidas(obtenerUsuarioId(authentication));
        return ResponseEntity.ok(Map.of("total", total));
    }

    private Integer obtenerUsuarioId(Authentication authentication) {
        String email = authentication.getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getId();
    }
}
