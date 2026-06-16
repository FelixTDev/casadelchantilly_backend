package com.integrador.chantilly.admin.controller;

import com.integrador.chantilly.admin.dto.AdminActivityLogDTO;
import com.integrador.chantilly.admin.service.AdminActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/actividad")
public class AdminActivityLogController {

    private final AdminActivityLogService adminActivityLogService;

    public AdminActivityLogController(AdminActivityLogService adminActivityLogService) {
        this.adminActivityLogService = adminActivityLogService;
    }

    @GetMapping
    public ResponseEntity<List<AdminActivityLogDTO>> listarRecientes() {
        return ResponseEntity.ok(adminActivityLogService.listarRecientes());
    }
}
