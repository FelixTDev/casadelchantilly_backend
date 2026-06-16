package com.integrador.chantilly.carrito.repository;

import com.integrador.chantilly.carrito.entity.Carrito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CarritoRepository extends JpaRepository<Carrito, Integer> {
    Optional<Carrito> findByUsuarioId(Integer usuarioId);
}
