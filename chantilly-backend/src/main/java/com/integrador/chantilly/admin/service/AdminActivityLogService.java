package com.integrador.chantilly.admin.service;

import com.integrador.chantilly.admin.dto.AdminActivityLogDTO;
import com.integrador.chantilly.admin.entity.AdminActivityLog;
import com.integrador.chantilly.admin.repository.AdminActivityLogRepository;
import com.integrador.chantilly.usuario.entity.Usuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminActivityLogService {

    private final AdminActivityLogRepository adminActivityLogRepository;

    public AdminActivityLogService(AdminActivityLogRepository adminActivityLogRepository) {
        this.adminActivityLogRepository = adminActivityLogRepository;
    }

    @Transactional
    public void registrar(Usuario admin, String modulo, String accion, String entidadTipo, Integer entidadId, String resumen) {
        if (admin == null) {
            return;
        }

        AdminActivityLog log = new AdminActivityLog();
        log.setAdmin(admin);
        log.setModulo(modulo);
        log.setAccion(accion);
        log.setEntidadTipo(entidadTipo);
        log.setEntidadId(entidadId);
        log.setResumen(resumen);
        adminActivityLogRepository.save(log);
    }

    public List<AdminActivityLogDTO> listarRecientes() {
        return adminActivityLogRepository.findTop20ByOrderByIdDesc().stream().map(this::toDto).toList();
    }

    private AdminActivityLogDTO toDto(AdminActivityLog log) {
        AdminActivityLogDTO dto = new AdminActivityLogDTO();
        dto.setId(log.getId());
        dto.setAdminId(log.getAdmin() != null ? log.getAdmin().getId() : null);
        dto.setAdminNombre(log.getAdmin() != null ? log.getAdmin().getNombre() + " " + log.getAdmin().getApellido() : null);
        dto.setModulo(log.getModulo());
        dto.setAccion(log.getAccion());
        dto.setEntidadTipo(log.getEntidadTipo());
        dto.setEntidadId(log.getEntidadId());
        dto.setResumen(log.getResumen());
        dto.setCreadoEn(log.getCreadoEn());
        return dto;
    }
}
