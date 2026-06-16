package com.integrador.chantilly.pago.controller;

import com.integrador.chantilly.pago.dto.ActualizarEstadoPagoRequest;
import com.integrador.chantilly.pago.dto.PagoDTO;
import com.integrador.chantilly.pago.service.PagoService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoService pagoService;
    private final UsuarioRepository usuarioRepository;

    public PagoController(PagoService pagoService, UsuarioRepository usuarioRepository) {
        this.pagoService = pagoService;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping
    public ResponseEntity<PagoDTO> registrarPago(@RequestParam Integer pedidoId,
                                                 @RequestBody PagoDTO dto,
                                                 Authentication authentication) {
        PagoDTO pago = pagoService.registrarPago(obtenerUsuarioId(authentication), pedidoId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(pago);
    }

    @PutMapping("/{id}/confirmar")
    public ResponseEntity<PagoDTO> confirmarPago(@PathVariable Integer id,
                                                 Authentication authentication) {
        return ResponseEntity.ok(pagoService.actualizarEstadoPago(id, "CONFIRMADO", null, obtenerUsuarioId(authentication)));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<PagoDTO> actualizarEstadoPago(@PathVariable Integer id,
                                                        @RequestBody ActualizarEstadoPagoRequest request,
                                                        Authentication authentication) {
        return ResponseEntity.ok(
                pagoService.actualizarEstadoPago(id, request.getEstadoPago(), request.getReferencia(), obtenerUsuarioId(authentication))
        );
    }

    @GetMapping
    public ResponseEntity<List<PagoDTO>> listarPagos(@RequestParam(required = false) String estado,
                                                     @RequestParam(required = false) String metodo) {
        return ResponseEntity.ok(pagoService.listarPagos(estado, metodo));
    }

    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<PagoDTO> obtenerPorPedido(@PathVariable Integer pedidoId,
                                                    Authentication authentication) {
        return ResponseEntity.ok(pagoService.obtenerPorPedido(pedidoId, obtenerUsuarioId(authentication)));
    }

    private Integer obtenerUsuarioId(Authentication authentication) {
        String email = authentication.getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                .getId();
    }
}
