package com.integrador.chantilly.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "auth_rate_limits",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_auth_rate_limits_action_subject", columnNames = {"action", "subject_hash"})
        }
)
public class AuthRateLimitEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 32)
    private String action;

    @Column(nullable = false, length = 64)
    private String subjectHash;

    @Column(nullable = false)
    private Integer attempts;

    @Column(nullable = false)
    private LocalDateTime windowStartedAt;

    @Column
    private LocalDateTime blockedUntil;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getSubjectHash() {
        return subjectHash;
    }

    public void setSubjectHash(String subjectHash) {
        this.subjectHash = subjectHash;
    }

    public Integer getAttempts() {
        return attempts;
    }

    public void setAttempts(Integer attempts) {
        this.attempts = attempts;
    }

    public LocalDateTime getWindowStartedAt() {
        return windowStartedAt;
    }

    public void setWindowStartedAt(LocalDateTime windowStartedAt) {
        this.windowStartedAt = windowStartedAt;
    }

    public LocalDateTime getBlockedUntil() {
        return blockedUntil;
    }

    public void setBlockedUntil(LocalDateTime blockedUntil) {
        this.blockedUntil = blockedUntil;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
