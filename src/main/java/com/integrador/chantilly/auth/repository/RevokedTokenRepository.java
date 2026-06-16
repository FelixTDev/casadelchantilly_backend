package com.integrador.chantilly.auth.repository;

import com.integrador.chantilly.auth.entity.RevokedToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RevokedTokenRepository extends JpaRepository<RevokedToken, Long> {
    Optional<RevokedToken> findByTokenHash(String tokenHash);
    boolean existsByTokenHashAndExpiresAtAfter(String tokenHash, LocalDateTime now);
    void deleteByExpiresAtBefore(LocalDateTime now);
}
