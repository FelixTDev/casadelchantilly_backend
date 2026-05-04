package com.integrador.chantilly.producto.service;

import com.integrador.chantilly.producto.dto.ProductoDTO;
import com.integrador.chantilly.producto.entity.AlertaStock;
import com.integrador.chantilly.producto.entity.Categoria;
import com.integrador.chantilly.producto.entity.Producto;
import com.integrador.chantilly.producto.repository.AlertaStockRepository;
import com.integrador.chantilly.producto.repository.CategoriaRepository;
import com.integrador.chantilly.producto.repository.ProductoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final AlertaStockRepository alertaStockRepository;

    public ProductoService(ProductoRepository productoRepository,
                           CategoriaRepository categoriaRepository,
                           AlertaStockRepository alertaStockRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.alertaStockRepository = alertaStockRepository;
    }

    public List<ProductoDTO> listarTodos() {
        return productoRepository.findByDisponibleTrue().stream().map(this::toDto).toList();
    }

    public Page<ProductoDTO> listarPaginado(Pageable pageable) {
        return productoRepository.findByDisponibleTrue(pageable).map(this::toDto);
    }

    public List<ProductoDTO> listarPorCategoria(Integer categoriaId) {
        return productoRepository.findByCategoriaIdAndDisponibleTrue(categoriaId).stream().map(this::toDto).toList();
    }

    public List<ProductoDTO> buscarPorNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCaseAndDisponibleTrue(nombre).stream().map(this::toDto).toList();
    }

    public ProductoDTO obtenerPorId(Integer id) {
        Producto producto = productoRepository.findById(id)
                .filter(p -> Boolean.TRUE.equals(p.getDisponible()))
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return toDto(producto);
    }

    @Transactional
    public ProductoDTO crear(ProductoDTO dto) {
        Producto producto = new Producto();
        aplicarDatos(dto, producto);
        Producto guardado = productoRepository.save(producto);
        generarAlertaSiCorresponde(guardado);
        return toDto(guardado);
    }

    @Transactional
    public ProductoDTO actualizar(Integer id, ProductoDTO dto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        aplicarDatos(dto, producto);
        Producto guardado = productoRepository.save(producto);
        generarAlertaSiCorresponde(guardado);
        return toDto(guardado);
    }

    @Transactional
    public void desactivar(Integer id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        producto.setDisponible(false);
        productoRepository.save(producto);
    }

    private void aplicarDatos(ProductoDTO dto, Producto producto) {
        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoria no encontrada"));

        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());
        producto.setPrecio(dto.getPrecio());
        producto.setPrecioOferta(dto.getPrecioOferta());
        producto.setStock(dto.getStock() == null ? 0 : dto.getStock());
        producto.setStockMinimo(dto.getStockMinimo() == null ? 5 : dto.getStockMinimo());
        producto.setImagenUrl(dto.getImagenUrl());
        producto.setTiempoPreparacion(dto.getTiempoPreparacion());
        producto.setDisponible(dto.getDisponible() == null ? true : dto.getDisponible());
        producto.setEnOferta(dto.getEnOferta() == null ? false : dto.getEnOferta());
        producto.setCategoria(categoria);
    }

    private void generarAlertaSiCorresponde(Producto producto) {
        int stock = producto.getStock() == null ? 0 : producto.getStock();
        int stockMinimo = producto.getStockMinimo() == null ? 0 : producto.getStockMinimo();
        if (stock <= stockMinimo) {
            AlertaStock alerta = new AlertaStock();
            alerta.setProducto(producto);
            alerta.setStockActual(stock);
            alerta.setStockMinimo(stockMinimo);
            alerta.setAtendido(false);
            alertaStockRepository.save(alerta);
        }
    }

    private ProductoDTO toDto(Producto producto) {
        ProductoDTO dto = new ProductoDTO();
        dto.setId(producto.getId());
        dto.setNombre(producto.getNombre());
        dto.setDescripcion(producto.getDescripcion());
        dto.setPrecio(producto.getPrecio());
        dto.setPrecioOferta(producto.getPrecioOferta());
        dto.setStock(producto.getStock());
        dto.setStockMinimo(producto.getStockMinimo());
        dto.setImagenUrl(producto.getImagenUrl());
        dto.setDisponible(producto.getDisponible());
        dto.setEnOferta(producto.getEnOferta());
        dto.setTiempoPreparacion(producto.getTiempoPreparacion());
        if (producto.getCategoria() != null) {
            dto.setCategoriaId(producto.getCategoria().getId());
            dto.setCategoriaNombre(producto.getCategoria().getNombre());
        }
        return dto;
    }
}
