package com.integrador.chantilly.pedido.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public class CrearPedidoRequest {

    @NotBlank(message = "La modalidad de entrega es obligatoria")
    private String modalidadEntrega;

    private Integer idDireccion;

    @NotNull(message = "La fecha de entrega es obligatoria")
    private LocalDate fechaEntrega;

    private LocalTime horaEntrega;

    private String notasCliente;

    private String codigoCupon;

    public String getModalidadEntrega() { return modalidadEntrega; }
    public void setModalidadEntrega(String modalidadEntrega) { this.modalidadEntrega = modalidadEntrega; }
    public Integer getIdDireccion() { return idDireccion; }
    public void setIdDireccion(Integer idDireccion) { this.idDireccion = idDireccion; }
    public LocalDate getFechaEntrega() { return fechaEntrega; }
    public void setFechaEntrega(LocalDate fechaEntrega) { this.fechaEntrega = fechaEntrega; }
    public LocalTime getHoraEntrega() { return horaEntrega; }
    public void setHoraEntrega(LocalTime horaEntrega) { this.horaEntrega = horaEntrega; }
    public String getNotasCliente() { return notasCliente; }
    public void setNotasCliente(String notasCliente) { this.notasCliente = notasCliente; }
    public String getCodigoCupon() { return codigoCupon; }
    public void setCodigoCupon(String codigoCupon) { this.codigoCupon = codigoCupon; }
}
