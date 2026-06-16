package com.integrador.chantilly.producto.repository;

import com.integrador.chantilly.producto.entity.AlertaStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertaStockRepository extends JpaRepository<AlertaStock, Integer> {
    List<AlertaStock> findByAtendidoFalseOrderByIdDesc();
    long countByAtendidoFalse();
}
