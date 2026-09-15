package com.medistock.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Shared table -> file rendering used by every report / export format so
 * a single row model (List of String[] rows, rows.get(0) = header) can be
 * downloaded as CSV, Excel (.xlsx) or PDF without duplicating layout logic
 * per-report.
 */
@Component
public class ReportExportUtil {

    // ---------------------------------------------------------------- CSV
    public byte[] toCsv(List<String[]> rows) {
        StringBuilder sb = new StringBuilder();
        for (String[] row : rows) {
            for (int i = 0; i < row.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(csvEscape(row[i]));
            }
            sb.append("\n");
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String csvEscape(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    // --------------------------------------------------------------- XLSX
    public byte[] toXlsx(String sheetTitle, List<String[]> rows) {
        return toXlsx(sheetTitle, rows, 0);
    }

    /** @param headerRowIndex which row gets the bold/teal header style — 0 normally, or later when metadata rows (title/generated-by) precede the real header. */
    public byte[] toXlsx(String sheetTitle, List<String[]> rows, int headerRowIndex) {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet(safeSheetName(sheetTitle));

            CellStyle headerStyle = wb.createCellStyle();
            Font headerFont = wb.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.TEAL.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            for (int r = 0; r < rows.size(); r++) {
                Row row = sheet.createRow(r);
                String[] cells = rows.get(r);
                for (int c = 0; c < cells.length; c++) {
                    Cell cell = row.createCell(c);
                    cell.setCellValue(cells[c] == null ? "" : cells[c]);
                    if (r == headerRowIndex) cell.setCellStyle(headerStyle);
                }
            }

            int columnCount = rows.stream().mapToInt(r -> r.length).max().orElse(0);
            for (int c = 0; c < columnCount; c++) {
                sheet.autoSizeColumn(c);
                if (sheet.getColumnWidth(c) > 12000) sheet.setColumnWidth(c, 12000);
            }
            if (columnCount > 0) sheet.createFreezePane(0, headerRowIndex + 1);

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    /** Writes one sheet per entry of {@code sections} (insertion order preserved), each with its own header row. */
    public byte[] toXlsxMultiSheet(Map<String, List<String[]>> sections) {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            CellStyle headerStyle = wb.createCellStyle();
            Font headerFont = wb.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.TEAL.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            for (Map.Entry<String, List<String[]>> section : sections.entrySet()) {
                Sheet sheet = wb.createSheet(safeSheetName(section.getKey()));
                List<String[]> rows = section.getValue();
                for (int r = 0; r < rows.size(); r++) {
                    Row row = sheet.createRow(r);
                    String[] cells = rows.get(r);
                    for (int c = 0; c < cells.length; c++) {
                        Cell cell = row.createCell(c);
                        cell.setCellValue(cells[c] == null ? "" : cells[c]);
                        if (r == 0) cell.setCellStyle(headerStyle);
                    }
                }
                int columnCount = rows.isEmpty() ? 0 : rows.get(0).length;
                for (int c = 0; c < columnCount; c++) {
                    sheet.autoSizeColumn(c);
                    if (sheet.getColumnWidth(c) > 12000) sheet.setColumnWidth(c, 12000);
                }
                if (columnCount > 0) sheet.createFreezePane(0, 1);
            }

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private String safeSheetName(String name) {
        String cleaned = name.replaceAll("[\\\\/*\\[\\]:?]", " ");
        return cleaned.length() > 31 ? cleaned.substring(0, 31) : cleaned;
    }

    // ---------------------------------------------------------------- PDF
    private static final float MARGIN = 24f;
    private static final float ROW_HEIGHT = 16f;
    private static final float TITLE_SIZE = 14f;
    private static final float CELL_FONT_SIZE = 8f;

    public byte[] toPdf(String title, List<String[]> rows) {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDFont bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDFont regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

            // Use the widest row (not just row 0) so multi-section reports whose
            // rows have varying column counts still get consistent column widths.
            int columnCount = rows.stream().mapToInt(r -> r.length).max().orElse(0);
            PDRectangle pageSize = columnCount > 6
        ? new PDRectangle(PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth())
        : PDRectangle.A4;
            float usableWidth = pageSize.getWidth() - 2 * MARGIN;
            float[] colWidths = computeColumnWidths(rows, columnCount, usableWidth);

            PDPage page = new PDPage(pageSize);
            doc.addPage(page);
            PDPageContentStream cs = new PDPageContentStream(doc, page);
            float y = pageSize.getHeight() - MARGIN;

            y = writeTitle(cs, bold, title, y, pageSize);
            y -= 6;

            for (int r = 0; r < rows.size(); r++) {
                if (y < MARGIN + ROW_HEIGHT) {
                    cs.close();
                    page = new PDPage(pageSize);
                    doc.addPage(page);
                    cs = new PDPageContentStream(doc, page);
                    y = pageSize.getHeight() - MARGIN;
                }
                String[] rowCells = rows.get(r);
                if (rowCells.length == 0) {
                    // blank spacer row between sections in multi-section reports
                    y -= ROW_HEIGHT / 2f;
                    continue;
                }
                boolean isHeader = r == 0;
                y = drawRow(cs, isHeader ? bold : regular, rowCells, colWidths, y, isHeader);
            }
            cs.close();

            doc.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private float writeTitle(PDPageContentStream cs, PDFont font, String title, float y, PDRectangle pageSize) throws IOException {
        cs.beginText();
        cs.setFont(font, TITLE_SIZE);
        cs.newLineAtOffset(MARGIN, y - TITLE_SIZE);
        cs.showText(title);
        cs.endText();
        return y - TITLE_SIZE - 10;
    }

    private float[] computeColumnWidths(List<String[]> rows, int columnCount, float usableWidth) {
        if (columnCount == 0) return new float[0];
        double[] maxLen = new double[columnCount];
        for (String[] row : rows) {
            for (int c = 0; c < columnCount && c < row.length; c++) {
                String v = row[c] == null ? "" : row[c];
                maxLen[c] = Math.max(maxLen[c], Math.min(v.length(), 40));
            }
        }
        double total = 0;
        for (double v : maxLen) total += Math.max(v, 4);
        float[] widths = new float[columnCount];
        for (int c = 0; c < columnCount; c++) {
            double weight = Math.max(maxLen[c], 4) / total;
            widths[c] = (float) (usableWidth * weight);
        }
        return widths;
    }

    private float drawRow(PDPageContentStream cs, PDFont font, String[] cells, float[] colWidths, float y, boolean header) throws IOException {
        if (header) {
            cs.setNonStrokingColor(0.11f, 0.45f, 0.42f);
            float totalWidth = 0;
            for (float w : colWidths) totalWidth += w;
            cs.addRect(MARGIN, y - ROW_HEIGHT + 4, totalWidth, ROW_HEIGHT);
            cs.fill();
            cs.setNonStrokingColor(1f, 1f, 1f);
        } else {
            cs.setNonStrokingColor(0.1f, 0.1f, 0.1f);
        }

        float x = MARGIN;
        for (int c = 0; c < colWidths.length; c++) {
            String text = c < cells.length && cells[c] != null ? cells[c] : "";
            text = truncateToWidth(font, text, colWidths[c] - 4);
            cs.beginText();
            cs.setFont(font, CELL_FONT_SIZE);
            cs.newLineAtOffset(x + 2, y - ROW_HEIGHT + 6);
            cs.showText(text);
            cs.endText();
            x += colWidths[c];
        }
        cs.setNonStrokingColor(0f, 0f, 0f);
        return y - ROW_HEIGHT;
    }

    private String truncateToWidth(PDFont font, String text, float maxWidth) {
        try {
            if (font.getStringWidth(text) / 1000f * CELL_FONT_SIZE <= maxWidth) return text;
            String truncated = text;
            while (truncated.length() > 1 &&
                    font.getStringWidth(truncated + "...") / 1000f * CELL_FONT_SIZE > maxWidth) {
                truncated = truncated.substring(0, truncated.length() - 1);
            }
            return truncated.length() < text.length() ? truncated + "..." : truncated;
        } catch (IOException e) {
            return text;
        }
    }
}
