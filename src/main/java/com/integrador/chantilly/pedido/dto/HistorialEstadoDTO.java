package com.integrador.chantilly.pedido.dto;

import java.time.LocalDateTime;

public class HistorialEstadoDTO {
    private Integer id;
    private String estado;
    private String comentario;
    private Integer cambiadoPor;
    private String cambiadoPorNombre;
    private LocalDateTime creadoEn;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
    public Integer getCambiadoPor() { return cambiadoPor; }
    public void setCambiadoPor(Integer cambiadoPor) { this.cambiadoPor = cambiadoPor; }
    public String getCambiadoPorNombre() { return cambiadoPorNombre; }
    public void setCambiadoPorNombre(String cambiadoPorNombre) { this.cambiadoPorNombre = cambiadoPorNombre; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }
}
