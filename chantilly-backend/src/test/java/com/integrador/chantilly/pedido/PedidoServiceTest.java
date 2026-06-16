package com.integrador.chantilly.pedido;

import com.integrador.chantilly.admin.service.AdminActivityLogService;
import com.integrador.chantilly.carrito.entity.Carrito;
import com.integrador.chantilly.carrito.repository.CarritoItemRepository;
import com.integrador.chantilly.carrito.repository.CarritoRepository;
import com.integrador.chantilly.notificacion.service.NotificacionService;
import com.integrador.chantilly.pago.repository.PagoRepository;
import com.integrador.chantilly.pedido.dto.CrearPedidoRequest;
import com.integrador.chantilly.pedido.entity.Pedido;
import com.integrador.chantilly.pedido.repository.HistorialEstadoRepository;
import com.integrador.chantilly.pedido.repository.PedidoItemRepository;
import com.integrador.chantilly.pedido.repository.PedidoRepository;
import com.integrador.chantilly.pedido.service.PedidoService;
import com.integrador.chantilly.producto.repository.AlertaStockRepository;
import com.integrador.chantilly.producto.repository.ProductoRepository;
import com.integrador.chantilly.promocion.repository.PromocionRepository;
import com.integrador.chantilly.usuario.entity.Role;
import com.integrador.chantilly.usuario.entity.Usuario;
import com.integrador.chantilly.usuario.repository.DireccionRepository;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock private PedidoRepository pedidoRepository;
    @Mock private PedidoItemRepository pedidoItemRepository;
    @Mock private HistorialEstadoRepository historialEstadoRepository;
    @Mock private CarritoRepository carritoRepository;
    @Mock private CarritoItemRepository carritoItemRepository;
    @Mock private ProductoRepository productoRepository;
    @Mock private AlertaStockRepository alertaStockRepository;
    @Mock private DireccionRepository direccionRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private NotificacionService notificacionService;
    @Mock private PromocionRepository promocionRepository;
    @Mock private PagoRepository pagoRepository;
    @Mock private AdminActivityLogService adminActivityLogService;

    private PedidoService pedidoService;

    @BeforeEach
    void setUp() {
        pedidoService = new PedidoService(
                pedidoRepository,
                pedidoItemRepository,
                historialEstadoRepository,
                carritoRepository,
                carritoItemRepository,
                productoRepository,
                alertaStockRepository,
                direccionRepository,
                usuarioRepository,
                notificacionService,
                promocionRepository,
                pagoRepository,
                adminActivityLogService
        );
    }

    @Test
    void createFromCartRejectsEmptyCart() {
        Usuario usuario = new Usuario();
        usuario.setId(10);
        usuario.setRol(new Role("CLIENTE"));

        Carrito carrito = new Carrito();
        carrito.setId(20);

        CrearPedidoRequest request = new CrearPedidoRequest();
        request.setModalidadEntrega("RECOJO_TIENDA");

        when(usuarioRepository.findById(10)).thenReturn(Optional.of(usuario));
        when(carritoRepository.findByUsuarioId(10)).thenReturn(Optional.of(carrito));
        when(carritoItemRepository.findByCarritoId(20)).thenReturn(List.of());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> pedidoService.crearDesdeCarrito(10, request));

        assertEquals("El carrito esta vacio", exception.getMessage());
    }

    @Test
    void changeStatusRejectsInvalidTransition() {
        Pedido pedido = new Pedido();
        pedido.setId(30);
        pedido.setEstado("ENTREGADO");

        when(pedidoRepository.findById(30)).thenReturn(Optional.of(pedido));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> pedidoService.cambiarEstado(30, "PENDIENTE", 1));

        assertEquals("Transicion de estado invalida: ENTREGADO -> PENDIENTE", exception.getMessage());
    }
}
