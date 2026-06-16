package com.integrador.chantilly.promocion.service;

import com.integrador.chantilly.admin.service.AdminActivityLogService;
import com.integrador.chantilly.producto.entity.Producto;
import com.integrador.chantilly.producto.repository.ProductoRepository;
import com.integrador.chantilly.promocion.dto.PromocionDTO;
import com.integrador.chantilly.promocion.entity.Promocion;
import com.integrador.chantilly.promocion.repository.PromocionRepository;
import com.integrador.chantilly.usuario.entity.Usuario;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
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
    private final UsuarioRepository usuarioRepository;
    private final AdminActivityLogService adminActivityLogService;

    public PromocionService(PromocionRepository promocionRepository,
                            ProductoRepository productoRepository,
                            UsuarioRepository usuarioRepository,
                            AdminActivityLogService adminActivityLogService) {
        this.promocionRepository = promocionRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.adminActivityLogService = adminActivityLogService;
    }

    @Transactional(readOnly = true)
    public List<PromocionDTO> listarActivas() {
        LocalDate hoy = LocalDate.now();
        return promocionRepository
                .findByActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(hoy, hoy)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PromocionDTO> listarTodasAdmin() {
        return promocionRepository.findAllByOrderByFechaInicioDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public PromocionDTO crear(PromocionDTO dto) {
        return crear(dto, null);
    }

    @Transactional
    public PromocionDTO crear(PromocionDTO dto, Integer adminId) {
        Promocion promocion = new Promocion();
        aplicarDatos(promocion, dto);
        Promocion guardada = promocionRepository.save(promocion);
        registrarActividad(adminId, "CREAR", guardada);
        return toDto(guardada);
    }

    @Transactional
    public PromocionDTO actualizar(Integer id, PromocionDTO dto) {
        return actualizar(id, dto, null);
    }

    @Transactional
    public PromocionDTO actualizar(Integer id, PromocionDTO dto, Integer adminId) {
        Promocion promocion = promocionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promocion no encontrada"));
        aplicarDatos(promocion, dto);
        Promocion guardada = promocionRepository.save(promocion);
        registrarActividad(adminId, "ACTUALIZAR", guardada);
        return toDto(guardada);
    }

    @Transactional
    public void desactivar(Integer id) {
        desactivar(id, null);
    }

    @Transactional
    public void desactivar(Integer id, Integer adminId) {
        Promocion promocion = promocionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promocion no encontrada"));
        promocion.setActivo(false);
        promocionRepository.save(promocion);
        registrarActividad(adminId, "DESACTIVAR", promocion);
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

    private void registrarActividad(Integer adminId, String accion, Promocion promocion) {
        if (adminId == null) {
            return;
        }
        Usuario admin = usuarioRepository.findById(adminId).orElse(null);
        adminActivityLogService.registrar(
                admin,
                "PROMOCIONES",
                accion,
                "PROMOCION",
                promocion.getId(),
                accion + " promoción " + promocion.getNombre()
        );
    }
}
