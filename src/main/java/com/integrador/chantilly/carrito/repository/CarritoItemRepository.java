package com.integrador.chantilly.carrito.repository;

import com.integrador.chantilly.carrito.entity.CarritoItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CarritoItemRepository extends JpaRepository<CarritoItem, Integer> {
    List<CarritoItem> findByCarritoId(Integer carritoId);

    Optional<CarritoItem> findByCarritoIdAndProductoId(Integer carritoId, Integer productoId);
}
