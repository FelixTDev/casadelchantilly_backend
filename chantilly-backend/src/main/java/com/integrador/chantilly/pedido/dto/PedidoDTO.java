package com.integrador.chantilly.pedido.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import com.integrador.chantilly.pago.dto.PagoDTO;

public class PedidoDTO {
    private Integer id;
    private String codigoPedido;
    private String estado;
    private String modalidadEntrega;
    private Integer idDireccion;
    private String direccionEtiqueta;
    private String direccionDetalle;
    private String direccionTelefono;
    private String clienteNombre;
    private String clienteEmail;
    private String clienteTelefono;
    private LocalDate fechaEntrega;
    private LocalTime horaEntrega;
    private BigDecimal subtotal;
    private BigDecimal costoEnvio;
    private BigDecimal descuento;
    private BigDecimal total;
    private String notasCliente;
    private PagoDTO pago;
    private List<PedidoItemDTO> items = new ArrayList<>();
    private List<HistorialEstadoDTO> historialEstados = new ArrayList<>();
    private LocalDateTime creadoEn;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getCodigoPedido() { return codigoPedido; }
    public void setCodigoPedido(String codigoPedido) { this.codigoPedido = codigoPedido; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getModalidadEntrega() { return modalidadEntrega; }
    public void setModalidadEntrega(String modalidadEntrega) { this.modalidadEntrega = modalidadEntrega; }
    public Integer getIdDireccion() { return idDireccion; }
    public void setIdDireccion(Integer idDireccion) { this.idDireccion = idDireccion; }
    public String getDireccionEtiqueta() { return direccionEtiqueta; }
    public void setDireccionEtiqueta(String direccionEtiqueta) { this.direccionEtiqueta = direccionEtiqueta; }
    public String getDireccionDetalle() { return direccionDetalle; }
    public void setDireccionDetalle(String direccionDetalle) { this.direccionDetalle = direccionDetalle; }
    public String getDireccionTelefono() { return direccionTelefono; }
    public void setDireccionTelefono(String direccionTelefono) { this.direccionTelefono = direccionTelefono; }
    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }
    public String getClienteEmail() { return clienteEmail; }
    public void setClienteEmail(String clienteEmail) { this.clienteEmail = clienteEmail; }
    public String getClienteTelefono() { return clienteTelefono; }
    public void setClienteTelefono(String clienteTelefono) { this.clienteTelefono = clienteTelefono; }
    public LocalDate getFechaEntrega() { return fechaEntrega; }
    public void setFechaEntrega(LocalDate fechaEntrega) { this.fechaEntrega = fechaEntrega; }
    public LocalTime getHoraEntrega() { return horaEntrega; }
    public void setHoraEntrega(LocalTime horaEntrega) { this.horaEntrega = horaEntrega; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public BigDecimal getCostoEnvio() { return costoEnvio; }
    public void setCostoEnvio(BigDecimal costoEnvio) { this.costoEnvio = costoEnvio; }
    public BigDecimal getDescuento() { return descuento; }
    public void setDescuento(BigDecimal descuento) { this.descuento = descuento; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public String getNotasCliente() { return notasCliente; }
    public void setNotasCliente(String notasCliente) { this.notasCliente = notasCliente; }
    public PagoDTO getPago() { return pago; }
    public void setPago(PagoDTO pago) { this.pago = pago; }
    public List<PedidoItemDTO> getItems() { return items; }
    public void setItems(List<PedidoItemDTO> items) { this.items = items; }
    public List<HistorialEstadoDTO> getHistorialEstados() { return historialEstados; }
    public void setHistorialEstados(List<HistorialEstadoDTO> historialEstados) { this.historialEstados = historialEstados; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }
}
