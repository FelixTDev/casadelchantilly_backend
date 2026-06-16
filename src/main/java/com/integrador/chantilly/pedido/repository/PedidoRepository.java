package com.integrador.chantilly.pedido.repository;

import com.integrador.chantilly.pedido.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Integer> {
    List<Pedido> findByUsuarioIdOrderByIdDesc(Integer usuarioId);
    Optional<Pedido> findByIdAndUsuarioId(Integer id, Integer usuarioId);
}
