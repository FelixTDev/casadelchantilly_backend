package com.integrador.chantilly.reclamo.controller;

import com.integrador.chantilly.reclamo.dto.ReclamoDTO;
import com.integrador.chantilly.reclamo.service.ReclamoService;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reclamos")
public class ReclamoController {

    private final ReclamoService reclamoService;
    private final UsuarioRepository usuarioRepository;

    public ReclamoController(ReclamoService reclamoService, UsuarioRepository usuarioRepository) {
        this.reclamoService = reclamoService;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping
    public ResponseEntity<ReclamoDTO> crear(@RequestBody ReclamoDTO dto, Authentication authentication) {
        ReclamoDTO creado = reclamoService.crear(obtenerUsuarioId(authentication), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @GetMapping("/mis-reclamos")
    public ResponseEntity<List<ReclamoDTO>> listarPorUsuario(Authentication authentication) {
        return ResponseEntity.ok(reclamoService.listarPorUsuario(obtenerUsuarioId(authentication)));
    }

    @GetMapping
    public ResponseEntity<List<ReclamoDTO>> listarTodos() {
        return ResponseEntity.ok(reclamoService.listarTodos());
    }

    @PutMapping("/{id}/resolver")
    public ResponseEntity<ReclamoDTO> resolver(@PathVariable Integer id, @RequestBody Map<String, String> body, Authentication authentication) {
        return ResponseEntity.ok(reclamoService.resolver(id, body.get("resolucion"), body.get("tipoSolucion"), obtenerUsuarioId(authentication)));
    }

    private Integer obtenerUsuarioId(Authentication authentication) {
        String email = authentication.getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getId();
    }
}
