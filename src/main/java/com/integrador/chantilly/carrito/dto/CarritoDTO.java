package com.integrador.chantilly.carrito.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CarritoDTO {
    private Integer id;
    private Integer usuarioId;
    private List<CarritoItemDTO> items = new ArrayList<>();
    private BigDecimal subtotal;
    private Integer totalItems;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Integer usuarioId) { this.usuarioId = usuarioId; }
    public List<CarritoItemDTO> getItems() { return items; }
    public void setItems(List<CarritoItemDTO> items) { this.items = items; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public Integer getTotalItems() { return totalItems; }
    public void setTotalItems(Integer totalItems) { this.totalItems = totalItems; }
}
