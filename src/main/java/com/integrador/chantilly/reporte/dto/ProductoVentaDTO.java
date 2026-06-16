package com.integrador.chantilly.reporte.dto;

import java.math.BigDecimal;

public class ProductoVentaDTO {
    private Integer id;
    private String nombre;
    private String categoria;
    private long totalVendido;
    private BigDecimal ingresosGenerados;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public long getTotalVendido() { return totalVendido; }
    public void setTotalVendido(long totalVendido) { this.totalVendido = totalVendido; }
    public BigDecimal getIngresosGenerados() { return ingresosGenerados; }
    public void setIngresosGenerados(BigDecimal ingresosGenerados) { this.ingresosGenerados = ingresosGenerados; }
}
