package com.integrador.chantilly.reclamo.service;

import com.integrador.chantilly.admin.service.AdminActivityLogService;
import com.integrador.chantilly.reclamo.dto.ReclamoDTO;
import com.integrador.chantilly.reclamo.entity.Reclamo;
import com.integrador.chantilly.reclamo.repository.ReclamoRepository;
import com.integrador.chantilly.pedido.entity.Pedido;
import com.integrador.chantilly.pedido.repository.PedidoRepository;
import com.integrador.chantilly.usuario.entity.Usuario;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReclamoService {

    private final ReclamoRepository reclamoRepository;
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AdminActivityLogService adminActivityLogService;

    public ReclamoService(ReclamoRepository reclamoRepository,
                         PedidoRepository pedidoRepository,
                         UsuarioRepository usuarioRepository,
                         AdminActivityLogService adminActivityLogService) {
        this.reclamoRepository = reclamoRepository;
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.adminActivityLogService = adminActivityLogService;
    }

    @Transactional
    public ReclamoDTO crear(Integer usuarioId, ReclamoDTO dto) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Pedido pedido = pedidoRepository.findById(dto.getPedidoId())
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (!pedido.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("El pedido no pertenece al usuario");
        }

        if (!"ENTREGADO".equals(pedido.getEstado())) {
            throw new RuntimeException("Solo se puede reclamar pedidos entregados");
        }

        Reclamo reclamo = new Reclamo();
        reclamo.setUsuario(usuario);
        reclamo.setPedido(pedido);
        reclamo.setTipo(dto.getTipo());
        reclamo.setDescripcion(dto.getDescripcion());
        reclamo.setEstado("ABIERTO");

        return toDto(reclamoRepository.save(reclamo));
    }

    public List<ReclamoDTO> listarPorUsuario(Integer usuarioId) {
        return reclamoRepository.findByUsuarioIdOrderByIdDesc(usuarioId).stream().map(this::toDto).toList();
    }

    public List<ReclamoDTO> listarTodos() {
        return reclamoRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public ReclamoDTO resolver(Integer id, String resolucion, String tipoSolucion, Integer adminId) {
        Reclamo reclamo = reclamoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamo no encontrado"));

        reclamo.setResolucion(resolucion);
        reclamo.setTipoSolucion(tipoSolucion);
        reclamo.setEstado("RESUELTO");
        reclamo.setResueltoEn(LocalDateTime.now());

        Reclamo guardado = reclamoRepository.save(reclamo);
        if (adminId != null) {
            Usuario admin = usuarioRepository.findById(adminId).orElse(null);
            adminActivityLogService.registrar(
                    admin,
                    "RECLAMOS",
                    "RESOLVER",
                    "RECLAMO",
                    guardado.getId(),
                    "Resolvió reclamo #" + guardado.getId() + " con acción " + tipoSolucion
            );
        }

        return toDto(guardado);
    }

    private ReclamoDTO toDto(Reclamo reclamo) {
        ReclamoDTO dto = new ReclamoDTO();
        dto.setId(reclamo.getId());
        dto.setUsuarioId(reclamo.getUsuario() != null ? reclamo.getUsuario().getId() : null);
        dto.setPedidoId(reclamo.getPedido() != null ? reclamo.getPedido().getId() : null);
        dto.setTipo(reclamo.getTipo());
        dto.setDescripcion(reclamo.getDescripcion());
        dto.setEstado(reclamo.getEstado());
        dto.setResolucion(reclamo.getResolucion());
        dto.setTipoSolucion(reclamo.getTipoSolucion());
        dto.setCreadoEn(reclamo.getCreadoEn());
        dto.setResueltoEn(reclamo.getResueltoEn());
        return dto;
    }
}
