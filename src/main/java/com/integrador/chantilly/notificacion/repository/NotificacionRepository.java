package com.integrador.chantilly.notificacion.repository;

import com.integrador.chantilly.notificacion.entity.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Integer> {
    List<Notificacion> findByUsuarioIdOrderByIdDesc(Integer usuarioId);
    List<Notificacion> findByUsuarioIdAndLeidoFalse(Integer usuarioId);
    long countByUsuarioIdAndLeidoFalse(Integer usuarioId);
}
