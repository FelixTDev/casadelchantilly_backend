package com.integrador.chantilly.usuario.service;

import com.integrador.chantilly.admin.service.AdminActivityLogService;
import com.integrador.chantilly.usuario.dto.UsuarioAdminUpdateDTO;
import com.integrador.chantilly.usuario.entity.Role;
import com.integrador.chantilly.usuario.entity.Usuario;
import com.integrador.chantilly.usuario.repository.RoleRepository;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioAdminService {

    private final UsuarioRepository usuarioRepository;
    private final RoleRepository roleRepository;
    private final AdminActivityLogService adminActivityLogService;

    public UsuarioAdminService(UsuarioRepository usuarioRepository,
                               RoleRepository roleRepository,
                               AdminActivityLogService adminActivityLogService) {
        this.usuarioRepository = usuarioRepository;
        this.roleRepository = roleRepository;
        this.adminActivityLogService = adminActivityLogService;
    }

    @Transactional
    public void actualizarUsuario(Integer id, UsuarioAdminUpdateDTO dto) {
        actualizarUsuario(id, dto, null);
    }

    @Transactional
    public void actualizarUsuario(Integer id, UsuarioAdminUpdateDTO dto, Integer adminId) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setNombre(dto.getNombre());
        usuario.setApellido(dto.getApellido());
        usuario.setTelefono(dto.getTelefono());

        if (dto.getIdRol() != null) {
            Role rol = roleRepository.findById(dto.getIdRol())
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
            usuario.setRol(rol);
        }

        usuarioRepository.save(usuario);
        registrarActividad(adminId, "ACTUALIZAR", usuario, "Actualizó perfil y rol de " + usuario.getEmail());
    }

    @Transactional
    public void cambiarEstado(Integer id, boolean activo) {
        cambiarEstado(id, activo, null);
    }

    @Transactional
    public void cambiarEstado(Integer id, boolean activo, Integer adminId) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setActivo(activo);
        usuarioRepository.save(usuario);
        registrarActividad(adminId, activo ? "ACTIVAR" : "DESACTIVAR", usuario, (activo ? "Activó " : "Desactivó ") + usuario.getEmail());
    }

    private void registrarActividad(Integer adminId, String accion, Usuario usuario, String resumen) {
        if (adminId == null) {
            return;
        }
        Usuario admin = usuarioRepository.findById(adminId).orElse(null);
        adminActivityLogService.registrar(admin, "USUARIOS", accion, "USUARIO", usuario.getId(), resumen);
    }
}
