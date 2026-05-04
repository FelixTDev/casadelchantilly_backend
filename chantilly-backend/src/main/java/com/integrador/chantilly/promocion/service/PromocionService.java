package com.integrador.chantilly.promocion.service;

import com.integrador.chantilly.producto.entity.Producto;
import com.integrador.chantilly.producto.repository.ProductoRepository;
import com.integrador.chantilly.promocion.dto.PromocionDTO;
import com.integrador.chantilly.promocion.entity.Promocion;
import com.integrador.chantilly.promocion.repository.PromocionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class PromocionService {

    private final PromocionRepository promocionRepository;
    private final ProductoRepository productoRepository;

    public PromocionService(PromocionRepository promocionRepository, ProductoRepository productoRepository) {
        this.promocionRepository = promocionRepository;
        this.productoRepository = productoRepository;
    }

    public List<PromocionDTO> listarActivas() {
        LocalDate hoy = LocalDate.now();
        return promocionRepository
                .findByActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(hoy, hoy)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public PromocionDTO crear(PromocionDTO dto) {
        Promocion promocion = new Promocion();
        aplicarDatos(promocion, dto);
        return toDto(promocionRepository.save(promocion));
    }

    @Transactional
    public PromocionDTO actualizar(Integer id, PromocionDTO dto) {
        Promocion promocion = promocionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promocion no encontrada"));
        aplicarDatos(promocion, dto);
        return toDto(promocionRepository.save(promocion));
    }

    @Transactional
    public void desactivar(Integer id) {
        Promocion promocion = promocionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promocion no encontrada"));
        promocion.setActivo(false);
        promocionRepository.save(promocion);
    }

    private void aplicarDatos(Promocion promocion, PromocionDTO dto) {
        promocion.setNombre(dto.getNombre());
        promocion.setDescripcion(dto.getDescripcion());
        promocion.setTipo(dto.getTipo());
        promocion.setValor(dto.getValor());
        promocion.setFechaInicio(dto.getFechaInicio());
        promocion.setFechaFin(dto.getFechaFin());
        promocion.setActivo(dto.getActivo() == null ? true : dto.getActivo());
        promocion.setCodigoCupon(dto.getCodigoCupon() != null ? dto.getCodigoCupon().trim().toUpperCase() : null);

        Set<Producto> productos = new HashSet<>();
        if (dto.getProductoIds() != null && !dto.getProductoIds().isEmpty()) {
            productos = new HashSet<>(productoRepository.findAllById(dto.getProductoIds()));
        }
        promocion.setProductos(productos);
    }

    private PromocionDTO toDto(Promocion promocion) {
        PromocionDTO dto = new PromocionDTO();
        dto.setId(promocion.getId());
        dto.setNombre(promocion.getNombre());
        dto.setDescripcion(promocion.getDescripcion());
        dto.setTipo(promocion.getTipo());
        dto.setValor(promocion.getValor());
        dto.setFechaInicio(promocion.getFechaInicio());
        dto.setFechaFin(promocion.getFechaFin());
        dto.setActivo(promocion.getActivo());
        dto.setProductoIds(promocion.getProductos().stream().map(Producto::getId).toList());
        dto.setCodigoCupon(promocion.getCodigoCupon());
        return dto;
    }
}
