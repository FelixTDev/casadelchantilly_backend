package com.integrador.chantilly.reporte.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class DashboardDTO {
    private BigDecimal ventasHoyTotal;
    private long ventasHoyCantidad;
    private long pedidosPendientes;
    private long alertasStockActivas;
    private long totalClientes;
    private BigDecimal tasaConversion;
    private BigDecimal ticketDelivery;
    private BigDecimal ticketRecojoTienda;
    private BigDecimal tiempoEntregaPromedioHoras;
    private List<VentasDiaDTO> ventasSemana = new ArrayList<>();

    public BigDecimal getVentasHoyTotal() { return ventasHoyTotal; }
    public void setVentasHoyTotal(BigDecimal ventasHoyTotal) { this.ventasHoyTotal = ventasHoyTotal; }
    public long getVentasHoyCantidad() { return ventasHoyCantidad; }
    public void setVentasHoyCantidad(long ventasHoyCantidad) { this.ventasHoyCantidad = ventasHoyCantidad; }
    public long getPedidosPendientes() { return pedidosPendientes; }
    public void setPedidosPendientes(long pedidosPendientes) { this.pedidosPendientes = pedidosPendientes; }
    public long getAlertasStockActivas() { return alertasStockActivas; }
    public void setAlertasStockActivas(long alertasStockActivas) { this.alertasStockActivas = alertasStockActivas; }
    public long getTotalClientes() { return totalClientes; }
    public void setTotalClientes(long totalClientes) { this.totalClientes = totalClientes; }
    public BigDecimal getTasaConversion() { return tasaConversion; }
    public void setTasaConversion(BigDecimal tasaConversion) { this.tasaConversion = tasaConversion; }
    public BigDecimal getTicketDelivery() { return ticketDelivery; }
    public void setTicketDelivery(BigDecimal ticketDelivery) { this.ticketDelivery = ticketDelivery; }
    public BigDecimal getTicketRecojoTienda() { return ticketRecojoTienda; }
    public void setTicketRecojoTienda(BigDecimal ticketRecojoTienda) { this.ticketRecojoTienda = ticketRecojoTienda; }
    public BigDecimal getTiempoEntregaPromedioHoras() { return tiempoEntregaPromedioHoras; }
    public void setTiempoEntregaPromedioHoras(BigDecimal tiempoEntregaPromedioHoras) { this.tiempoEntregaPromedioHoras = tiempoEntregaPromedioHoras; }
    public List<VentasDiaDTO> getVentasSemana() { return ventasSemana; }
    public void setVentasSemana(List<VentasDiaDTO> ventasSemana) { this.ventasSemana = ventasSemana; }
}
