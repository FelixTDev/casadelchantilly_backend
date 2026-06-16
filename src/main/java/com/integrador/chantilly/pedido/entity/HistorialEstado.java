package com.integrador.chantilly.pedido.entity;

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
@Table(name = "historial_estados")
public class HistorialEstado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_pedido")
    private Pedido pedido;

    @Column(nullable = false, length = 50)
    private String estado;

    @Column(length = 255)
    private String comentario;

    @ManyToOne
    @JoinColumn(name = "cambiado_por")
    private Usuario cambiadoPor;

    @Column(name = "creado_en", insertable = false, updatable = false)
    private LocalDateTime creadoEn;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Pedido getPedido() { return pedido; }
    public void setPedido(Pedido pedido) { this.pedido = pedido; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
    public Usuario getCambiadoPor() { return cambiadoPor; }
    public void setCambiadoPor(Usuario cambiadoPor) { this.cambiadoPor = cambiadoPor; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
}
