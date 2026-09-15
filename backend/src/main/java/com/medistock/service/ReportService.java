package com.medistock.service;

import com.medistock.model.Medicine;
import com.medistock.model.Purchase;
import com.medistock.model.Sale;
import com.medistock.model.SaleItem;
import com.medistock.model.StockMovement;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.PurchaseRepository;
import com.medistock.repository.SaleRepository;
import com.medistock.repository.StockMovementRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.security.CurrentUserProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Generates downloadable reports. Every report is first assembled as a
 * simple row model (List of String[] rows, rows.get(0) = header) and then
 * handed to ReportExportUtil so it can be rendered as CSV, Excel (.xlsx) or
 * PDF from the exact same data — the three formats can never drift apart.
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private final MedicineRepository medicineRepository;
    private final PurchaseRepository purchaseRepository;
    private final SaleRepository saleRepository;
    private final StockMovementRepository stockMovementRepository;
    private final SupplierRepository supplierRepository;
    private final ReportExportUtil exportUtil;
    private final CurrentUserProvider currentUserProvider;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public enum Format { CSV, XLSX, PDF }

    // ---------------------------------------------------------- inventory
    public byte[] inventoryReport(Format format) {
        return render("Inventory Report", "Inventory Report", inventoryRows(), format);
    }

    private List<String[]> inventoryRows() {
        List<String[]> rows = new ArrayList<>();
        rows.add(new String[]{"Name", "Batch Number", "Category", "Supplier", "Quantity", "Reorder Level", "Expiry Date", "Price", "Status"});
        LocalDate today = LocalDate.now();
        // active-only throughout this file: these are *current* snapshots, and
        // should agree with the dashboard's active-only inventory-value figure.
        List<Medicine> all = medicineRepository.findByActiveTrue();
        if (all.isEmpty()) {
            rows.add(new String[]{"No medicines found."});
            return rows;
        }
        BigDecimal totalValue = BigDecimal.ZERO;
        for (Medicine m : all) {
            rows.add(new String[]{
                    m.getName(), m.getBatchNumber(), nullSafe(m.getCategory()),
                    m.getSupplier() != null ? m.getSupplier().getName() : "",
                    String.valueOf(m.getQuantity()), String.valueOf(m.getReorderLevel()),
                    String.valueOf(m.getExpiryDate()), String.valueOf(m.getPrice()),
                    status(m, today)
            });
            totalValue = totalValue.add(m.getPrice().multiply(BigDecimal.valueOf(m.getQuantity())));
        }
        rows.add(new String[]{});
        rows.add(new String[]{"Total medicines: " + all.size() + "   |   Total inventory value: " + currency(totalValue)});
        return rows;
    }

    // ------------------------------------------------------------- expiry
    public byte[] expiryReport(Format format) {
        return render("Expiry Report", "Expiry Report", expiryRows(), format);
    }

    private List<String[]> expiryRows() {
        List<String[]> rows = new ArrayList<>();
        rows.add(new String[]{"Name", "Batch Number", "Category", "Expiry Date", "Days Left", "Quantity", "Status"});
        LocalDate today = LocalDate.now();
        int count = 0;
        for (Medicine m : medicineRepository.findByActiveTrue()) {
            if (m.getExpiryDate().isAfter(today.plusDays(30))) continue;
            String status = m.getExpiryDate().isBefore(today) ? "EXPIRED" : "NEAR_EXPIRY";
            rows.add(new String[]{
                    m.getName(), m.getBatchNumber(), nullSafe(m.getCategory()),
                    String.valueOf(m.getExpiryDate()),
                    String.valueOf(java.time.temporal.ChronoUnit.DAYS.between(today, m.getExpiryDate())),
                    String.valueOf(m.getQuantity()), status
            });
            count++;
        }
        if (count == 0) {
            rows.add(new String[]{"No medicines are expired or expiring within 30 days."});
        }
        return rows;
    }

    // ---------------------------------------------------------- purchases
    public byte[] purchaseHistoryReport(Format format) {
        return render("Purchase History Report", "Purchase History", purchaseRows(), format);
    }

    private List<String[]> purchaseRows() {
        List<String[]> rows = new ArrayList<>();
        rows.add(new String[]{"Date", "Medicine", "Supplier", "PO Number", "Invoice Number", "Quantity", "Unit Price", "Total", "Purchased By"});
        List<Purchase> purchases = purchaseRepository.findAllByOrderByPurchaseDateDesc();
        if (purchases.isEmpty()) {
            rows.add(new String[]{"No purchase records found."});
            return rows;
        }
        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalQty = 0;
        for (Purchase p : purchases) {
            rows.add(new String[]{
                    p.getPurchaseDate().format(FMT), p.getMedicine().getName(),
                    p.getSupplier() != null ? p.getSupplier().getName() : "",
                    nullSafe(p.getPoNumber()), nullSafe(p.getInvoiceNumber()),
                    String.valueOf(p.getQuantity()), String.valueOf(p.getUnitPrice()),
                    String.valueOf(p.getTotalAmount()),
                    p.getPurchasedBy() != null ? p.getPurchasedBy().getFullName() : ""
            });
            totalAmount = totalAmount.add(p.getTotalAmount());
            totalQty += p.getQuantity();
        }
        rows.add(new String[]{});
        rows.add(new String[]{"Total purchases: " + purchases.size() + "   |   Total quantity: " + totalQty
                + "   |   Total amount: " + currency(totalAmount)});
        return rows;
    }

    // -------------------------------------------------------------- sales
    /** Requirement 30: "Sales report if available" — one row per sale line item, so quantities/subtotals tie out exactly to what a bill shows. */
    public byte[] salesReport(Format format) {
        return render("Sales Report", "Sales Report", salesRows(), format);
    }

    private List<String[]> salesRows() {
        List<String[]> rows = new ArrayList<>();
        rows.add(new String[]{"Date", "Bill Number", "Customer", "Phone", "Medicine", "Quantity", "Unit Price", "Subtotal", "Bill Total", "Payment Method", "Payment Status", "Sold By"});
        List<Sale> sales = saleRepository.findAllByOrderBySaleDateDesc();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        int billCount = 0;
        for (Sale s : sales) {
            List<SaleItem> items = s.getItems();
            if (items == null || items.isEmpty()) continue;
            billCount++;
            totalRevenue = totalRevenue.add(s.getTotalAmount());
            for (SaleItem item : items) {
                rows.add(new String[]{
                        s.getSaleDate().format(FMT), nullSafe(s.getBillNumber()), nullSafe(s.getCustomerName()),
                        nullSafe(s.getCustomerPhone()),
                        item.getMedicine() != null ? item.getMedicine().getName() : "",
                        String.valueOf(item.getQuantity()), String.valueOf(item.getUnitPrice()),
                        String.valueOf(item.getSubtotal()), String.valueOf(s.getTotalAmount()),
                        nullSafe(s.getPaymentMethod()), nullSafe(s.getPaymentStatus()),
                        s.getSoldBy() != null ? s.getSoldBy().getFullName() : ""
                });
            }
        }
        if (billCount == 0) {
            rows.add(new String[]{"No sales records found."});
            return rows;
        }
        rows.add(new String[]{});
        rows.add(new String[]{"Total bills: " + billCount + "   |   Total revenue: " + currency(totalRevenue)});
        return rows;
    }

    // ---------------------------------------------------- stock movements
    public byte[] stockMovementReport(Format format) {
        return render("Stock Movement Report", "Stock Movements", stockMovementRows(), format);
    }

    private List<String[]> stockMovementRows() {
        List<String[]> rows = new ArrayList<>();
        rows.add(new String[]{"Timestamp", "Medicine", "Type", "Change", "Previous Qty", "New Qty", "Performed By", "Note"});
        List<StockMovement> movements = stockMovementRepository.findAllByOrderByTimestampDesc();
        if (movements.isEmpty()) {
            rows.add(new String[]{"No stock movement records found."});
            return rows;
        }
        for (StockMovement m : movements) {
            rows.add(new String[]{
                    m.getTimestamp().format(FMT), m.getMedicine().getName(), m.getType().toString(),
                    String.valueOf(m.getQuantityChange()), String.valueOf(m.getPreviousQuantity()),
                    String.valueOf(m.getNewQuantity()),
                    m.getPerformedBy() != null ? m.getPerformedBy().getFullName() : "System",
                    nullSafe(m.getNote())
            });
        }
        rows.add(new String[]{});
        rows.add(new String[]{"Total movements: " + movements.size()});
        return rows;
    }

    // -------------------------------------------------- advanced analytics
    /**
     * A single combined "advanced report": KPI summary, category-wise stock
     * valuation, low-stock watchlist, expiry watchlist and top suppliers by
     * spend — everything a manager needs for a review in one download.
     */
    public byte[] analyticsReport(Format format) {
        List<String[]> rows = new ArrayList<>();
        LocalDate today = LocalDate.now();
        List<Medicine> all = medicineRepository.findByActiveTrue();

        // --- Section 1: KPI summary
        rows.add(new String[]{"MediStock Advanced Analytics Report", "Generated " + today});
        rows.add(new String[]{});
        rows.add(new String[]{"Summary", "Value"});
        rows.add(new String[]{"Total Medicines", String.valueOf(all.size())});
        rows.add(new String[]{"Total Suppliers", String.valueOf(supplierRepository.count())});
        rows.add(new String[]{"Total Inventory Value", currency(medicineRepository.totalInventoryValue())});
        rows.add(new String[]{"Low Stock Items", String.valueOf(medicineRepository.findLowStock().size())});
        rows.add(new String[]{"Out of Stock Items", String.valueOf(medicineRepository.findOutOfStock().size())});
        rows.add(new String[]{"Expiring Within 30 Days", String.valueOf(medicineRepository.findNearExpiry(today.plusDays(30)).size())});
        rows.add(new String[]{"Already Expired", String.valueOf(medicineRepository.findExpired().size())});
        rows.add(new String[]{});

        // --- Section 2: category breakdown
        rows.add(new String[]{"Category Breakdown", "Item Count", "Total Units", "Stock Value"});
        Map<String, long[]> categoryUnits = new TreeMap<>();
        Map<String, BigDecimal> categoryValue = new TreeMap<>();
        Map<String, Integer> categoryCount = new TreeMap<>();
        for (Medicine m : all) {
            String cat = nullSafe(m.getCategory()).isBlank() ? "Uncategorized" : m.getCategory();
            categoryCount.merge(cat, 1, Integer::sum);
            categoryUnits.computeIfAbsent(cat, k -> new long[1])[0] += m.getQuantity();
            BigDecimal value = m.getPrice().multiply(BigDecimal.valueOf(m.getQuantity()));
            categoryValue.merge(cat, value, BigDecimal::add);
        }
        for (String cat : categoryCount.keySet()) {
            rows.add(new String[]{
                    cat, String.valueOf(categoryCount.get(cat)),
                    String.valueOf(categoryUnits.get(cat)[0]),
                    currency(categoryValue.get(cat))
            });
        }
        rows.add(new String[]{});

        // --- Section 3: low stock watchlist
        rows.add(new String[]{"Low Stock Watchlist", "Quantity", "Reorder Level", "Supplier"});
        for (Medicine m : medicineRepository.findLowStock()) {
            rows.add(new String[]{
                    m.getName(), String.valueOf(m.getQuantity()), String.valueOf(m.getReorderLevel()),
                    m.getSupplier() != null ? m.getSupplier().getName() : ""
            });
        }
        rows.add(new String[]{});

        // --- Section 4: expiry watchlist
        rows.add(new String[]{"Expiry Watchlist (next 30 days + already expired)", "Expiry Date", "Quantity", "Status"});
        for (Medicine m : medicineRepository.findExpired()) {
            rows.add(new String[]{m.getName(), String.valueOf(m.getExpiryDate()), String.valueOf(m.getQuantity()), "EXPIRED"});
        }
        for (Medicine m : medicineRepository.findNearExpiry(today.plusDays(30))) {
            rows.add(new String[]{m.getName(), String.valueOf(m.getExpiryDate()), String.valueOf(m.getQuantity()), "NEAR_EXPIRY"});
        }
        rows.add(new String[]{});

        // --- Section 5: top suppliers by spend
        rows.add(new String[]{"Top Suppliers By Spend", "Purchases", "Total Spend"});
        for (Object[] row : purchaseRepository.supplyInsightBySupplier()) {
            String name = row[0] != null ? row[0].toString() : "Unknown";
            rows.add(new String[]{name, String.valueOf(row[1]), currency((BigDecimal) row[2])});
        }

        if (format == Format.XLSX) {
            return analyticsWorkbook(today);
        }
        if (format == Format.PDF) {
            return exportUtil.toPdf("MediStock Advanced Analytics Report — " + today, rows);
        }
        return exportUtil.toCsv(rows);
    }

    /** Analytics gets its own multi-sheet workbook (one tab per section) rather than one flat table. */
    private byte[] analyticsWorkbook(LocalDate today) {
        List<Medicine> all = medicineRepository.findByActiveTrue();

        List<String[]> summary = new ArrayList<>();
        summary.add(new String[]{"Metric", "Value"});
        summary.add(new String[]{"Total Medicines", String.valueOf(all.size())});
        summary.add(new String[]{"Total Suppliers", String.valueOf(supplierRepository.count())});
        summary.add(new String[]{"Total Inventory Value", currency(medicineRepository.totalInventoryValue())});
        summary.add(new String[]{"Low Stock Items", String.valueOf(medicineRepository.findLowStock().size())});
        summary.add(new String[]{"Out of Stock Items", String.valueOf(medicineRepository.findOutOfStock().size())});
        summary.add(new String[]{"Expiring Within 30 Days", String.valueOf(medicineRepository.findNearExpiry(today.plusDays(30)).size())});
        summary.add(new String[]{"Already Expired", String.valueOf(medicineRepository.findExpired().size())});

        List<String[]> category = new ArrayList<>();
        category.add(new String[]{"Category", "Item Count", "Total Units", "Stock Value"});
        Map<String, long[]> categoryUnits = new TreeMap<>();
        Map<String, BigDecimal> categoryValue = new TreeMap<>();
        Map<String, Integer> categoryCount = new TreeMap<>();
        for (Medicine m : all) {
            String cat = nullSafe(m.getCategory()).isBlank() ? "Uncategorized" : m.getCategory();
            categoryCount.merge(cat, 1, Integer::sum);
            categoryUnits.computeIfAbsent(cat, k -> new long[1])[0] += m.getQuantity();
            categoryValue.merge(cat, m.getPrice().multiply(BigDecimal.valueOf(m.getQuantity())), BigDecimal::add);
        }
        for (String cat : categoryCount.keySet()) {
            category.add(new String[]{cat, String.valueOf(categoryCount.get(cat)), String.valueOf(categoryUnits.get(cat)[0]), currency(categoryValue.get(cat))});
        }

        List<String[]> lowStock = new ArrayList<>();
        lowStock.add(new String[]{"Name", "Quantity", "Reorder Level", "Supplier"});
        for (Medicine m : medicineRepository.findLowStock()) {
            lowStock.add(new String[]{m.getName(), String.valueOf(m.getQuantity()), String.valueOf(m.getReorderLevel()),
                    m.getSupplier() != null ? m.getSupplier().getName() : ""});
        }

        List<String[]> expiry = new ArrayList<>();
        expiry.add(new String[]{"Name", "Expiry Date", "Quantity", "Status"});
        for (Medicine m : medicineRepository.findExpired()) {
            expiry.add(new String[]{m.getName(), String.valueOf(m.getExpiryDate()), String.valueOf(m.getQuantity()), "EXPIRED"});
        }
        for (Medicine m : medicineRepository.findNearExpiry(today.plusDays(30))) {
            expiry.add(new String[]{m.getName(), String.valueOf(m.getExpiryDate()), String.valueOf(m.getQuantity()), "NEAR_EXPIRY"});
        }

        List<String[]> suppliers = new ArrayList<>();
        suppliers.add(new String[]{"Supplier", "Purchases", "Total Spend"});
        for (Object[] row : purchaseRepository.supplyInsightBySupplier()) {
            suppliers.add(new String[]{row[0] != null ? row[0].toString() : "Unknown", String.valueOf(row[1]), currency((BigDecimal) row[2])});
        }

        return exportUtil.toXlsxMultiSheet(new LinkedHashMap<>() {{
            put("Summary", summary);
            put("Category Breakdown", category);
            put("Low Stock", lowStock);
            put("Expiry Watchlist", expiry);
            put("Top Suppliers", suppliers);
        }});
    }

    // ---------------------------------------------------------- rendering
    /**
     * Every report gets a small metadata header — title, generated date,
     * generated-by user (requirement 30: "Add: generated date, report
     * title, ... generated-by user where appropriate") — followed by a
     * blank spacer row, then the real header + data rows.
     */
    private byte[] render(String pdfTitle, String sheetTitle, List<String[]> rows, Format format) {
        List<String[]> withMeta = new ArrayList<>(metaRows(pdfTitle));
        int headerRowIndex = withMeta.size(); // the real column-header row comes right after the meta rows
        withMeta.addAll(rows);
        return switch (format) {
            case XLSX -> exportUtil.toXlsx(sheetTitle, withMeta, headerRowIndex);
            case PDF -> exportUtil.toPdf(pdfTitle, withMeta);
            default -> exportUtil.toCsv(withMeta);
        };
    }

    private List<String[]> metaRows(String reportTitle) {
        var generatedBy = currentUserProvider.getCurrentUser();
        String byName = generatedBy != null ? generatedBy.getFullName() + " (" + generatedBy.getRole() + ")" : "System";
        List<String[]> meta = new ArrayList<>();
        meta.add(new String[]{"MediStock — " + reportTitle});
        meta.add(new String[]{"Generated: " + LocalDate.now() + " " + java.time.LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm")) + "  |  By: " + byName});
        meta.add(new String[]{}); // blank spacer before the real header row
        return meta;
    }

    private String status(Medicine m, LocalDate today) {
        if (m.getExpiryDate().isBefore(today)) return "EXPIRED";
        if (m.getExpiryDate().isBefore(today.plusDays(30))) return "NEAR_EXPIRY";
        if (m.getQuantity() == 0) return "OUT_OF_STOCK";
        if (m.getQuantity() <= m.getReorderLevel()) return "LOW_STOCK";
        return "OK";
    }

    private String currency(BigDecimal value) {
        if (value == null) return "0.00";
        return value.setScale(2, RoundingMode.HALF_UP).toString();
    }

    private String nullSafe(String s) {
        return s == null ? "" : s;
    }
}
