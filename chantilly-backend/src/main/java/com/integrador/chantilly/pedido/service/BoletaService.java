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

            // Colores basados en Tailwind
            Color brandRed = new Color(211, 47, 47); // #D32F2F
            Color darkGray = new Color(51, 51, 51); // #333333
            Color lightGray = new Color(102, 102, 102); // #666666
            Color mutedGray = new Color(153, 153, 153); // #999999
            Color borderGray = new Color(243, 244, 246); // #F3F4F6
            Color bgGray = new Color(249, 250, 251); // #F9FAFB
            Color greenColor = new Color(16, 185, 129); // #10B981

            // Fuentes
            Font brandFont = new Font(Font.HELVETICA, 22, Font.BOLD, brandRed);
            Font subtitleFont = new Font(Font.HELVETICA, 10, Font.NORMAL, darkGray);
            Font labelFont = new Font(Font.HELVETICA, 8, Font.NORMAL, mutedGray);
            Font valueFont = new Font(Font.HELVETICA, 10, Font.NORMAL, darkGray);
            Font valueBoldFont = new Font(Font.HELVETICA, 10, Font.BOLD, darkGray);
            Font thFont = new Font(Font.HELVETICA, 9, Font.BOLD, lightGray);
            Font tdFont = new Font(Font.HELVETICA, 10, Font.NORMAL, darkGray);
            Font tdLightFont = new Font(Font.HELVETICA, 10, Font.NORMAL, lightGray);
            Font totalLabelFont = new Font(Font.HELVETICA, 12, Font.BOLD, darkGray);
            Font totalValueFont = new Font(Font.HELVETICA, 16, Font.BOLD, brandRed);
            Font footerMainFont = new Font(Font.HELVETICA, 12, Font.NORMAL, brandRed);
            Font footerSubFont = new Font(Font.HELVETICA, 9, Font.NORMAL, mutedGray);

            // --- HEADER ---
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{2f, 1f});
            
            PdfPCell h1 = new PdfPCell(new Phrase("La Casa del Chantilly", brandFont));
            h1.setBorder(0);
            h1.setVerticalAlignment(Element.ALIGN_MIDDLE);
            headerTable.addCell(h1);

            PdfPCell h2 = new PdfPCell(new Phrase("Boleta de Venta Electrónica", subtitleFont));
            h2.setBorder(0);
            h2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            h2.setVerticalAlignment(Element.ALIGN_MIDDLE);
            headerTable.addCell(h2);
            document.add(headerTable);

            // Separador superior
            addLineSeparator(document, borderGray);

            // --- INFO PEDIDO ---
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd 'de' MMMM, yyyy");
            String fechaEmision = pedido.getCreadoEn() != null ? pedido.getCreadoEn().format(fmt) : "N/A";
            String cliente = pedido.getUsuario() != null
                    ? pedido.getUsuario().getNombre() + " " + pedido.getUsuario().getApellido()
                    : "Cliente";

            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingBefore(15);
            infoTable.setSpacingAfter(15);

            // Col 1
            PdfPCell col1 = new PdfPCell();
            col1.setBorder(0);
            col1.addElement(new Phrase("CLIENTE", labelFont));
            col1.addElement(new Phrase(cliente, valueFont));
            Paragraph modalSpace = new Paragraph(" "); modalSpace.setSpacingBefore(5); col1.addElement(modalSpace);
            col1.addElement(new Phrase("MODALIDAD", labelFont));
            col1.addElement(new Phrase(pedido.getModalidadEntrega(), valueBoldFont)); // En HTML era con fondo, aquí lo ponemos en negrita
            infoTable.addCell(col1);

            // Col 2
            PdfPCell col2 = new PdfPCell();
            col2.setBorder(0);
            Paragraph codLabel = new Paragraph("CÓDIGO DEL PEDIDO", labelFont); codLabel.setAlignment(Element.ALIGN_RIGHT);
            Paragraph codValue = new Paragraph(pedido.getCodigoPedido(), valueBoldFont); codValue.setAlignment(Element.ALIGN_RIGHT);
            col2.addElement(codLabel);
            col2.addElement(codValue);
            Paragraph fecSpace = new Paragraph(" "); fecSpace.setSpacingBefore(5); col2.addElement(fecSpace);
            Paragraph fecLabel = new Paragraph("FECHA", labelFont); fecLabel.setAlignment(Element.ALIGN_RIGHT);
            Paragraph fecValue = new Paragraph(fechaEmision, valueFont); fecValue.setAlignment(Element.ALIGN_RIGHT);
            col2.addElement(fecLabel);
            col2.addElement(fecValue);
            infoTable.addCell(col2);

            document.add(infoTable);
            addLineSeparator(document, borderGray);

            // --- TABLA DE PRODUCTOS ---
            PdfPTable table = new PdfPTable(new float[]{4f, 1f, 1.5f, 1.5f});
            table.setWidthPercentage(100);
            table.setSpacingBefore(15);

            addTh(table, "PRODUCTO", thFont, bgGray, Element.ALIGN_LEFT);
            addTh(table, "CANT.", thFont, bgGray, Element.ALIGN_CENTER);
            addTh(table, "P. UNIT.", thFont, bgGray, Element.ALIGN_RIGHT);
            addTh(table, "SUBTOTAL", thFont, bgGray, Element.ALIGN_RIGHT);

            for (PedidoItem item : items) {
                String nombre = item.getProducto() != null ? item.getProducto().getNombre() : "Producto";
                BigDecimal precioUnit = item.getPrecioUnitario() != null ? item.getPrecioUnitario() : BigDecimal.ZERO;
                BigDecimal subtotal = item.getSubtotal() != null ? item.getSubtotal() : BigDecimal.ZERO;
                int cantidad = item.getCantidad() != null ? item.getCantidad() : 0;

                addTd(table, nombre, tdFont, borderGray, Element.ALIGN_LEFT);
                addTd(table, String.valueOf(cantidad), tdLightFont, borderGray, Element.ALIGN_CENTER);
                addTd(table, "S/ " + formatDecimal(precioUnit), tdLightFont, borderGray, Element.ALIGN_RIGHT);
                addTd(table, "S/ " + formatDecimal(subtotal), valueBoldFont, borderGray, Element.ALIGN_RIGHT);
            }
            document.add(table);

            // --- TOTALES ---
            document.add(new Paragraph(" "));
            
            // Usamos 3 columnas (5f, 1.5f, 1.5f) para que calcen exactamente debajo de las columnas de la tabla (4+1=5, 1.5, 1.5)
            PdfPTable totals = new PdfPTable(new float[]{5f, 1.5f, 1.5f});
            totals.setWidthPercentage(100);
            totals.setSpacingBefore(5);

            addTotalRow(totals, "Subtotal:", "S/ " + formatDecimal(pedido.getSubtotal()), tdLightFont, tdFont);
            addTotalRow(totals, "Envío:", "S/ " + formatDecimal(pedido.getCostoEnvio()), tdLightFont, tdFont);
            
            if (pedido.getDescuento() != null && pedido.getDescuento().compareTo(BigDecimal.ZERO) > 0) {
                Font greenVal = new Font(Font.HELVETICA, 10, Font.BOLD, greenColor);
                addTotalRow(totals, "Descuento:", "- S/ " + formatDecimal(pedido.getDescuento()), greenVal, greenVal);
            }
            
            // Separador antes del Total
            PdfPCell emptyLine = new PdfPCell(new Phrase(" "));
            emptyLine.setBorder(0);
            totals.addCell(emptyLine);

            PdfPCell lineCell = new PdfPCell(new Phrase(" "));
            lineCell.setColspan(2);
            lineCell.setBorder(0);
            lineCell.setBorderWidthTop(1f);
            lineCell.setBorderColorTop(borderGray);
            lineCell.setPaddingTop(5);
            totals.addCell(lineCell);

            addTotalRow(totals, "TOTAL:", "S/ " + formatDecimal(pedido.getTotal()), totalLabelFont, totalValueFont);

            document.add(totals);

            // --- FOOTER ---
            document.add(new Paragraph(" "));
            addLineSeparator(document, borderGray);
            
            Paragraph footer1 = new Paragraph("¡Gracias por endulzar tu día con nosotros!", footerMainFont);
            footer1.setAlignment(Element.ALIGN_CENTER);
            footer1.setSpacingBefore(15);
            document.add(footer1);

            Paragraph footer2 = new Paragraph("Todos los derechos reservados", footerSubFont);
            footer2.setAlignment(Element.ALIGN_CENTER);
            footer2.setSpacingBefore(5);
            document.add(footer2);

        } catch (Exception e) {
            throw new RuntimeException("Error generando PDF: " + e.getMessage(), e);
        } finally {
            document.close();
        }

        return baos.toByteArray();
    }

    private void addLineSeparator(Document document, Color color) throws Exception {
        PdfPTable line = new PdfPTable(1);
        line.setWidthPercentage(100);
        PdfPCell c = new PdfPCell(new Phrase(" "));
        c.setBorder(0);
        c.setBorderWidthBottom(1f);
        c.setBorderColorBottom(color);
        c.setPadding(0);
        c.setMinimumHeight(10);
        line.addCell(c);
        document.add(line);
    }

    private void addTh(PdfPTable table, String text, Font font, Color bg, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setHorizontalAlignment(align);
        cell.setBorder(0);
        cell.setPaddingTop(8);
        cell.setPaddingBottom(8);
        table.addCell(cell);
    }

    private void addTd(PdfPTable table, String text, Font font, Color borderCol, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(align);
        cell.setBorder(0);
        cell.setBorderWidthBottom(1f);
        cell.setBorderColorBottom(borderCol);
        cell.setPaddingTop(12);
        cell.setPaddingBottom(12);
        table.addCell(cell);
    }

    private void addTotalRow(PdfPTable table, String label, String value, Font fontLabel, Font fontValue) {
        // Celda vacía a la izquierda para empujar los totales a la derecha
        PdfPCell empty = new PdfPCell(new Phrase(" "));
        empty.setBorder(0);
        table.addCell(empty);

        PdfPCell labelCell = new PdfPCell(new Phrase(label, fontLabel));
        labelCell.setBorder(0);
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelCell.setPaddingTop(6);
        labelCell.setPaddingBottom(6);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, fontValue));
        valueCell.setBorder(0);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valueCell.setPaddingTop(6);
        valueCell.setPaddingBottom(6);
        table.addCell(valueCell);
    }

    private String formatDecimal(BigDecimal val) {
        return val != null ? val.setScale(2).toPlainString() : "0.00";
    }
}
