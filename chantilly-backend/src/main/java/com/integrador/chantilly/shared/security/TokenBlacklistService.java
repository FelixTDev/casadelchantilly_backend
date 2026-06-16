package com.integrador.chantilly.shared.security;

import com.integrador.chantilly.auth.entity.RevokedToken;
import com.integrador.chantilly.auth.repository.RevokedTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HexFormat;

@Service
public class TokenBlacklistService {

    private final RevokedTokenRepository revokedTokenRepository;

    public TokenBlacklistService(RevokedTokenRepository revokedTokenRepository) {
        this.revokedTokenRepository = revokedTokenRepository;
    }

    @Transactional
    public void blacklistToken(String token, Date expiresAt) {
        if (token == null || token.isBlank()) {
            return;
        }

        cleanupExpired();

        String tokenHash = hash(token);
        if (revokedTokenRepository.findByTokenHash(tokenHash).isPresent()) {
            return;
        }

        RevokedToken revokedToken = new RevokedToken();
        revokedToken.setTokenHash(tokenHash);
        revokedToken.setExpiresAt(
                expiresAt != null
                        ? LocalDateTime.ofInstant(expiresAt.toInstant(), ZoneId.systemDefault())
                        : LocalDateTime.now().plusHours(1)
        );
        revokedTokenRepository.save(revokedToken);
    }

    @Transactional(readOnly = true)
    public boolean isBlacklisted(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        return revokedTokenRepository.existsByTokenHashAndExpiresAtAfter(hash(token), LocalDateTime.now());
    }

    @Transactional
    public void cleanupExpired() {
        revokedTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }

    private String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 no está disponible", ex);
        }
    }
}
