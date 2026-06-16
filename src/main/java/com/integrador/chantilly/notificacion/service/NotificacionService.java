package com.integrador.chantilly.notificacion.service;

import com.integrador.chantilly.notificacion.dto.NotificacionDTO;
import com.integrador.chantilly.notificacion.entity.Notificacion;
import com.integrador.chantilly.notificacion.repository.NotificacionRepository;
import com.integrador.chantilly.usuario.entity.Usuario;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    public NotificacionService(NotificacionRepository notificacionRepository, UsuarioRepository usuarioRepository) {
        this.notificacionRepository = notificacionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<NotificacionDTO> listarPorUsuario(Integer usuarioId) {
        return notificacionRepository.findByUsuarioIdOrderByIdDesc(usuarioId).stream().map(this::toDto).toList();
    }

    @Transactional
    public void marcarLeida(Integer id) {
        Notificacion n = notificacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificacion no encontrada"));
        n.setLeido(true);
        notificacionRepository.save(n);
    }

    @Transactional
    public void marcarTodasLeidas(Integer usuarioId) {
        List<Notificacion> lista = notificacionRepository.findByUsuarioIdAndLeidoFalse(usuarioId);
        for (Notificacion n : lista) {
            n.setLeido(true);
        }
        notificacionRepository.saveAll(lista);
    }

    public long contarNoLeidas(Integer usuarioId) {
        return notificacionRepository.countByUsuarioIdAndLeidoFalse(usuarioId);
    }

    @Transactional
    public void crear(Integer usuarioId, String titulo, String mensaje, String tipo) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Notificacion n = new Notificacion();
        n.setUsuario(usuario);
        n.setTitulo(titulo);
        n.setMensaje(mensaje);
        n.setTipo(tipo);
        n.setLeido(false);
        notificacionRepository.save(n);
    }

    private NotificacionDTO toDto(Notificacion n) {
        NotificacionDTO dto = new NotificacionDTO();
        dto.setId(n.getId());
        dto.setTitulo(n.getTitulo());
        dto.setMensaje(n.getMensaje());
        dto.setTipo(n.getTipo());
        dto.setLeido(n.getLeido());
        dto.setCreadoEn(n.getCreadoEn());
        return dto;
    }
}
