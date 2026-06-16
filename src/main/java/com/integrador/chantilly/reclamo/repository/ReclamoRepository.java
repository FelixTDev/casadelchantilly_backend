package com.integrador.chantilly.reclamo.repository;

import com.integrador.chantilly.reclamo.entity.Reclamo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReclamoRepository extends JpaRepository<Reclamo, Integer> {
    List<Reclamo> findByUsuarioIdOrderByIdDesc(Integer usuarioId);
}
