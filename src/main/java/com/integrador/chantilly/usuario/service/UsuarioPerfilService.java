package com.integrador.chantilly.usuario.service;

import com.integrador.chantilly.usuario.dto.DireccionDTO;
import com.integrador.chantilly.usuario.dto.UsuarioPerfilDTO;
import com.integrador.chantilly.usuario.entity.Direccion;
import com.integrador.chantilly.usuario.entity.Usuario;
import com.integrador.chantilly.usuario.repository.DireccionRepository;
import com.integrador.chantilly.usuario.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.integrador.chantilly.usuario.dto.CambiarPasswordDTO;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioPerfilService {

    private final UsuarioRepository usuarioRepository;
    private final DireccionRepository direccionRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioPerfilService(UsuarioRepository usuarioRepository, DireccionRepository direccionRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.direccionRepository = direccionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UsuarioPerfilDTO obtenerPerfil(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        UsuarioPerfilDTO dto = new UsuarioPerfilDTO();
        dto.setNombre(usuario.getNombre());
        dto.setApellido(usuario.getApellido());
        dto.setEmail(usuario.getEmail());
        dto.setTelefono(usuario.getTelefono());
        dto.setDirecciones(listarDirecciones(email));
        return dto;
    }

    public void actualizarPerfil(String email, UsuarioPerfilDTO dto) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setNombre(dto.getNombre());
        usuario.setApellido(dto.getApellido());
        usuario.setTelefono(dto.getTelefono());

        if (dto.getEmail() != null && !dto.getEmail().equals(usuario.getEmail())) {
            if (usuarioRepository.existsByEmail(dto.getEmail())) {
                throw new RuntimeException("El correo electrónico ya está en uso");
            }
            usuario.setEmail(dto.getEmail());
        }

        usuarioRepository.save(usuario);
    }

    public void cambiarPassword(String email, CambiarPasswordDTO dto) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(dto.getPasswordActual(), usuario.getPasswordHash())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }

        usuario.setPasswordHash(passwordEncoder.encode(dto.getPasswordNueva()));
        usuarioRepository.save(usuario);
    }

    public List<DireccionDTO> listarDirecciones(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return direccionRepository.findByUsuarioId(usuario.getId())
                .stream()
                .map(this::toDireccionDto)
                .collect(Collectors.toList());
    }

    public DireccionDTO agregarDireccion(String email, DireccionDTO dto) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Direccion direccion = new Direccion();
        direccion.setEtiqueta(dto.getEtiqueta());
        direccion.setDireccion(dto.getDireccion());
        direccion.setTelefono(dto.getTelefono());
        direccion.setUsuario(usuario);

        Direccion guardada = direccionRepository.save(direccion);
        return toDireccionDto(guardada);
    }

    public DireccionDTO actualizarDireccion(String email, Integer direccionId, DireccionDTO dto) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Direccion direccion = direccionRepository.findById(direccionId)
                .orElseThrow(() -> new RuntimeException("Direccion no encontrada"));

        if (!direccion.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No tiene permisos para editar esta direccion");
        }

        direccion.setEtiqueta(dto.getEtiqueta());
        direccion.setDireccion(dto.getDireccion());
        direccion.setTelefono(dto.getTelefono());
        Direccion actualizada = direccionRepository.save(direccion);
        return toDireccionDto(actualizada);
    }

    public void eliminarDireccion(String email, Integer direccionId) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Direccion direccion = direccionRepository.findById(direccionId)
                .orElseThrow(() -> new RuntimeException("Direccion no encontrada"));

        if (!direccion.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No tiene permisos para eliminar esta direccion");
        }

        direccionRepository.delete(direccion);
    }

    private DireccionDTO toDireccionDto(Direccion direccion) {
        DireccionDTO dto = new DireccionDTO();
        dto.setId(direccion.getId());
        dto.setEtiqueta(direccion.getEtiqueta());
        dto.setDireccion(direccion.getDireccion());
        dto.setTelefono(direccion.getTelefono());
        return dto;
    }
}
