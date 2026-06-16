package com.integrador.chantilly.carrito.service;

import com.integrador.chantilly.carrito.dto.CarritoDTO;
import com.integrador.chantilly.carrito.dto.CarritoItemDTO;
import com.integrador.chantilly.carrito.entity.Carrito;
import com.integrador.chantilly.carrito.entity.CarritoItem;
import com.integrador.chantilly.carrito.repository.CarritoItemRepository;
import com.integrador.chantilly.carrito.repository.CarritoRepository;
import com.integrador.chantilly.producto.entity.Producto;
import com.integrador.chantilly.producto.repository.ProductoRepository;
import com.integrador.chantilly.usuario.entity.Usuario;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final CarritoItemRepository carritoItemRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public CarritoService(CarritoRepository carritoRepository,
                          CarritoItemRepository carritoItemRepository,
                          ProductoRepository productoRepository,
                          UsuarioRepository usuarioRepository) {
        this.carritoRepository = carritoRepository;
        this.carritoItemRepository = carritoItemRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public CarritoDTO obtenerCarrito(Integer usuarioId) {
        Carrito carrito = obtenerOCrearCarrito(usuarioId);
        return toDto(carrito);
    }

    @Transactional
    public CarritoDTO agregarItem(Integer usuarioId, CarritoItemDTO itemDto) {
        Carrito carrito = obtenerOCrearCarrito(usuarioId);
        Producto producto = productoRepository.findById(itemDto.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (!Boolean.TRUE.equals(producto.getDisponible())) {
            throw new RuntimeException("Producto no disponible");
        }

        int cantidadAgregar = itemDto.getCantidad() == null ? 1 : itemDto.getCantidad();
        if (cantidadAgregar <= 0) {
            throw new RuntimeException("Cantidad invalida");
        }

        CarritoItem item = carritoItemRepository
                .findByCarritoIdAndProductoId(carrito.getId(), producto.getId())
                .orElseGet(CarritoItem::new);

        if (item.getId() == null) {
            item.setCarrito(carrito);
            item.setProducto(producto);
            item.setCantidad(0);
        }

        item.setCantidad(item.getCantidad() + cantidadAgregar);
        item.setPrecioUnitario(producto.getPrecio());
        item.setNotas(itemDto.getNotas());
        carritoItemRepository.save(item);
        return toDto(carrito);
    }

    @Transactional
    public CarritoDTO actualizarCantidad(Integer usuarioId, Integer itemId, Integer cantidad) {
        Carrito carrito = obtenerOCrearCarrito(usuarioId);
        CarritoItem item = carritoItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item no encontrado"));

        validarPertenenciaCarrito(carrito, item);

        if (cantidad == null || cantidad <= 0) {
            carritoItemRepository.delete(item);
            return toDto(carrito);
        }

        item.setCantidad(cantidad);
        item.setPrecioUnitario(item.getProducto().getPrecio());
        carritoItemRepository.save(item);
        return toDto(carrito);
    }

    @Transactional
    public CarritoDTO eliminarItem(Integer usuarioId, Integer itemId) {
        Carrito carrito = obtenerOCrearCarrito(usuarioId);
        CarritoItem item = carritoItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item no encontrado"));
        validarPertenenciaCarrito(carrito, item);
        carritoItemRepository.delete(item);
        return toDto(carrito);
    }

    @Transactional
    public void vaciarCarrito(Integer usuarioId) {
        Carrito carrito = obtenerOCrearCarrito(usuarioId);
        List<CarritoItem> items = carritoItemRepository.findByCarritoId(carrito.getId());
        carritoItemRepository.deleteAll(items);
    }

    private Carrito obtenerOCrearCarrito(Integer usuarioId) {
        return carritoRepository.findByUsuarioId(usuarioId).orElseGet(() -> {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            Carrito nuevo = new Carrito();
            nuevo.setUsuario(usuario);
            return carritoRepository.save(nuevo);
        });
    }

    private void validarPertenenciaCarrito(Carrito carrito, CarritoItem item) {
        if (!item.getCarrito().getId().equals(carrito.getId())) {
            throw new RuntimeException("Item no pertenece al carrito del usuario");
        }
    }

    private CarritoDTO toDto(Carrito carrito) {
        List<CarritoItem> items = carritoItemRepository.findByCarritoId(carrito.getId());
        List<CarritoItemDTO> itemDtos = items.stream().map(this::toDto).toList();

        BigDecimal subtotal = itemDtos.stream()
                .map(CarritoItemDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int totalItems = itemDtos.stream().mapToInt(CarritoItemDTO::getCantidad).sum();

        CarritoDTO dto = new CarritoDTO();
        dto.setId(carrito.getId());
        dto.setUsuarioId(carrito.getUsuario().getId());
        dto.setItems(itemDtos);
        dto.setSubtotal(subtotal);
        dto.setTotalItems(totalItems);
        return dto;
    }

    private CarritoItemDTO toDto(CarritoItem item) {
        CarritoItemDTO dto = new CarritoItemDTO();
        dto.setId(item.getId());
        dto.setProductoId(item.getProducto().getId());
        dto.setNombreProducto(item.getProducto().getNombre());
        dto.setImagenUrl(item.getProducto().getImagenUrl());
        dto.setCantidad(item.getCantidad());
        dto.setPrecioUnitario(item.getPrecioUnitario());
        dto.setSubtotal(item.getPrecioUnitario().multiply(BigDecimal.valueOf(item.getCantidad())));
        dto.setNotas(item.getNotas());
        return dto;
    }
}
