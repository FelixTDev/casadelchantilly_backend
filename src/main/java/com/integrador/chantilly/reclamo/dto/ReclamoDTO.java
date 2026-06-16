package com.integrador.chantilly.reclamo.dto;

import java.time.LocalDateTime;

public class ReclamoDTO {
    private Integer id;
    private Integer usuarioId;
    private Integer pedidoId;
    private String tipo;
    private String descripcion;
    private String estado;
    private String resolucion;
    private String tipoSolucion;
    private LocalDateTime creadoEn;
    private LocalDateTime resueltoEn;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }
    public Integer getPedidoId() { return pedidoId; }
    public void setPedidoId(Integer pedidoId) { this.pedidoId = pedidoId; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getResolucion() { return resolucion; }
    public void setResolucion(String resolucion) { this.resolucion = resolucion; }
    public String getTipoSolucion() { return tipoSolucion; }
    public void setTipoSolucion(String tipoSolucion) { this.tipoSolucion = tipoSolucion; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }
    public LocalDateTime getResueltoEn() { return resueltoEn; }
    public void setResueltoEn(LocalDateTime resueltoEn) { this.resueltoEn = resueltoEn; }
}
