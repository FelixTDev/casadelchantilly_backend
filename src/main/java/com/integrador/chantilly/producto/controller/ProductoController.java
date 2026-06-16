package com.integrador.chantilly.producto.controller;

import com.integrador.chantilly.producto.dto.ProductoDTO;
import com.integrador.chantilly.producto.service.ProductoService;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;
    private final UsuarioRepository usuarioRepository;

    public ProductoController(ProductoService productoService, UsuarioRepository usuarioRepository) {
        this.productoService = productoService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public ResponseEntity<List<ProductoDTO>> listarTodos() {
        return ResponseEntity.ok(productoService.listarTodos());
    }

    @GetMapping("/admin/listado")
    public ResponseEntity<List<ProductoDTO>> listarTodosAdmin() {
        return ResponseEntity.ok(productoService.listarTodosAdmin());
    }

    @GetMapping("/paginado")
    public ResponseEntity<Page<ProductoDTO>> listarPaginado(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("nombre").ascending());
        return ResponseEntity.ok(productoService.listarPaginado(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(productoService.obtenerPorId(id));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<ProductoDTO>> buscarPorNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(productoService.buscarPorNombre(nombre));
    }

    @GetMapping("/categoria/{id}")
    public ResponseEntity<List<ProductoDTO>> listarPorCategoria(@PathVariable("id") Integer categoriaId) {
        return ResponseEntity.ok(productoService.listarPorCategoria(categoriaId));
    }

    @PostMapping
    public ResponseEntity<ProductoDTO> crear(@RequestBody ProductoDTO dto, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.crear(dto, obtenerUsuarioId(authentication)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoDTO> actualizar(@PathVariable Integer id, @RequestBody ProductoDTO dto, Authentication authentication) {
        return ResponseEntity.ok(productoService.actualizar(id, dto, obtenerUsuarioId(authentication)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Integer id, Authentication authentication) {
        productoService.desactivar(id, obtenerUsuarioId(authentication));
        return ResponseEntity.noContent().build();
    }

    private Integer obtenerUsuarioId(Authentication authentication) {
        String email = authentication.getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getId();
    }
}
