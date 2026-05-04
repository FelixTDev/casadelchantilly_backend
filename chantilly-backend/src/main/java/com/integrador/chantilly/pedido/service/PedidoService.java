package com.integrador.chantilly.pedido.service;

import com.integrador.chantilly.carrito.entity.Carrito;
import com.integrador.chantilly.carrito.entity.CarritoItem;
import com.integrador.chantilly.carrito.repository.CarritoItemRepository;
import com.integrador.chantilly.carrito.repository.CarritoRepository;
import com.integrador.chantilly.notificacion.service.NotificacionService;
import com.integrador.chantilly.pedido.dto.CrearPedidoRequest;
import com.integrador.chantilly.pedido.dto.HistorialEstadoDTO;
import com.integrador.chantilly.pedido.dto.PedidoDTO;
import com.integrador.chantilly.pedido.dto.PedidoItemDTO;
import com.integrador.chantilly.pedido.entity.HistorialEstado;
import com.integrador.chantilly.pedido.entity.Pedido;
import com.integrador.chantilly.pedido.entity.PedidoItem;
import com.integrador.chantilly.pedido.repository.HistorialEstadoRepository;
import com.integrador.chantilly.pedido.repository.PedidoItemRepository;
import com.integrador.chantilly.pedido.repository.PedidoRepository;
import com.integrador.chantilly.producto.entity.AlertaStock;
import com.integrador.chantilly.producto.entity.Producto;
import com.integrador.chantilly.producto.repository.AlertaStockRepository;
import com.integrador.chantilly.producto.repository.ProductoRepository;
import com.integrador.chantilly.promocion.entity.Promocion;
import com.integrador.chantilly.promocion.repository.PromocionRepository;
import com.integrador.chantilly.usuario.entity.Direccion;
import com.integrador.chantilly.usuario.entity.Usuario;
import com.integrador.chantilly.usuario.repository.DireccionRepository;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class PedidoService {

    private static final Set<String> ESTADOS_VALIDOS = Set.of("PENDIENTE", "EN_PREPARACION", "LISTO", "EN_RUTA", "ENTREGADO", "CANCELADO", "RECHAZADO");

    private static final Map<String, Set<String>> TRANSICIONES = Map.of(
            "PENDIENTE", Set.of("EN_PREPARACION", "CANCELADO", "RECHAZADO"),
            "EN_PREPARACION", Set.of("LISTO", "CANCELADO"),
            "LISTO", Set.of("EN_RUTA", "ENTREGADO"),
            "EN_RUTA", Set.of("ENTREGADO"),
            "ENTREGADO", Set.of(),
            "CANCELADO", Set.of(),
            "RECHAZADO", Set.of()
    );

    private final PedidoRepository pedidoRepository;
    private final PedidoItemRepository pedidoItemRepository;
    private final HistorialEstadoRepository historialEstadoRepository;
    private final CarritoRepository carritoRepository;
    private final CarritoItemRepository carritoItemRepository;
    private final ProductoRepository productoRepository;
    private final AlertaStockRepository alertaStockRepository;
    private final DireccionRepository direccionRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionService notificacionService;
    private final PromocionRepository promocionRepository;

    @Value("${app.delivery.costo:5.00}")
    private BigDecimal costoDelivery;

    public PedidoService(PedidoRepository pedidoRepository,
                        PedidoItemRepository pedidoItemRepository,
                        HistorialEstadoRepository historialEstadoRepository,
                        CarritoRepository carritoRepository,
                        CarritoItemRepository carritoItemRepository,
                        ProductoRepository productoRepository,
                        AlertaStockRepository alertaStockRepository,
                        DireccionRepository direccionRepository,
                        UsuarioRepository usuarioRepository,
                        NotificacionService notificacionService,
                        PromocionRepository promocionRepository) {
        this.pedidoRepository = pedidoRepository;
        this.pedidoItemRepository = pedidoItemRepository;
        this.historialEstadoRepository = historialEstadoRepository;
        this.carritoRepository = carritoRepository;
        this.carritoItemRepository = carritoItemRepository;
        this.productoRepository = productoRepository;
        this.alertaStockRepository = alertaStockRepository;
        this.direccionRepository = direccionRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificacionService = notificacionService;
        this.promocionRepository = promocionRepository;
    }

    @Transactional
    public PedidoDTO crearDesdeCarrito(Integer usuarioId, CrearPedidoRequest req) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String modalidad = normalizarModalidad(req.getModalidadEntrega());
        validarDireccion(usuarioId, modalidad, req.getIdDireccion());

        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId).orElse(null);
        if (carrito == null) {
            throw new RuntimeException("El carrito esta vacio");
        }
        List<CarritoItem> itemsCarrito = carritoItemRepository.findByCarritoId(carrito.getId());

        if (itemsCarrito.isEmpty()) {
            throw new RuntimeException("El carrito esta vacio");
        }

        BigDecimal subtotal = itemsCarrito.stream()
                .map(i -> i.getPrecioUnitario().multiply(BigDecimal.valueOf(i.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal costoEnvio = "DELIVERY".equals(modalidad) ? costoDelivery : BigDecimal.ZERO;
        BigDecimal descuento = calcularDescuentoCupon(req.getCodigoCupon(), subtotal);
        BigDecimal total = subtotal.add(costoEnvio).subtract(descuento);

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setEstado("PENDIENTE");
        pedido.setModalidadEntrega(modalidad);
        pedido.setIdDireccion(req.getIdDireccion());
        pedido.setFechaEntrega(req.getFechaEntrega());
        pedido.setHoraEntrega(req.getHoraEntrega());
        pedido.setSubtotal(subtotal);
        pedido.setCostoEnvio(costoEnvio);
        pedido.setDescuento(descuento);
        pedido.setTotal(total);
        pedido.setNotasCliente(req.getNotasCliente());

        pedido.setCodigoPedido("TMP-" + System.currentTimeMillis());
        Pedido guardado = pedidoRepository.save(pedido);
        String codigo = String.format("CH-%d-%05d", LocalDate.now().getYear(), guardado.getId());
        guardado.setCodigoPedido(codigo);
        guardado = pedidoRepository.save(guardado);

        for (CarritoItem item : itemsCarrito) {
            Producto producto = item.getProducto();
            int stockActual = producto.getStock() == null ? 0 : producto.getStock();
            int cantidad = item.getCantidad() == null ? 0 : item.getCantidad();

            if (stockActual < cantidad) {
                throw new RuntimeException("Stock insuficiente para " + producto.getNombre());
            }

            PedidoItem pi = new PedidoItem();
            pi.setPedido(guardado);
            pi.setProducto(producto);
            pi.setCantidad(cantidad);
            pi.setPrecioUnitario(item.getPrecioUnitario());
            pi.setSubtotal(item.getPrecioUnitario().multiply(BigDecimal.valueOf(cantidad)));
            pi.setPersonalizacion(item.getNotas());
            pedidoItemRepository.save(pi);

            try {
                producto.setStock(stockActual - cantidad);
                if (producto.getStock() <= 0) {
                    producto.setDisponible(false);
                }
                productoRepository.saveAndFlush(producto);
            } catch (OptimisticLockingFailureException e) {
                throw new RuntimeException(
                    "El stock del producto '" + producto.getNombre() + "' varió durante su compra. " +
                    "Por favor, actualice su carrito e intente de nuevo."
                );
            }

            int stockMinimo = producto.getStockMinimo() == null ? 0 : producto.getStockMinimo();
            if (producto.getStock() <= stockMinimo) {
                AlertaStock alerta = new AlertaStock();
                alerta.setProducto(producto);
                alerta.setStockActual(producto.getStock());
                alerta.setStockMinimo(stockMinimo);
                alerta.setAtendido(false);
                alertaStockRepository.save(alerta);
            }
        }

        registrarHistorial(guardado, "PENDIENTE", "Pedido creado", usuario);
        notificacionService.crear(usuarioId, "Pedido recibido", "Tu pedido " + guardado.getCodigoPedido() + " fue recibido", "PEDIDO");

        carritoItemRepository.deleteAll(itemsCarrito);

        return toDtoCompleto(guardado);
    }

    public PedidoDTO obtenerPorId(Integer id, Integer usuarioId) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (!pedido.getUsuario().getId().equals(usuarioId)) {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            if (!"ADMIN".equals(usuario.getRol().getNombre())) {
                throw new RuntimeException("No tiene permisos para ver este pedido");
            }
        }

        return toDtoCompleto(pedido);
    }

    public List<PedidoDTO> listarPorUsuario(Integer usuarioId) {
        return pedidoRepository.findByUsuarioIdOrderByIdDesc(usuarioId).stream().map(this::toDtoCompleto).toList();
    }

    public List<PedidoDTO> listarTodos() {
        return pedidoRepository.findAll().stream().map(this::toDtoCompleto).toList();
    }

    @Transactional
    public PedidoDTO cambiarEstado(Integer id, String nuevoEstado, Integer adminId) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        String estadoNormalizado = normalizarEstado(nuevoEstado);
        validarTransicion(pedido.getEstado(), estadoNormalizado);

        Usuario admin = usuarioRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Administrador no encontrado"));

        pedido.setEstado(estadoNormalizado);
        pedidoRepository.save(pedido);

        registrarHistorial(pedido, estadoNormalizado, "Actualizado por administrador", admin);
        notificacionService.crear(pedido.getUsuario().getId(), "Estado de pedido actualizado", "Tu pedido " + pedido.getCodigoPedido() + " ahora esta en estado " + estadoNormalizado, "PEDIDO");

        return toDtoCompleto(pedido);
    }

    @Transactional
    public void cancelarPedido(Integer id, Integer usuarioId) {
        Pedido pedido = pedidoRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (!"PENDIENTE".equals(pedido.getEstado())) {
            throw new RuntimeException("Solo se pueden cancelar pedidos en estado PENDIENTE");
        }

        List<PedidoItem> items = pedidoItemRepository.findByPedidoId(pedido.getId());
        for (PedidoItem item : items) {
            Producto producto = item.getProducto();
            int stockActual = producto.getStock() == null ? 0 : producto.getStock();
            producto.setStock(stockActual + (item.getCantidad() == null ? 0 : item.getCantidad()));
            if (producto.getStock() > 0) {
                producto.setDisponible(true);
            }
            productoRepository.save(producto);
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        pedido.setEstado("CANCELADO");
        pedidoRepository.save(pedido);

        registrarHistorial(pedido, "CANCELADO", "Cancelado por cliente", usuario);
        notificacionService.crear(usuarioId, "Pedido cancelado", "Tu pedido " + pedido.getCodigoPedido() + " fue cancelado", "PEDIDO");
    }

    private void validarDireccion(Integer usuarioId, String modalidad, Integer idDireccion) {
        if ("DELIVERY".equals(modalidad)) {
            if (idDireccion == null) {
                throw new RuntimeException("Para delivery debe seleccionar direccion");
            }
            Direccion direccion = direccionRepository.findById(idDireccion)
                    .orElseThrow(() -> new RuntimeException("Direccion no encontrada"));
            if (!direccion.getUsuario().getId().equals(usuarioId)) {
                throw new RuntimeException("La direccion no pertenece al usuario");
            }
        }
    }

    private BigDecimal calcularDescuentoCupon(String codigoCupon, BigDecimal subtotal) {
        if (codigoCupon == null || codigoCupon.isBlank()) {
            return BigDecimal.ZERO;
        }

        Optional<Promocion> opt = promocionRepository.findByCodigoCuponIgnoreCase(codigoCupon.trim());
        if (opt.isEmpty()) {
            throw new RuntimeException("Cupon no encontrado: " + codigoCupon);
        }

        Promocion promo = opt.get();
        LocalDate hoy = LocalDate.now();

        if (!Boolean.TRUE.equals(promo.getActivo())) {
            throw new RuntimeException("El cupon no esta activo");
        }
        if (hoy.isBefore(promo.getFechaInicio()) || hoy.isAfter(promo.getFechaFin())) {
            throw new RuntimeException("El cupon esta vencido o aun no esta vigente");
        }

        String tipo = promo.getTipo() != null ? promo.getTipo().toUpperCase() : "";
        return switch (tipo) {
            case "PORCENTAJE" -> subtotal
                    .multiply(promo.getValor())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            case "MONTO_FIJO" -> promo.getValor().min(subtotal);
            default -> BigDecimal.ZERO;
        };
    }


    private String normalizarModalidad(String modalidad) {
        if (modalidad == null) {
            throw new RuntimeException("Modalidad de entrega obligatoria");
        }
        String valor = modalidad.trim().toUpperCase();
        if (!"DELIVERY".equals(valor) && !"RECOJO_TIENDA".equals(valor)) {
            throw new RuntimeException("Modalidad de entrega invalida");
        }
        return valor;
    }

    private String normalizarEstado(String estado) {
        if (estado == null) {
            throw new RuntimeException("Estado obligatorio");
        }
        String valor = estado.trim().toUpperCase();
        if (!ESTADOS_VALIDOS.contains(valor)) {
            throw new RuntimeException("Estado invalido: " + estado);
        }
        return valor;
    }

    private void validarTransicion(String estadoActual, String nuevoEstado) {
        String actual = estadoActual == null ? "PENDIENTE" : estadoActual.toUpperCase();
        if (actual.equals(nuevoEstado)) {
            return;
        }
        if (!TRANSICIONES.getOrDefault(actual, Set.of()).contains(nuevoEstado)) {
            throw new RuntimeException("Transicion de estado invalida: " + actual + " -> " + nuevoEstado);
        }
    }

    private void registrarHistorial(Pedido pedido, String estado, String comentario, Usuario cambiadoPor) {
        HistorialEstado h = new HistorialEstado();
        h.setPedido(pedido);
        h.setEstado(estado);
        h.setComentario(comentario);
        h.setCambiadoPor(cambiadoPor);
        historialEstadoRepository.save(h);
    }

    private PedidoDTO toDtoCompleto(Pedido pedido) {
        PedidoDTO dto = new PedidoDTO();
        dto.setId(pedido.getId());
        dto.setCodigoPedido(pedido.getCodigoPedido());
        dto.setEstado(pedido.getEstado());
        dto.setModalidadEntrega(pedido.getModalidadEntrega());
        dto.setFechaEntrega(pedido.getFechaEntrega());
        dto.setHoraEntrega(pedido.getHoraEntrega());
        dto.setSubtotal(pedido.getSubtotal());
        dto.setCostoEnvio(pedido.getCostoEnvio());
        dto.setDescuento(pedido.getDescuento());
        dto.setTotal(pedido.getTotal());
        dto.setNotasCliente(pedido.getNotasCliente());
        dto.setCreadoEn(pedido.getCreadoEn());

        dto.setItems(pedidoItemRepository.findByPedidoId(pedido.getId()).stream().map(item -> {
            PedidoItemDTO pi = new PedidoItemDTO();
            pi.setId(item.getId());
            pi.setProductoId(item.getProducto().getId());
            pi.setNombreProducto(item.getProducto().getNombre());
            pi.setCantidad(item.getCantidad());
            pi.setPrecioUnitario(item.getPrecioUnitario());
            pi.setSubtotal(item.getSubtotal());
            pi.setPersonalizacion(item.getPersonalizacion());
            return pi;
        }).toList());

        dto.setHistorialEstados(historialEstadoRepository.findByPedidoIdOrderByIdAsc(pedido.getId()).stream().map(h -> {
            HistorialEstadoDTO hdto = new HistorialEstadoDTO();
            hdto.setId(h.getId());
            hdto.setEstado(h.getEstado());
            hdto.setComentario(h.getComentario());
            hdto.setCambiadoPor(h.getCambiadoPor() != null ? h.getCambiadoPor().getId() : null);
            hdto.setCreadoEn(h.getCreadoEn());
            return hdto;
        }).toList());

        return dto;
    }
}


