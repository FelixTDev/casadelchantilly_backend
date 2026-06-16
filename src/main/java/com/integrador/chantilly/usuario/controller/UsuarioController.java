package com.integrador.chantilly.usuario.controller;

import com.integrador.chantilly.usuario.dto.DireccionDTO;
import com.integrador.chantilly.usuario.dto.UsuarioAdminUpdateDTO;
import com.integrador.chantilly.usuario.dto.CambiarPasswordDTO;
import com.integrador.chantilly.usuario.dto.UsuarioPerfilDTO;
import com.integrador.chantilly.usuario.entity.Usuario;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import com.integrador.chantilly.usuario.service.UsuarioAdminService;
import com.integrador.chantilly.usuario.service.UsuarioPerfilService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioPerfilService perfilService;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioAdminService adminService;

    public UsuarioController(UsuarioPerfilService perfilService, UsuarioRepository usuarioRepository, UsuarioAdminService adminService) {
        this.perfilService = perfilService;
        this.usuarioRepository = usuarioRepository;
        this.adminService = adminService;
    }

    @GetMapping("/admin/listado")
    public ResponseEntity<List<Map<String, Object>>> listarTodos() {
        List<Map<String, Object>> lista = usuarioRepository.findAll().stream().map(this::toAdminMap).toList();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/admin/listado/paginado")
    public ResponseEntity<Page<Map<String, Object>>> listarPaginado(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Map<String, Object>> resultado = usuarioRepository.findAll(pageable).map(this::toAdminMap);
        return ResponseEntity.ok(resultado);
    }

    private Map<String, Object> toAdminMap(Usuario u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.getId());
        m.put("nombre", u.getNombre());
        m.put("apellido", u.getApellido());
        m.put("email", u.getEmail());
        m.put("telefono", u.getTelefono());
        m.put("rol", u.getRol() != null ? u.getRol().getNombre() : "");
        m.put("activo", u.getActivo());
        m.put("creadoEn", u.getCreadoEn());
        return m;
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<Void> actualizarUsuario(@PathVariable Integer id,
                                                  @Valid @RequestBody UsuarioAdminUpdateDTO dto,
                                                  Authentication auth) {
        adminService.actualizarUsuario(id, dto, obtenerUsuarioId(auth));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/admin/{id}/estado")
    public ResponseEntity<Void> cambiarEstadoUsuario(@PathVariable Integer id,
                                                     @RequestBody Map<String, Boolean> body,
                                                     Authentication auth) {
        Boolean activo = body.get("activo");
        if (activo == null) {
            throw new RuntimeException("El campo 'activo' es obligatorio");
        }
        adminService.cambiarEstado(id, activo, obtenerUsuarioId(auth));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/perfil")
    public ResponseEntity<UsuarioPerfilDTO> obtenerPerfil(Authentication auth) {
        return ResponseEntity.ok(perfilService.obtenerPerfil(auth.getName()));
    }

    @PutMapping("/perfil")
    public ResponseEntity<Void> actualizarPerfil(Authentication auth, @Valid @RequestBody UsuarioPerfilDTO dto) {
        perfilService.actualizarPerfil(auth.getName(), dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/perfil/password")
    public ResponseEntity<Void> cambiarPassword(Authentication auth, @Valid @RequestBody CambiarPasswordDTO dto) {
        perfilService.cambiarPassword(auth.getName(), dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/direcciones")
    public ResponseEntity<List<DireccionDTO>> listarDirecciones(Authentication auth) {
        return ResponseEntity.ok(perfilService.listarDirecciones(auth.getName()));
    }

    @PostMapping("/direcciones")
    public ResponseEntity<DireccionDTO> agregarDireccion(Authentication auth, @Valid @RequestBody DireccionDTO dto) {
        return ResponseEntity.ok(perfilService.agregarDireccion(auth.getName(), dto));
    }

    @PutMapping("/direcciones/{id}")
    public ResponseEntity<DireccionDTO> actualizarDireccion(Authentication auth,
                                                           @PathVariable Integer id,
                                                           @Valid @RequestBody DireccionDTO dto) {
        return ResponseEntity.ok(perfilService.actualizarDireccion(auth.getName(), id, dto));
    }

    @DeleteMapping("/direcciones/{id}")
    public ResponseEntity<Void> eliminarDireccion(Authentication auth, @PathVariable Integer id) {
        perfilService.eliminarDireccion(auth.getName(), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioPerfilDTO> obtenerMiPerfilCompat(Authentication auth) {
        return obtenerPerfil(auth);
    }

    @PutMapping("/me")
    public ResponseEntity<Void> actualizarMiPerfilCompat(Authentication auth, @Valid @RequestBody UsuarioPerfilDTO dto) {
        return actualizarPerfil(auth, dto);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> cambiarPasswordCompat(Authentication auth, @Valid @RequestBody CambiarPasswordDTO dto) {
        return cambiarPassword(auth, dto);
    }

    @PostMapping("/me/direcciones")
    public ResponseEntity<DireccionDTO> agregarDireccionCompat(Authentication auth, @Valid @RequestBody DireccionDTO dto) {
        return agregarDireccion(auth, dto);
    }

    @DeleteMapping("/me/direcciones/{id}")
    public ResponseEntity<Void> eliminarDireccionCompat(Authentication auth, @PathVariable Integer id) {
        return eliminarDireccion(auth, id);
    }

    private Integer obtenerUsuarioId(Authentication auth) {
        return usuarioRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getId();
    }
}
