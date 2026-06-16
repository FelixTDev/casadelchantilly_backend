package com.integrador.chantilly.producto.dto;

import java.math.BigDecimal;

public class ProductoDTO {
    private Integer id;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private BigDecimal precioOferta;
    private Integer stock;
    private Integer stockMinimo;
    private String imagenUrl;
    private Boolean disponible;
    private Boolean enOferta;
    private Integer tiempoPreparacion;
    private Integer categoriaId;
    private String categoriaNombre;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }
    public BigDecimal getPrecioOferta() { return precioOferta; }
    public void setPrecioOferta(BigDecimal precioOferta) { this.precioOferta = precioOferta; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public Integer getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(Integer stockMinimo) { this.stockMinimo = stockMinimo; }
    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }
    public Boolean getDisponible() { return disponible; }
    public void setDisponible(Boolean disponible) { this.disponible = disponible; }
    public Boolean getEnOferta() { return enOferta; }
    public void setEnOferta(Boolean enOferta) { this.enOferta = enOferta; }
    public Integer getTiempoPreparacion() { return tiempoPreparacion; }
    public void setTiempoPreparacion(Integer tiempoPreparacion) { this.tiempoPreparacion = tiempoPreparacion; }
    public Integer getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Integer categoriaId) { this.categoriaId = categoriaId; }
    public String getCategoriaNombre() { return categoriaNombre; }
    public void setCategoriaNombre(String categoriaNombre) { this.categoriaNombre = categoriaNombre; }
}
