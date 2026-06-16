package com.integrador.chantilly.carrito.controller;

import com.integrador.chantilly.carrito.dto.CarritoDTO;
import com.integrador.chantilly.carrito.dto.CarritoItemDTO;
import com.integrador.chantilly.carrito.service.CarritoService;
import com.integrador.chantilly.usuario.entity.Usuario;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/carrito")
public class CarritoController {

    private final CarritoService carritoService;
    private final UsuarioRepository usuarioRepository;

    public CarritoController(CarritoService carritoService, UsuarioRepository usuarioRepository) {
        this.carritoService = carritoService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public ResponseEntity<CarritoDTO> obtenerCarrito() {
        return ResponseEntity.ok(carritoService.obtenerCarrito(obtenerUsuarioIdDesdeJwt()));
    }

    @PostMapping("/items")
    public ResponseEntity<CarritoDTO> agregarItem(@RequestBody CarritoItemDTO itemDto) {
        return ResponseEntity.ok(carritoService.agregarItem(obtenerUsuarioIdDesdeJwt(), itemDto));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CarritoDTO> actualizarCantidad(@PathVariable Integer itemId, @RequestBody Map<String, Integer> body) {
        Integer cantidad = body.get("cantidad");
        return ResponseEntity.ok(carritoService.actualizarCantidad(obtenerUsuarioIdDesdeJwt(), itemId, cantidad));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CarritoDTO> eliminarItem(@PathVariable Integer itemId) {
        return ResponseEntity.ok(carritoService.eliminarItem(obtenerUsuarioIdDesdeJwt(), itemId));
    }

    @DeleteMapping
    public ResponseEntity<Void> vaciarCarrito() {
        carritoService.vaciarCarrito(obtenerUsuarioIdDesdeJwt());
        return ResponseEntity.noContent().build();
    }

    private Integer obtenerUsuarioIdDesdeJwt() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return usuario.getId();
    }
}
