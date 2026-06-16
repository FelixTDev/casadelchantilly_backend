package com.integrador.chantilly.pedido.repository;

import com.integrador.chantilly.pedido.entity.HistorialEstado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorialEstadoRepository extends JpaRepository<HistorialEstado, Integer> {
    List<HistorialEstado> findByPedidoIdOrderByIdAsc(Integer pedidoId);
}
