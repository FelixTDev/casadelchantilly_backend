package com.integrador.chantilly.auth.repository;

import com.integrador.chantilly.auth.entity.AuthRateLimitEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface AuthRateLimitRepository extends JpaRepository<AuthRateLimitEntry, Long> {
    Optional<AuthRateLimitEntry> findByActionAndSubjectHash(String action, String subjectHash);
    void deleteByBlockedUntilBeforeAndWindowStartedAtBefore(LocalDateTime blockedUntil, LocalDateTime windowStartedAt);
}
