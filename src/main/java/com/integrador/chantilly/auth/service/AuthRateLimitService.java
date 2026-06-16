package com.integrador.chantilly.auth.service;

import com.integrador.chantilly.auth.entity.AuthRateLimitEntry;
import com.integrador.chantilly.auth.repository.AuthRateLimitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
public class AuthRateLimitService {

    private static final int LOGIN_MAX_ATTEMPTS = 5;
    private static final int RECOVERY_MAX_ATTEMPTS = 3;
    private static final int WINDOW_MINUTES = 15;
    private static final int BLOCK_MINUTES = 15;

    private final AuthRateLimitRepository repository;

    public AuthRateLimitService(AuthRateLimitRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void assertAllowed(String action, String subject) {
        cleanupExpiredEntries();

        LocalDateTime now = LocalDateTime.now();
        repository.findByActionAndSubjectHash(action, hash(subject)).ifPresent(entry -> {
            if (entry.getBlockedUntil() != null && entry.getBlockedUntil().isAfter(now)) {
                throw new RuntimeException("Demasiados intentos. Intenta nuevamente más tarde.");
            }
        });
    }

    @Transactional
    public void recordSuccess(String action, String subject) {
        repository.findByActionAndSubjectHash(action, hash(subject)).ifPresent(repository::delete);
    }

    @Transactional
    public void recordFailure(String action, String subject) {
        recordAttempt(action, subject);
    }

    @Transactional
    public void recordAttempt(String action, String subject) {
        LocalDateTime now = LocalDateTime.now();
        String subjectHash = hash(subject);
        AuthRateLimitEntry entry = repository.findByActionAndSubjectHash(action, subjectHash)
                .orElseGet(AuthRateLimitEntry::new);

        if (entry.getId() == null || entry.getWindowStartedAt() == null || entry.getWindowStartedAt().plusMinutes(WINDOW_MINUTES).isBefore(now)) {
            entry.setAction(action);
            entry.setSubjectHash(subjectHash);
            entry.setAttempts(1);
            entry.setWindowStartedAt(now);
            entry.setBlockedUntil(null);
            repository.save(entry);
            return;
        }

        int attempts = (entry.getAttempts() == null ? 0 : entry.getAttempts()) + 1;
        entry.setAttempts(attempts);
        if (attempts >= maxAttemptsFor(action)) {
            entry.setBlockedUntil(now.plusMinutes(BLOCK_MINUTES));
        }
        repository.save(entry);
    }

    private int maxAttemptsFor(String action) {
        return "RECOVERY".equals(action) ? RECOVERY_MAX_ATTEMPTS : LOGIN_MAX_ATTEMPTS;
    }

    private void cleanupExpiredEntries() {
        LocalDateTime now = LocalDateTime.now();
        repository.deleteByBlockedUntilBeforeAndWindowStartedAtBefore(now, now.minusDays(1));
    }

    private String hash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(input.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 no está disponible", ex);
        }
    }
}
