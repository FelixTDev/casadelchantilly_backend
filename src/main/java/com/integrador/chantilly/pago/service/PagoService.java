package com.integrador.chantilly.pago.service;

import com.integrador.chantilly.admin.service.AdminActivityLogService;
import com.integrador.chantilly.pago.dto.PagoDTO;
import com.integrador.chantilly.pago.entity.Pago;
import com.integrador.chantilly.pago.repository.PagoRepository;
import com.integrador.chantilly.pedido.entity.HistorialEstado;
import com.integrador.chantilly.pedido.entity.Pedido;
import com.integrador.chantilly.pedido.repository.HistorialEstadoRepository;
import com.integrador.chantilly.pedido.repository.PedidoRepository;
import com.integrador.chantilly.usuario.entity.Usuario;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import com.integrador.chantilly.notificacion.service.NotificacionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class PagoService {
    private static final Set<String> METODOS_VALIDOS = Set.of("EFECTIVO", "TRANSFERENCIA", "YAPE", "PLIN");
    private static final Set<String> ESTADOS_VALIDOS = Set.of("PENDIENTE", "CONFIRMADO", "RECHAZADO", "EXPIRADO", "REEMBOLSADO");
    private static final Set<String> METODOS_CON_REFERENCIA = Set.of("TRANSFERENCIA", "YAPE", "PLIN");
    private static final Map<String, Set<String>> TRANSICIONES_VALIDAS = Map.of(
            "PENDIENTE", Set.of("CONFIRMADO", "RECHAZADO", "EXPIRADO"),
            "CONFIRMADO", Set.of("REEMBOLSADO"),
            "RECHAZADO", Set.of("PENDIENTE"),
            "EXPIRADO", Set.of("PENDIENTE"),
            "REEMBOLSADO", Set.of()
    );

    private final PagoRepository pagoRepository;
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final HistorialEstadoRepository historialEstadoRepository;
    private final NotificacionService notificacionService;
    private final AdminActivityLogService adminActivityLogService;

    public PagoService(PagoRepository pagoRepository,
                       PedidoRepository pedidoRepository,
                       UsuarioRepository usuarioRepository,
                       HistorialEstadoRepository historialEstadoRepository,
                       NotificacionService notificacionService,
                       AdminActivityLogService adminActivityLogService) {
        this.pagoRepository = pagoRepository;
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.historialEstadoRepository = historialEstadoRepository;
        this.notificacionService = notificacionService;
        this.adminActivityLogService = adminActivityLogService;
    }

    @Transactional
    public PagoDTO registrarPago(Integer usuarioId, Integer pedidoId, PagoDTO dto) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (!pedido.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("El pedido no pertenece al usuario");
        }

        String metodoPago = normalizarMetodoPago(dto.getMetodoPago());
        String referencia = limpiarReferencia(dto.getReferencia());
        validarReferenciaSegunMetodo(metodoPago, referencia);

        Pago pago = pagoRepository.findByPedidoId(pedidoId).orElse(new Pago());
        pago.setPedido(pedido);
        pago.setMetodoPago(metodoPago);
        pago.setMonto(pedido.getTotal());
        pago.setReferencia(referencia);
        pago.setEstadoPago("PENDIENTE");
        pago.setFechaPago(LocalDateTime.now());

        return toDto(pagoRepository.save(pago));
    }

    @Transactional
    public PagoDTO confirmarPago(Integer pagoId) {
        return actualizarEstadoPago(pagoId, "CONFIRMADO", null, null);
    }

    public PagoDTO obtenerPorPedido(Integer pedidoId, Integer usuarioId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        if (!pedido.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("El pedido no pertenece al usuario");
        }

        Pago pago = pagoRepository.findByPedidoId(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado para el pedido"));
        return toDto(pago);
    }

    public List<PagoDTO> listarPagos(String estado, String metodo) {
        String estadoNormalizado = estado == null || estado.isBlank() ? null : normalizarEstadoPago(estado);
        String metodoNormalizado = metodo == null || metodo.isBlank() ? null : normalizarMetodoPago(metodo);

        List<Pago> pagos;
        if (estadoNormalizado != null && metodoNormalizado != null) {
            pagos = pagoRepository.findByEstadoPagoAndMetodoPagoOrderByFechaPagoDescIdDesc(estadoNormalizado, metodoNormalizado);
        } else if (estadoNormalizado != null) {
            pagos = pagoRepository.findByEstadoPagoOrderByFechaPagoDescIdDesc(estadoNormalizado);
        } else if (metodoNormalizado != null) {
            pagos = pagoRepository.findByMetodoPagoOrderByFechaPagoDescIdDesc(metodoNormalizado);
        } else {
            pagos = pagoRepository.findAllByOrderByFechaPagoDescIdDesc();
        }

        return pagos.stream().map(this::toDto).toList();
    }

    @Transactional
    public PagoDTO actualizarEstadoPago(Integer pagoId, String nuevoEstado, String nuevaReferencia, Integer adminId) {
        Pago pago = pagoRepository.findById(pagoId)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado"));

        String estadoActual = pago.getEstadoPago() == null ? "PENDIENTE" : pago.getEstadoPago().trim().toUpperCase();
        String estadoNormalizado = normalizarEstadoPago(nuevoEstado);
        validarTransicion(estadoActual, estadoNormalizado);

        String referencia = limpiarReferencia(nuevaReferencia);
        if (referencia != null) {
            pago.setReferencia(referencia);
        }
        validarReferenciaSegunMetodo(pago.getMetodoPago(), pago.getReferencia());

        pago.setEstadoPago(estadoNormalizado);
        if (pago.getFechaPago() == null) {
            pago.setFechaPago(LocalDateTime.now());
        }

        Pago guardado = pagoRepository.save(pago);

        if (adminId != null) {
            Usuario admin = usuarioRepository.findById(adminId)
                    .orElseThrow(() -> new RuntimeException("Administrador no encontrado"));
            registrarHistorialPago(guardado.getPedido(), estadoNormalizado, admin);
            adminActivityLogService.registrar(
                    admin,
                    "PAGOS",
                    "CAMBIAR_ESTADO",
                    "PAGO",
                    guardado.getId(),
                    "Cambió pago de " + guardado.getPedido().getCodigoPedido() + " a " + estadoNormalizado
            );
        }

        notificacionService.crear(
                guardado.getPedido().getUsuario().getId(),
                "Estado de pago actualizado",
                "Tu pago del pedido " + guardado.getPedido().getCodigoPedido() + " ahora figura como " + estadoNormalizado,
                "PEDIDO"
        );

        return toDto(guardado);
    }

    private void registrarHistorialPago(Pedido pedido, String estadoPago, Usuario admin) {
        HistorialEstado historial = new HistorialEstado();
        historial.setPedido(pedido);
        historial.setEstado(pedido.getEstado());
        historial.setComentario("Pago actualizado a " + estadoPago);
        historial.setCambiadoPor(admin);
        historialEstadoRepository.save(historial);
    }

    private String normalizarMetodoPago(String metodoPago) {
        if (metodoPago == null) {
            throw new RuntimeException("Metodo de pago obligatorio");
        }
        String valor = metodoPago.trim().toUpperCase();
        if (!METODOS_VALIDOS.contains(valor)) {
            throw new RuntimeException("Metodo de pago invalido: " + metodoPago);
        }
        return valor;
    }

    private String normalizarEstadoPago(String estadoPago) {
        if (estadoPago == null) {
            throw new RuntimeException("Estado de pago obligatorio");
        }
        String valor = estadoPago.trim().toUpperCase();
        if (!ESTADOS_VALIDOS.contains(valor)) {
            throw new RuntimeException("Estado de pago invalido: " + estadoPago);
        }
        return valor;
    }

    private String limpiarReferencia(String referencia) {
        if (referencia == null) {
            return null;
        }
        String valor = referencia.trim();
        return valor.isBlank() ? null : valor;
    }

    private void validarReferenciaSegunMetodo(String metodoPago, String referencia) {
        String metodo = normalizarMetodoPago(metodoPago);
        if (METODOS_CON_REFERENCIA.contains(metodo) && (referencia == null || referencia.isBlank())) {
            throw new RuntimeException("La referencia o comprobante es obligatoria para " + metodo);
        }
    }

    private void validarTransicion(String estadoActual, String nuevoEstado) {
        if (estadoActual.equals(nuevoEstado)) {
            return;
        }
        if (!TRANSICIONES_VALIDAS.getOrDefault(estadoActual, Set.of()).contains(nuevoEstado)) {
            throw new RuntimeException("Transicion de pago invalida: " + estadoActual + " -> " + nuevoEstado);
        }
    }

    private PagoDTO toDto(Pago pago) {
        PagoDTO dto = new PagoDTO();
        dto.setId(pago.getId());
        dto.setPedidoId(pago.getPedido().getId());
        dto.setCodigoPedido(pago.getPedido().getCodigoPedido());
        dto.setClienteNombre(pago.getPedido().getUsuario().getNombre() + " " + pago.getPedido().getUsuario().getApellido());
        dto.setModalidadEntrega(pago.getPedido().getModalidadEntrega());
        dto.setMetodoPago(pago.getMetodoPago());
        dto.setEstadoPago(pago.getEstadoPago());
        dto.setMonto(pago.getMonto());
        dto.setReferencia(pago.getReferencia());
        dto.setFechaPago(pago.getFechaPago());
        return dto;
    }
}
