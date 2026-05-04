package com.integrador.chantilly.pedido.service;

import com.integrador.chantilly.pedido.entity.Pedido;
import com.integrador.chantilly.pedido.entity.PedidoItem;
import com.integrador.chantilly.pedido.repository.PedidoItemRepository;
import com.integrador.chantilly.pedido.repository.PedidoRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class BoletaService {

    private final PedidoRepository pedidoRepository;
    private final PedidoItemRepository pedidoItemRepository;

    public BoletaService(PedidoRepository pedidoRepository, PedidoItemRepository pedidoItemRepository) {
        this.pedidoRepository = pedidoRepository;
        this.pedidoItemRepository = pedidoItemRepository;
    }

    public byte[] generarBoleta(Integer pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        List<PedidoItem> items = pedidoItemRepository.findByPedidoId(pedidoId);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40, 40, 40, 40);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 22, Font.BOLD, new Color(183, 28, 28));
            Font subtitleFont = new Font(Font.HELVETICA, 11, Font.NORMAL, new Color(100, 100, 100));
            Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
            Font cellFont = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(51, 51, 51));
            Font boldFont = new Font(Font.HELVETICA, 11, Font.BOLD, new Color(51, 51, 51));
            Font totalFont = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(183, 28, 28));

            Paragraph title = new Paragraph("La Casa del Chantilly", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph sub = new Paragraph("Boleta de Venta Electronica", subtitleFont);
            sub.setAlignment(Element.ALIGN_CENTER);
            sub.setSpacingAfter(20);
            document.add(sub);

            Paragraph line = new Paragraph("________________________________________________________");
            line.setAlignment(Element.ALIGN_CENTER);
            line.setSpacingAfter(15);
            document.add(line);

            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            String fechaEmision = pedido.getCreadoEn() != null ? pedido.getCreadoEn().format(fmt) : "N/A";
            String cliente = pedido.getUsuario() != null
                    ? pedido.getUsuario().getNombre() + " " + pedido.getUsuario().getApellido()
                    : "Cliente";

            document.add(new Paragraph("Codigo: " + pedido.getCodigoPedido(), boldFont));
            document.add(new Paragraph("Fecha de emision: " + fechaEmision, cellFont));
            document.add(new Paragraph("Cliente: " + cliente, cellFont));
            document.add(new Paragraph("Modalidad: " + pedido.getModalidadEntrega(), cellFont));

            Paragraph spacer = new Paragraph(" ");
            spacer.setSpacingAfter(10);
            document.add(spacer);

            PdfPTable table = new PdfPTable(new float[]{4f, 1f, 1.5f, 1.5f});
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);

            Color headerBg = new Color(183, 28, 28);
            addHeaderCell(table, "Producto", headerFont, headerBg);
            addHeaderCell(table, "Cant.", headerFont, headerBg);
            addHeaderCell(table, "P. Unit.", headerFont, headerBg);
            addHeaderCell(table, "Subtotal", headerFont, headerBg);

            for (PedidoItem item : items) {
                String nombre = item.getProducto() != null ? item.getProducto().getNombre() : "Producto";
                BigDecimal precioUnit = item.getPrecioUnitario() != null ? item.getPrecioUnitario() : BigDecimal.ZERO;
                BigDecimal subtotal = item.getSubtotal() != null ? item.getSubtotal() : BigDecimal.ZERO;
                int cantidad = item.getCantidad() != null ? item.getCantidad() : 0;

                addCell(table, nombre, cellFont);
                addCell(table, String.valueOf(cantidad), cellFont);
                addCell(table, "S/ " + precioUnit.setScale(2).toPlainString(), cellFont);
                addCell(table, "S/ " + subtotal.setScale(2).toPlainString(), cellFont);
            }

            document.add(table);

            document.add(new Paragraph(" "));

            PdfPTable totals = new PdfPTable(new float[]{3f, 1f});
            totals.setWidthPercentage(50);
            totals.setHorizontalAlignment(Element.ALIGN_RIGHT);

            addTotalRow(totals, "Subtotal:", "S/ " + formatDecimal(pedido.getSubtotal()), cellFont);
            addTotalRow(totals, "Envio:", "S/ " + formatDecimal(pedido.getCostoEnvio()), cellFont);
            if (pedido.getDescuento() != null && pedido.getDescuento().compareTo(BigDecimal.ZERO) > 0) {
                addTotalRow(totals, "Descuento:", "-S/ " + formatDecimal(pedido.getDescuento()), cellFont);
            }
            addTotalRow(totals, "TOTAL:", "S/ " + formatDecimal(pedido.getTotal()), totalFont);

            document.add(totals);

            document.add(new Paragraph(" "));
            Paragraph footer = new Paragraph("Gracias por su compra!", subtitleFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(20);
            document.add(footer);

            Paragraph footer2 = new Paragraph("La Casa del Chantilly - Todos los derechos reservados", subtitleFont);
            footer2.setAlignment(Element.ALIGN_CENTER);
            document.add(footer2);

        } catch (Exception e) {
            throw new RuntimeException("Error generando PDF: " + e.getMessage(), e);
        } finally {
            document.close();
        }

        return baos.toByteArray();
    }

    private void addHeaderCell(PdfPTable table, String text, Font font, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(8);
        table.addCell(cell);
    }

    private void addCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(6);
        cell.setBorderColor(new Color(220, 220, 220));
        table.addCell(cell);
    }

    private void addTotalRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, font));
        labelCell.setBorder(0);
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelCell.setPadding(4);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, font));
        valueCell.setBorder(0);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valueCell.setPadding(4);
        table.addCell(valueCell);
    }

    private String formatDecimal(BigDecimal val) {
        return val != null ? val.setScale(2).toPlainString() : "0.00";
    }
}
