package com.integrador.chantilly.pago;

import com.integrador.chantilly.admin.service.AdminActivityLogService;
import com.integrador.chantilly.notificacion.service.NotificacionService;
import com.integrador.chantilly.pago.dto.PagoDTO;
import com.integrador.chantilly.pago.entity.Pago;
import com.integrador.chantilly.pago.repository.PagoRepository;
import com.integrador.chantilly.pago.service.PagoService;
import com.integrador.chantilly.pedido.entity.Pedido;
import com.integrador.chantilly.pedido.repository.HistorialEstadoRepository;
import com.integrador.chantilly.pedido.repository.PedidoRepository;
import com.integrador.chantilly.usuario.entity.Role;
import com.integrador.chantilly.usuario.entity.Usuario;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PagoServiceTest {

    @Mock private PagoRepository pagoRepository;
    @Mock private PedidoRepository pedidoRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private HistorialEstadoRepository historialEstadoRepository;
    @Mock private NotificacionService notificacionService;
    @Mock private AdminActivityLogService adminActivityLogService;

    private PagoService pagoService;

    @BeforeEach
    void setUp() {
        pagoService = new PagoService(
                pagoRepository,
                pedidoRepository,
                usuarioRepository,
                historialEstadoRepository,
                notificacionService,
                adminActivityLogService
        );
    }

    @Test
    void registerPaymentRequiresReferenceForYape() {
        Usuario usuario = new Usuario();
        usuario.setId(8);

        Pedido pedido = new Pedido();
        pedido.setId(12);
        pedido.setUsuario(usuario);
        pedido.setTotal(BigDecimal.TEN);

        PagoDTO request = new PagoDTO();
        request.setMetodoPago("YAPE");
        request.setReferencia(" ");

        when(pedidoRepository.findById(12)).thenReturn(Optional.of(pedido));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> pagoService.registrarPago(8, 12, request));

        assertEquals("La referencia o comprobante es obligatoria para YAPE", exception.getMessage());
    }

    @Test
    void updateStatusRejectsInvalidTransition() {
        Pedido pedido = new Pedido();
        pedido.setId(15);
        Usuario cliente = new Usuario();
        cliente.setId(99);
        pedido.setUsuario(cliente);

        Pago pago = new Pago();
        pago.setId(22);
        pago.setPedido(pedido);
        pago.setMetodoPago("EFECTIVO");
        pago.setEstadoPago("CONFIRMADO");

        when(pagoRepository.findById(22)).thenReturn(Optional.of(pago));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> pagoService.actualizarEstadoPago(22, "PENDIENTE", null, null));

        assertEquals("Transicion de pago invalida: CONFIRMADO -> PENDIENTE", exception.getMessage());
    }
}
