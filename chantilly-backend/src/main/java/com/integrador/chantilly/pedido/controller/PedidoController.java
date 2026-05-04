package com.integrador.chantilly.pedido.controller;

import com.integrador.chantilly.pedido.dto.CrearPedidoRequest;
import com.integrador.chantilly.pedido.dto.PedidoDTO;
import com.integrador.chantilly.pedido.service.BoletaService;
import com.integrador.chantilly.pedido.service.PedidoService;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;
    private final BoletaService boletaService;
    private final UsuarioRepository usuarioRepository;

    public PedidoController(PedidoService pedidoService, BoletaService boletaService, UsuarioRepository usuarioRepository) {
        this.pedidoService = pedidoService;
        this.boletaService = boletaService;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping
    public ResponseEntity<PedidoDTO> crearDesdeCarrito(@Valid @RequestBody CrearPedidoRequest request,
                                                        Authentication authentication) {
        PedidoDTO pedido = pedidoService.crearDesdeCarrito(obtenerUsuarioId(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(pedido);
    }

    @GetMapping("/mis-pedidos")
    public ResponseEntity<List<PedidoDTO>> listarPorUsuario(Authentication authentication) {
        return ResponseEntity.ok(pedidoService.listarPorUsuario(obtenerUsuarioId(authentication)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoDTO> obtenerPorId(@PathVariable Integer id, Authentication authentication) {
        return ResponseEntity.ok(pedidoService.obtenerPorId(id, obtenerUsuarioId(authentication)));
    }

    @GetMapping
    public ResponseEntity<List<PedidoDTO>> listarTodos() {
        return ResponseEntity.ok(pedidoService.listarTodos());
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<PedidoDTO> cambiarEstado(@PathVariable Integer id,
                                                   @RequestBody Map<String, String> body,
                                                   Authentication authentication) {
        String estado = body.get("estado");
        return ResponseEntity.ok(pedidoService.cambiarEstado(id, estado, obtenerUsuarioId(authentication)));
    }

    @DeleteMapping("/{id}/cancelar")
    public ResponseEntity<Void> cancelarPedido(@PathVariable Integer id, Authentication authentication) {
        pedidoService.cancelarPedido(id, obtenerUsuarioId(authentication));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/boleta")
    public ResponseEntity<byte[]> descargarBoleta(@PathVariable Integer id) {
        byte[] pdf = boletaService.generarBoleta(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "boleta-" + id + ".pdf");
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    private Integer obtenerUsuarioId(Authentication authentication) {
        String email = authentication.getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getId();
    }
}
