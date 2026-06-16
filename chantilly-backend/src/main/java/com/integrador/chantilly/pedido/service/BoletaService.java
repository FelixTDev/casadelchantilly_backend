package com.integrador.chantilly.pedido.service;

import com.integrador.chantilly.pago.entity.Pago;
import com.integrador.chantilly.pago.repository.PagoRepository;
import com.integrador.chantilly.pedido.entity.Pedido;
import com.integrador.chantilly.pedido.entity.PedidoItem;
import com.integrador.chantilly.pedido.repository.PedidoItemRepository;
import com.integrador.chantilly.usuario.entity.Direccion;
import com.integrador.chantilly.usuario.repository.DireccionRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Rectangle;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class BoletaService {

    private final PedidoItemRepository pedidoItemRepository;
    private final PedidoService pedidoService;
    private final PagoRepository pagoRepository;
    private final DireccionRepository direccionRepository;

    public BoletaService(PedidoItemRepository pedidoItemRepository,
                         PedidoService pedidoService,
                         PagoRepository pagoRepository,
                         DireccionRepository direccionRepository) {
        this.pedidoItemRepository = pedidoItemRepository;
        this.pedidoService = pedidoService;
        this.pagoRepository = pagoRepository;
        this.direccionRepository = direccionRepository;
    }

    public byte[] generarBoleta(Integer pedidoId, Integer usuarioId) {
        Pedido pedido = pedidoService.obtenerPedidoAutorizado(pedidoId, usuarioId);
        List<PedidoItem> items = pedidoItemRepository.findByPedidoId(pedidoId);
        Optional<Pago> pago = pagoRepository.findByPedidoId(pedidoId);
        Optional<Direccion> direccion = pedido.getIdDireccion() == null
                ? Optional.empty()
                : direccionRepository.findById(pedido.getIdDireccion());

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40, 40, 40, 40);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            Color brandRed = new Color(184, 58, 58);
            Color brandRose = new Color(244, 228, 228);
            Color darkGray = new Color(51, 51, 51);
            Color lightGray = new Color(102, 102, 102);
            Color mutedGray = new Color(153, 153, 153);
            Color borderGray = new Color(229, 231, 235);
            Color bgGray = new Color(249, 250, 251);
            Color greenColor = new Color(16, 185, 129);

            Font brandMarkFont = new Font(Font.HELVETICA, 18, Font.BOLD, Color.WHITE);
            Font brandFont = new Font(Font.HELVETICA, 22, Font.BOLD, brandRed);
            Font subtitleFont = new Font(Font.HELVETICA, 10, Font.NORMAL, darkGray);
            Font legalFont = new Font(Font.HELVETICA, 8, Font.NORMAL, mutedGray);
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

            PdfPTable ribbon = new PdfPTable(1);
            ribbon.setWidthPercentage(100);
            PdfPCell ribbonCell = new PdfPCell(new Phrase("BOLETA DE VENTA ELECTRONICA", new Font(Font.HELVETICA, 8, Font.BOLD, Color.WHITE)));
            ribbonCell.setBorder(Rectangle.NO_BORDER);
            ribbonCell.setBackgroundColor(brandRed);
            ribbonCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            ribbonCell.setPaddingTop(6);
            ribbonCell.setPaddingBottom(6);
            ribbon.addCell(ribbonCell);
            document.add(ribbon);

            PdfPTable headerTable = new PdfPTable(3);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{0.6f, 2.2f, 1.1f});
            headerTable.setSpacingBefore(16);

            PdfPCell logoCell = new PdfPCell();
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.setBackgroundColor(brandRose);
            logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            logoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            logoCell.setFixedHeight(58f);
            Paragraph logoMark = new Paragraph("LC", brandMarkFont);
            logoMark.setAlignment(Element.ALIGN_CENTER);
            logoCell.addElement(logoMark);
            headerTable.addCell(logoCell);

            PdfPCell h1 = new PdfPCell();
            h1.setBorder(Rectangle.NO_BORDER);
            h1.setPaddingLeft(12);
            h1.addElement(new Phrase("La Casa del Chantilly", brandFont));
            h1.addElement(new Phrase("Pasteleria fina para celebraciones memorables", subtitleFont));
            h1.addElement(new Phrase("RUC 20123456789 · Lima, Peru", legalFont));
            headerTable.addCell(h1);

            PdfPCell h2 = new PdfPCell();
            h2.setBorder(Rectangle.NO_BORDER);
            h2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph issueTitle = new Paragraph("Comprobante emitido", new Font(Font.HELVETICA, 9, Font.BOLD, lightGray));
            issueTitle.setAlignment(Element.ALIGN_RIGHT);
            Paragraph issueSubtitle = new Paragraph("Uso interno y atencion al cliente", legalFont);
            issueSubtitle.setAlignment(Element.ALIGN_RIGHT);
            h2.addElement(issueTitle);
            h2.addElement(issueSubtitle);
            headerTable.addCell(h2);
            document.add(headerTable);

            addLineSeparator(document, borderGray);

            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd 'de' MMMM, yyyy");
            String fechaEmision = pedido.getCreadoEn() != null ? pedido.getCreadoEn().format(fmt) : "N/A";
            String cliente = pedido.getUsuario() != null
                    ? pedido.getUsuario().getNombre() + " " + pedido.getUsuario().getApellido()
                    : "Cliente";
            String modalidad = "DELIVERY".equalsIgnoreCase(pedido.getModalidadEntrega()) ? "Delivery" : "Recojo en tienda";

            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingBefore(15);
            infoTable.setSpacingAfter(15);

            PdfPCell col1 = new PdfPCell();
            col1.setBorder(0);
            col1.addElement(new Phrase("CLIENTE", labelFont));
            col1.addElement(new Phrase(cliente, valueFont));
            col1.addElement(new Phrase(orDash(pedido.getUsuario() != null ? pedido.getUsuario().getEmail() : null), valueFont));
            col1.addElement(new Phrase(orDash(pedido.getUsuario() != null ? pedido.getUsuario().getTelefono() : null), valueFont));
            Paragraph modalSpace = new Paragraph(" ");
            modalSpace.setSpacingBefore(5);
            col1.addElement(modalSpace);
            col1.addElement(new Phrase("MODALIDAD", labelFont));
            col1.addElement(new Phrase(modalidad, valueBoldFont));
            if (direccion.isPresent()) {
                Paragraph dirSpace = new Paragraph(" ");
                dirSpace.setSpacingBefore(5);
                col1.addElement(dirSpace);
                col1.addElement(new Phrase("DIRECCIÓN DE ENTREGA", labelFont));
                col1.addElement(new Phrase(direccion.get().getEtiqueta() + ": " + direccion.get().getDireccion(), valueFont));
                if (direccion.get().getTelefono() != null && !direccion.get().getTelefono().isBlank()) {
                    col1.addElement(new Phrase("Contacto: " + direccion.get().getTelefono(), valueFont));
                }
            }
            infoTable.addCell(col1);

            PdfPCell col2 = new PdfPCell();
            col2.setBorder(0);
            Paragraph codLabel = new Paragraph("CÓDIGO DEL PEDIDO", labelFont);
            codLabel.setAlignment(Element.ALIGN_RIGHT);
            Paragraph codValue = new Paragraph(pedido.getCodigoPedido(), valueBoldFont);
            codValue.setAlignment(Element.ALIGN_RIGHT);
            col2.addElement(codLabel);
            col2.addElement(codValue);
            Paragraph fecSpace = new Paragraph(" ");
            fecSpace.setSpacingBefore(5);
            col2.addElement(fecSpace);
            Paragraph fecLabel = new Paragraph("FECHA", labelFont);
            fecLabel.setAlignment(Element.ALIGN_RIGHT);
            Paragraph fecValue = new Paragraph(fechaEmision, valueFont);
            fecValue.setAlignment(Element.ALIGN_RIGHT);
            col2.addElement(fecLabel);
            col2.addElement(fecValue);
            Paragraph pagoSpace = new Paragraph(" ");
            pagoSpace.setSpacingBefore(5);
            col2.addElement(pagoSpace);
            Paragraph pagoLabel = new Paragraph("PAGO", labelFont);
            pagoLabel.setAlignment(Element.ALIGN_RIGHT);
            Paragraph pagoValue = new Paragraph(pago.map(Pago::getMetodoPago).orElse("NO REGISTRADO"), valueBoldFont);
            pagoValue.setAlignment(Element.ALIGN_RIGHT);
            col2.addElement(pagoLabel);
            col2.addElement(pagoValue);
            Paragraph estadoPagoLabel = new Paragraph("ESTADO DE PAGO", labelFont);
            estadoPagoLabel.setAlignment(Element.ALIGN_RIGHT);
            Paragraph estadoPagoValue = new Paragraph(pago.map(Pago::getEstadoPago).orElse("PENDIENTE"), valueFont);
            estadoPagoValue.setAlignment(Element.ALIGN_RIGHT);
            col2.addElement(estadoPagoLabel);
            col2.addElement(estadoPagoValue);
            if (pago.isPresent() && pago.get().getReferencia() != null && !pago.get().getReferencia().isBlank()) {
                Paragraph refLabel = new Paragraph("REFERENCIA", labelFont);
                refLabel.setAlignment(Element.ALIGN_RIGHT);
                Paragraph refValue = new Paragraph(pago.get().getReferencia(), valueFont);
                refValue.setAlignment(Element.ALIGN_RIGHT);
                col2.addElement(refLabel);
                col2.addElement(refValue);
            }
            if (pago.isPresent() && pago.get().getFechaPago() != null) {
                Paragraph fechaPagoLabel = new Paragraph("FECHA DE REGISTRO", labelFont);
                fechaPagoLabel.setAlignment(Element.ALIGN_RIGHT);
                Paragraph fechaPagoValue = new Paragraph(formatDateTime(pago.get().getFechaPago()), valueFont);
                fechaPagoValue.setAlignment(Element.ALIGN_RIGHT);
                col2.addElement(fechaPagoLabel);
                col2.addElement(fechaPagoValue);
            }
            infoTable.addCell(col2);

            document.add(infoTable);
            addLineSeparator(document, borderGray);

            PdfPTable serviceMessage = new PdfPTable(1);
            serviceMessage.setWidthPercentage(100);
            serviceMessage.setSpacingBefore(12);
            PdfPCell serviceCell = new PdfPCell(new Phrase("Este documento resume tu compra, el metodo de pago registrado y el estado operativo del pedido para seguimiento postventa.", subtitleFont));
            serviceCell.setBorder(Rectangle.NO_BORDER);
            serviceCell.setBackgroundColor(bgGray);
            serviceCell.setPadding(10);
            serviceCell.setHorizontalAlignment(Element.ALIGN_LEFT);
            serviceMessage.addCell(serviceCell);
            document.add(serviceMessage);

            PdfPTable table = new PdfPTable(new float[]{4f, 1f, 1.5f, 1.5f});
            table.setWidthPercentage(100);
            table.setSpacingBefore(15);

            addTh(table, "PRODUCTO", thFont, bgGray, Element.ALIGN_LEFT);
            addTh(table, "CANT.", thFont, bgGray, Element.ALIGN_CENTER);
            addTh(table, "P. UNIT.", thFont, bgGray, Element.ALIGN_RIGHT);
            addTh(table, "SUBTOTAL", thFont, bgGray, Element.ALIGN_RIGHT);

            for (PedidoItem item : items) {
                String nombre = item.getProducto() != null ? item.getProducto().getNombre() : "Producto";
                if (item.getPersonalizacion() != null && !item.getPersonalizacion().isBlank()) {
                    nombre = nombre + "\nDedicatoria: " + item.getPersonalizacion();
                }
                BigDecimal precioUnit = item.getPrecioUnitario() != null ? item.getPrecioUnitario() : BigDecimal.ZERO;
                BigDecimal subtotal = item.getSubtotal() != null ? item.getSubtotal() : BigDecimal.ZERO;
                int cantidad = item.getCantidad() != null ? item.getCantidad() : 0;

                addTd(table, nombre, tdFont, borderGray, Element.ALIGN_LEFT);
                addTd(table, String.valueOf(cantidad), tdLightFont, borderGray, Element.ALIGN_CENTER);
                addTd(table, "S/ " + formatDecimal(precioUnit), tdLightFont, borderGray, Element.ALIGN_RIGHT);
                addTd(table, "S/ " + formatDecimal(subtotal), valueBoldFont, borderGray, Element.ALIGN_RIGHT);
            }
            document.add(table);

            document.add(new Paragraph(" "));

            PdfPTable totals = new PdfPTable(new float[]{5f, 1.5f, 1.5f});
            totals.setWidthPercentage(100);
            totals.setSpacingBefore(5);

            addTotalRow(totals, "Subtotal:", "S/ " + formatDecimal(pedido.getSubtotal()), tdLightFont, tdFont);
            addTotalRow(totals, "Envío:", "S/ " + formatDecimal(pedido.getCostoEnvio()), tdLightFont, tdFont);

            if (pedido.getDescuento() != null && pedido.getDescuento().compareTo(BigDecimal.ZERO) > 0) {
                Font greenVal = new Font(Font.HELVETICA, 10, Font.BOLD, greenColor);
                addTotalRow(totals, "Descuento:", "- S/ " + formatDecimal(pedido.getDescuento()), greenVal, greenVal);
            }

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

            if (pedido.getNotasCliente() != null && !pedido.getNotasCliente().isBlank()) {
                Paragraph notasTitulo = new Paragraph("Observaciones del cliente", valueBoldFont);
                notasTitulo.setSpacingBefore(16);
                document.add(notasTitulo);
                Paragraph notas = new Paragraph(pedido.getNotasCliente(), valueFont);
                notas.setSpacingBefore(6);
                document.add(notas);
            }

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

    private String formatDateTime(LocalDateTime value) {
        return value.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
    }

    private String orDash(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }
}
