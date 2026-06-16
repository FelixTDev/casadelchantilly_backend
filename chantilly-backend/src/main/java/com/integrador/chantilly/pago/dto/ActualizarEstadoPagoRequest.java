package com.integrador.chantilly.pago.dto;

public class ActualizarEstadoPagoRequest {
    private String estadoPago;
    private String referencia;

    public String getEstadoPago() {
        return estadoPago;
    }

    public void setEstadoPago(String estadoPago) {
        this.estadoPago = estadoPago;
    }

    public String getReferencia() {
        return referencia;
    }

    public void setReferencia(String referencia) {
        this.referencia = referencia;
    }
}
