package com.integrador.chantilly.pago.entity;

import com.integrador.chantilly.pedido.entity.Pedido;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "id_pedido")
    private Pedido pedido;

    @Column(name = "metodo_pago", nullable = false, columnDefinition = "ENUM('EFECTIVO','TRANSFERENCIA','YAPE','PLIN')")
    private String metodoPago;

    @Column(name = "estado_pago", columnDefinition = "ENUM('PENDIENTE','CONFIRMADO','RECHAZADO','EXPIRADO','REEMBOLSADO')")
    private String estadoPago;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(length = 100)
    private String referencia;

    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Pedido getPedido() { return pedido; }
    public void setPedido(Pedido pedido) { this.pedido = pedido; }
    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
    public String getEstadoPago() { return estadoPago; }
    public void setEstadoPago(String estadoPago) { this.estadoPago = estadoPago; }
    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }
    public String getReferencia() { return referencia; }
    public void setReferencia(String referencia) { this.referencia = referencia; }
    public LocalDateTime getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDateTime fechaPago) { this.fechaPago = fechaPago; }
}
