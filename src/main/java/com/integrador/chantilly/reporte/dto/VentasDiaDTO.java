package com.integrador.chantilly.reporte.dto;

import java.math.BigDecimal;

public class VentasDiaDTO {
    private String fecha;
    private long cantidad;
    private BigDecimal total;

    public VentasDiaDTO() {}

    public VentasDiaDTO(String fecha, long cantidad, BigDecimal total) {
        this.fecha = fecha;
        this.cantidad = cantidad;
        this.total = total;
    }

    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }
    public long getCantidad() { return cantidad; }
    public void setCantidad(long cantidad) { this.cantidad = cantidad; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
}
