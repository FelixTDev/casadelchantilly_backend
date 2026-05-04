package com.integrador.chantilly.promocion.repository;

import com.integrador.chantilly.promocion.entity.Promocion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PromocionRepository extends JpaRepository<Promocion, Integer> {
    List<Promocion> findByActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(LocalDate hoyInicio, LocalDate hoyFin);
    Optional<Promocion> findByCodigoCuponIgnoreCase(String codigoCupon);
}
