package com.integrador.chantilly.producto.service;

import com.integrador.chantilly.producto.dto.CategoriaDTO;
import com.integrador.chantilly.producto.entity.Categoria;
import com.integrador.chantilly.producto.repository.CategoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public List<CategoriaDTO> listarTodas() {
        return categoriaRepository.findByActivoTrue().stream().map(this::toDto).toList();
    }

    @Transactional
    public CategoriaDTO crear(CategoriaDTO dto) {
        Categoria categoria = new Categoria();
        categoria.setNombre(dto.getNombre());
        categoria.setDescripcion(dto.getDescripcion());
        categoria.setImagenUrl(dto.getImagenUrl());
        categoria.setActivo(dto.getActivo() == null ? true : dto.getActivo());
        return toDto(categoriaRepository.save(categoria));
    }

    @Transactional
    public CategoriaDTO actualizar(Integer id, CategoriaDTO dto) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria no encontrada"));
        categoria.setNombre(dto.getNombre());
        categoria.setDescripcion(dto.getDescripcion());
        categoria.setImagenUrl(dto.getImagenUrl());
        if (dto.getActivo() != null) {
            categoria.setActivo(dto.getActivo());
        }
        return toDto(categoriaRepository.save(categoria));
    }

    @Transactional
    public void eliminar(Integer id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria no encontrada"));
        categoria.setActivo(false);
        categoriaRepository.save(categoria);
    }

    private CategoriaDTO toDto(Categoria categoria) {
        CategoriaDTO dto = new CategoriaDTO();
        dto.setId(categoria.getId());
        dto.setNombre(categoria.getNombre());
        dto.setDescripcion(categoria.getDescripcion());
        dto.setImagenUrl(categoria.getImagenUrl());
        dto.setActivo(categoria.getActivo());
        return dto;
    }
}
