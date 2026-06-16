package com.integrador.chantilly.promocion.controller;

import com.integrador.chantilly.promocion.dto.PromocionDTO;
import com.integrador.chantilly.promocion.service.PromocionService;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/promociones")
public class PromocionController {

    private final PromocionService promocionService;
    private final UsuarioRepository usuarioRepository;

    public PromocionController(PromocionService promocionService, UsuarioRepository usuarioRepository) {
        this.promocionService = promocionService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public ResponseEntity<List<PromocionDTO>> listarActivas() {
        return ResponseEntity.ok(promocionService.listarActivas());
    }

    @GetMapping("/admin/listado")
    public ResponseEntity<List<PromocionDTO>> listarTodasAdmin() {
        return ResponseEntity.ok(promocionService.listarTodasAdmin());
    }

    @PostMapping
    public ResponseEntity<PromocionDTO> crear(@RequestBody PromocionDTO dto, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(promocionService.crear(dto, obtenerUsuarioId(authentication)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromocionDTO> actualizar(@PathVariable Integer id, @RequestBody PromocionDTO dto, Authentication authentication) {
        return ResponseEntity.ok(promocionService.actualizar(id, dto, obtenerUsuarioId(authentication)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Integer id, Authentication authentication) {
        promocionService.desactivar(id, obtenerUsuarioId(authentication));
        return ResponseEntity.noContent().build();
    }

    private Integer obtenerUsuarioId(Authentication authentication) {
        String email = authentication.getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getId();
    }
}
