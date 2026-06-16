package com.integrador.chantilly.usuario.repository;

import com.integrador.chantilly.usuario.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByNombre(String nombre);
}
