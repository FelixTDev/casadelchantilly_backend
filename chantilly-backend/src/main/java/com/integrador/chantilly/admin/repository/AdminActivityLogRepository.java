package com.integrador.chantilly.admin.repository;

import com.integrador.chantilly.admin.entity.AdminActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminActivityLogRepository extends JpaRepository<AdminActivityLog, Integer> {
    List<AdminActivityLog> findTop20ByOrderByIdDesc();
}
