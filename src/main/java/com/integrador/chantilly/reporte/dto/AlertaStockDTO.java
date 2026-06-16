package com.integrador.chantilly.reporte.dto;

import java.time.LocalDateTime;

public class AlertaStockDTO {
    private Integer id;
    private Integer productoId;
    private String nombreProducto;
    private Integer stockActual;
    private Integer stockMinimo;
    private LocalDateTime creadoEn;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getProductoId() { return productoId; }
    public void setProductoId(Integer productoId) { this.productoId = productoId; }
    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }
    public Integer getStockActual() { return stockActual; }
    public void setStockActual(Integer stockActual) { this.stockActual = stockActual; }
    public Integer getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(Integer stockMinimo) { this.stockMinimo = stockMinimo; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }
}
