package com.integrador.chantilly.reporte.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class VentasReporteDTO {
    private long totalPedidos;
    private BigDecimal ingresosTotal;
    private BigDecimal ticketPromedio;
    private long pedidosEntregados;
    private long pedidosCancelados;
    private List<VentasDiaDTO> detallePorFecha = new ArrayList<>();

    public long getTotalPedidos() { return totalPedidos; }
    public void setTotalPedidos(long totalPedidos) { this.totalPedidos = totalPedidos; }
    public BigDecimal getIngresosTotal() { return ingresosTotal; }
    public void setIngresosTotal(BigDecimal ingresosTotal) { this.ingresosTotal = ingresosTotal; }
    public BigDecimal getTicketPromedio() { return ticketPromedio; }
    public void setTicketPromedio(BigDecimal ticketPromedio) { this.ticketPromedio = ticketPromedio; }
    public long getPedidosEntregados() { return pedidosEntregados; }
    public void setPedidosEntregados(long pedidosEntregados) { this.pedidosEntregados = pedidosEntregados; }
    public long getPedidosCancelados() { return pedidosCancelados; }
    public void setPedidosCancelados(long pedidosCancelados) { this.pedidosCancelados = pedidosCancelados; }
    public List<VentasDiaDTO> getDetallePorFecha() { return detallePorFecha; }
    public void setDetallePorFecha(List<VentasDiaDTO> detallePorFecha) { this.detallePorFecha = detallePorFecha; }
}
