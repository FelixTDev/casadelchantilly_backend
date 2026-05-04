package com.integrador.chantilly.producto.repository;

import com.integrador.chantilly.producto.entity.Producto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    List<Producto> findByDisponibleTrue();

    Page<Producto> findByDisponibleTrue(Pageable pageable);

    List<Producto> findByCategoriaIdAndDisponibleTrue(Integer categoriaId);

    List<Producto> findByNombreContainingIgnoreCaseAndDisponibleTrue(String nombre);
}

