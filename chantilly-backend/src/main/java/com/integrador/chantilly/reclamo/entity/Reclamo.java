package com.integrador.chantilly.reclamo.entity;

import com.integrador.chantilly.pedido.entity.Pedido;
import com.integrador.chantilly.usuario.entity.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "reclamos")
public class Reclamo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_pedido")
    private Pedido pedido;

    @Column(nullable = false, columnDefinition = "ENUM('PRODUCTO_INCORRECTO','PRODUCTO_DANADO','RETRASO','OTRO')")
    private String tipo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false, length = 30)
    private String estado;

    @Column(columnDefinition = "TEXT")
    private String resolucion;

    @Column(name = "tipo_solucion", columnDefinition = "ENUM('REEMBOLSO','REPOSICION','SIN_ACCION')")
    private String tipoSolucion;

    @Column(name = "creado_en", insertable = false, updatable = false)
    private LocalDateTime creadoEn;

    @Column(name = "resuelto_en")
    private LocalDateTime resueltoEn;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public Pedido getPedido() { return pedido; }
    public void setPedido(Pedido pedido) { this.pedido = pedido; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getResolucion() { return resolucion; }
    public void setResolucion(String resolucion) { this.resolucion = resolucion; }
    public String getTipoSolucion() { return tipoSolucion; }
    public void setTipoSolucion(String tipoSolucion) { this.tipoSolucion = tipoSolucion; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public LocalDateTime getResueltoEn() { return resueltoEn; }
    public void setResueltoEn(LocalDateTime resueltoEn) { this.resueltoEn = resueltoEn; }
}
