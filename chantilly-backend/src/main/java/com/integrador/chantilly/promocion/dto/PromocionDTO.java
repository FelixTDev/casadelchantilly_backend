package com.integrador.chantilly.promocion.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class PromocionDTO {
    private Integer id;
    private String nombre;
    private String descripcion;
    private String tipo;
    private BigDecimal valor;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Boolean activo;
    private List<Integer> productoIds;
    private String codigoCupon;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }
    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public List<Integer> getProductoIds() { return productoIds; }
    public void setProductoIds(List<Integer> productoIds) { this.productoIds = productoIds; }
    public String getCodigoCupon() { return codigoCupon; }
    public void setCodigoCupon(String codigoCupon) { this.codigoCupon = codigoCupon; }
}
