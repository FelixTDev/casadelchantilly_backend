package com.integrador.chantilly.usuario.repository;

import com.integrador.chantilly.usuario.entity.Direccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DireccionRepository extends JpaRepository<Direccion, Integer> {
    List<Direccion> findByUsuarioId(Integer usuarioId);
}
