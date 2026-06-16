package com.integrador.chantilly.usuario.dto;

import jakarta.validation.constraints.NotBlank;

public class DireccionDTO {
    private Integer id;
    
    @NotBlank(message = "La etiqueta es obligatoria (ej. Casa)")
    private String etiqueta;
    
    @NotBlank(message = "La dirección es obligatoria")
    private String direccion;
    
    private String telefono;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getEtiqueta() { return etiqueta; }
    public void setEtiqueta(String etiqueta) { this.etiqueta = etiqueta; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
}
