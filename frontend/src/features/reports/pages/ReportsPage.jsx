import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { inventoryService } from '../../../services/api/inventoryService';
import { reportsApi } from '../services/api/reportsApi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  BarChart2,
  TrendingUp,
  PieChart,
  IndianRupee,
  Package,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportsPage() {
  const {
    isAdmin,
    isPharmacist,
    isStaff,
    isSupplier,
    isUser,
  } = useAuth();

  const canViewInventoryReports =
    isAdmin || isPharmacist || isStaff;

  const canViewSupplierReports =
    isAdmin || isSupplier;

  const hasReportsAccess =
    canViewInventoryReports ||
    canViewSupplierReports;

  const [activeTab, setActiveTab] = useState(
    isSupplier ? 'SUPPLIERS' : 'VALUATION'
  );
  const [dateRange, setDateRange] = useState('30');
  const [supplierShareData, setSupplierShareData] = useState(null);
  const [supplierSummary, setSupplierSummary] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [valuationSummary, setValuationSummary] = useState(null);
  const [expirySummary, setExpirySummary] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [reportError, setReportError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [reportSearch, setReportSearch] = useState('');
  const [reportPage, setReportPage] = useState(1);
  useEffect(() => {
  if (
    isSupplier &&
    activeTab !== 'SUPPLIERS'
  ) {
    setActiveTab('SUPPLIERS');
    return;
  }

  if (
    !canViewInventoryReports &&
    canViewSupplierReports &&
    activeTab !== 'SUPPLIERS'
  ) {
    setActiveTab('SUPPLIERS');
  }
}, [
  isSupplier,
  canViewInventoryReports,
  canViewSupplierReports,
  activeTab,
]);
  const REPORT_PAGE_SIZE = 10;
  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const handleExportCSV = async () => {
  setExporting(true);

  try {
      if (activeTab === 'VALUATION') {
        await reportsApi.downloadInventoryReport();

        toast.success(
          'Inventory report downloaded successfully'
        );

        return;
      }

      if (activeTab === 'EXPIRY') {
        await reportsApi.downloadExpiryReport(dateRange);

        toast.success(
          'Expiry report downloaded successfully'
        );

        return;
      }

      const escapeCsv = (value) => {
        const text = String(value ?? '')
          .replace(/"/g, '""');

        return `"${text}"`;
      };

        const rows = [
        [
          'Supplier Name',
          'Purchase Orders',
          'Procurement Value (INR)',
          'Average Order Value (INR)',
          'Pending',
          'Approved',
          'Processing',
          'Shipped',
          'Received',
          'Cancelled',
          'Late Deliveries',
          'Average Delivery Days',
          'Procurement Share (%)',
          'Report Window (Days)',
        ],
        ...supplierSummary.map((supplier) => [
          supplier.name,
          supplier.poCount,
          supplier.totalValue.toFixed(2),
          supplier.averageOrderValue.toFixed(2),
          supplier.pendingCount,
          supplier.approvedCount,
          supplier.processingCount,
          supplier.shippedCount,
          supplier.receivedCount,
          supplier.cancelledCount,
          supplier.lateDeliveries,
          supplier.averageDeliveryDays ?? 'N/A',
          supplier.share,
          Number(dateRange) || 30,
        ]),
      ];

      const csvContent =
        '\uFEFF' +
        rows
          .map((row) =>
            row.map(escapeCsv).join(',')
          )
          .join('\r\n');

      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8',
      });

      const downloadUrl =
        window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      const today =
        new Date().toISOString().slice(0, 10);

      link.href = downloadUrl;
      link.download =
       `medistock-supplier-performance-last-${dateRange}-days-${today}.csv`;
     
       document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);

      toast.success(
        'Supplier report downloaded successfully'
      );
    } catch (error) {
      console.error('Report export failed:', error);

      toast.error(
        'Unable to download the report. Please try again.'
      );
      } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = () => {
    setExporting(true);

    try {
      const document = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const reportTitles = {
        VALUATION: 'Inventory Valuation Report',
        EXPIRY: 'Expiry Risk Audit Report',
        SUPPLIERS: 'Supplier Performance Report',
      };

      const reportTitle =
        reportTitles[activeTab] ||
        'MediStock Report';

      const generatedAt =
        new Date().toLocaleString('en-IN');

      document.setFillColor(37, 99, 235);
      document.rect(0, 0, 297, 24, 'F');

      document.setTextColor(255, 255, 255);
      document.setFontSize(17);
      document.setFont('helvetica', 'bold');
      document.text('MediStock', 14, 10);

      document.setFontSize(11);
      document.setFont('helvetica', 'normal');
      document.text(reportTitle, 14, 18);

      document.setTextColor(51, 65, 85);
      document.setFontSize(9);
      document.text(
        `Generated: ${generatedAt}`,
        14,
        31
      );

      if (activeTab !== 'VALUATION') {
        const windowText =
          activeTab === 'EXPIRY'
            ? `Upcoming ${dateRange} days`
            : `Last ${dateRange} days`;

        document.text(
          `Report window: ${windowText}`,
          14,
          36
        );
      }

      let tableHead = [];
      let tableBody = [];
      let summaryText = '';
      let startY =
        activeTab === 'VALUATION' ? 39 : 43;

      if (activeTab === 'VALUATION') {
        summaryText =
          `Total value: INR ${totalValue.toFixed(2)} | ` +
          `Total units: ${totalUnits} | ` +
          `Records: ${filteredValuationRows.length}`;

        tableHead = [[
          'Medicine',
          'Code',
          'Category',
          'Batch',
          'Quantity',
          'Unit Price (INR)',
          'Stock Value (INR)',
        ]];

        tableBody =
          filteredValuationRows.map((row) => [
            row.medicineName,
            row.medicineCode,
            row.category,
            row.batchNumber,
            row.quantity,
            row.unitPrice.toFixed(2),
            row.totalValue.toFixed(2),
          ]);
      } else if (activeTab === 'EXPIRY') {
        summaryText =
          `Expired: ${expiredItems.length} | ` +
          `Critical: ${criticalExpiryItems.length} | ` +
          `Warning: ${warningExpiryItems.length} | ` +
          `Risk records: ${filteredExpiryRows.length}`;

        tableHead = [[
          'Medicine',
          'Code',
          'Batch',
          'Expiry Date',
          'Days Remaining',
          'Risk',
          'Quantity',
          'Value at Risk (INR)',
        ]];

        tableBody =
          filteredExpiryRows.map((row) => [
            row.medicineName,
            row.medicineCode,
            row.batchNumber,
            row.expiryDate || 'N/A',
            row.daysRemaining,
            row.riskLevel,
            row.quantity,
            row.valueAtRisk.toFixed(2),
          ]);
      } else {
        summaryText =
          `Procurement: INR ${supplierTotalValue.toFixed(2)} | ` +
          `Orders: ${supplierTotalOrders} | ` +
          `Received: ${supplierReceivedOrders} | ` +
          `Late: ${supplierLateDeliveries}`;

        tableHead = [[
          'Supplier',
          'POs',
          'Procurement (INR)',
          'Average Order (INR)',
          'Pending',
          'Processing',
          'Shipped',
          'Received',
          'Late',
          'Avg Delivery',
          'Share %',
        ]];

        tableBody =
          filteredSupplierRows.map((supplier) => [
            supplier.name,
            supplier.poCount,
            supplier.totalValue.toFixed(2),
            supplier.averageOrderValue.toFixed(2),
            supplier.pendingCount,
            supplier.processingCount,
            supplier.shippedCount,
            supplier.receivedCount,
            supplier.lateDeliveries,
            supplier.averageDeliveryDays === null
              ? 'N/A'
              : `${supplier.averageDeliveryDays} days`,
            supplier.share,
          ]);
      }

      document.setFont('helvetica', 'bold');
      document.setFontSize(9);
      document.text(summaryText, 14, startY);

      autoTable(document, {
        startY: startY + 5,
        head: tableHead,
        body: tableBody,
        theme: 'grid',
        styles: {
          fontSize: 7.5,
          cellPadding: 2.2,
          textColor: [51, 65, 85],
        },
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        didDrawPage: (data) => {
          const pageNumber =
            document.getNumberOfPages();

          document.setFontSize(8);
          document.setTextColor(100, 116, 139);

          document.text(
            `MediStock Enterprise | Page ${pageNumber}`,
            14,
            document.internal.pageSize.height - 7
          );
        },
      });

      const filenameType =
        activeTab.toLowerCase();

      const today =
        new Date().toISOString().slice(0, 10);

      document.save(
        `medistock-${filenameType}-report-${today}.pdf`
      );

      toast.success(
        `${reportTitle} downloaded successfully`
      );
    } catch (error) {
      console.error(
        'PDF report generation failed:',
        error
      );

      toast.error(
        'Unable to generate the PDF report.'
      );
    } finally {
      setExporting(false);
    }
  };


  const handlePrint = () => {
    window.print();
  };

  // Load operational inventory reports only for authorised roles.
useEffect(() => {
  if (!canViewInventoryReports) {
    setInventoryItems([]);
    setValuationSummary(null);
    setLoadingInventory(false);
    return;
  }

  const fetchInventoryData = async () => {
    setLoadingInventory(true);
    setReportError('');

    try {
      const [data, summary] =
        await Promise.all([
          inventoryService.getAllInventory(),
          reportsApi.getInventoryValuationSummary(),
        ]);

      setInventoryItems(
        Array.isArray(data) ? data : []
      );

      setValuationSummary(summary);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(
        'Failed to load inventory report data:',
        error
      );

      setInventoryItems([]);
      setValuationSummary(null);

      setReportError(
        error.response?.data?.message ||
          'Unable to load inventory report data.'
      );
    } finally {
      setLoadingInventory(false);
    }
  };

  fetchInventoryData();
}, [refreshKey, canViewInventoryReports]);

useEffect(() => {
  if (
    !canViewInventoryReports ||
    activeTab !== 'EXPIRY'
  ) {
    return;
  }

  const fetchExpirySummary = async () => {
    setLoadingInventory(true);
    setReportError('');

    try {
      const summary =
        await reportsApi.getExpirySummary(
          dateRange
        );

      setExpirySummary(summary);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(
        'Failed to load expiry summary:',
        error
      );

      setExpirySummary(null);

      setReportError(
        error.response?.data?.message ||
          'Unable to load expiry summary.'
      );
    } finally {
      setLoadingInventory(false);
    }
  };

  fetchExpirySummary();
}, [
  activeTab,
  dateRange,
  refreshKey,
  canViewInventoryReports,
]);

  useEffect(() => {
    setReportSearch('');
    setReportPage(1);
  }, [activeTab, dateRange]);

  useEffect(() => {
  if (
    !canViewSupplierReports ||
    activeTab !== 'SUPPLIERS'
  ) {
    return;
  }

    const fetchSupplierPerformance = async () => {
      setLoadingSuppliers(true);
      setReportError('');

      try {
        const response =
          await reportsApi.getSupplierPerformance(
            dateRange
          );

        const metrics = Array.isArray(
          response?.suppliers
        )
          ? response.suppliers.map((supplier) => ({
              name:
                supplier.supplierName ||
                'Unknown Supplier',
              poCount: Number(
                supplier.purchaseOrderCount || 0
              ),
              totalValue: Number(
                supplier.procurementValue || 0
              ),
              averageOrderValue: Number(
                supplier.averageOrderValue || 0
              ),
              pendingCount: Number(
                supplier.pendingCount || 0
              ),
              approvedCount: Number(
                supplier.approvedCount || 0
              ),
              processingCount: Number(
                supplier.processingCount || 0
              ),
              shippedCount: Number(
                supplier.shippedCount || 0
              ),
              receivedCount: Number(
                supplier.receivedCount || 0
              ),
              cancelledCount: Number(
                supplier.cancelledCount || 0
              ),
              lateDeliveries: Number(
                supplier.lateDeliveries || 0
              ),
              averageDeliveryDays:
                supplier.averageDeliveryDays ===
                  null ||
                supplier.averageDeliveryDays ===
                  undefined
                  ? null
                  : Number(
                      supplier.averageDeliveryDays
                    ),
              share: Number(
                supplier.procurementShare || 0
              ),
            }))
          : [];

        setSupplierSummary(metrics);

        const chartColors = [
          '#2563eb',
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#ef4444',
          '#06b6d4',
          '#ec4899',
          '#14b8a6',
          '#f97316',
          '#6366f1',
        ];

        const hasChartValue = metrics.some(
          (supplier) => supplier.share > 0
        );

        setSupplierShareData(
          metrics.length > 0 && hasChartValue
            ? {
                labels: metrics.map(
                  (supplier) => supplier.name
                ),
                datasets: [
                  {
                    data: metrics.map(
                      (supplier) =>
                        supplier.share
                    ),
                    backgroundColor:
                      chartColors.slice(
                        0,
                        metrics.length
                      ),
                  },
                ],
              }
            : null
        );

        setLastUpdated(new Date());
      } catch (error) {
        console.error(
          'Failed to load supplier performance:',
          error
        );

        setSupplierSummary([]);
        setSupplierShareData(null);

        setReportError(
          error.response?.data?.message ||
            'Unable to load supplier performance data.'
        );
      } finally {
        setLoadingSuppliers(false);
      }
    };

    fetchSupplierPerformance();
    }, [
      activeTab,
      dateRange,
      refreshKey,
      canViewSupplierReports,
    ]);

    const categoryTotals = inventoryItems.reduce(
    (totals, item) => {
      const category =
        item.medicine?.category?.name ||
        'Uncategorised';

      totals[category] =
        (totals[category] || 0) +
        Number(item.quantity || 0) *
          Number(item.medicine?.unitPrice || 0);

      return totals;
    },
    {}
  );

  const backendCategoryValuations =
    Array.isArray(
      valuationSummary?.categoryValuations
    )
      ? valuationSummary.categoryValuations
      : [];

  const valuationData = {
    labels:
      backendCategoryValuations.length > 0
        ? backendCategoryValuations.map(
            (category) => category.categoryName
          )
        : Object.keys(categoryTotals),
    datasets: [
      {
        label: 'Stock Value (₹ INR)',
        data:
          backendCategoryValuations.length > 0
            ? backendCategoryValuations.map(
                (category) =>
                  Number(category.stockValue || 0)
              )
            : Object.values(categoryTotals),
        backgroundColor:
          'rgba(37, 99, 235, 0.8)',
        borderRadius: 8,
      },
    ],
  };

    const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedExpiryDays =
    Number(dateRange) || 30;

  const getDaysUntilExpiry = (expiryDateValue) => {
    if (!expiryDateValue) {
      return null;
    }

    const expiryDate =
      new Date(`${expiryDateValue}T00:00:00`);

    return Math.round(
      (expiryDate - today) / 86400000
    );
  };

  const expiredItems = inventoryItems.filter((item) => {
    const daysUntilExpiry =
      getDaysUntilExpiry(item.expiryDate);

    return (
      item.expiryStatus === 'EXPIRED' ||
      (
        daysUntilExpiry !== null &&
        daysUntilExpiry < 0
      )
    );
  });

  const expiringWithinSelectedRange =
    inventoryItems.filter((item) => {
      const daysUntilExpiry =
        getDaysUntilExpiry(item.expiryDate);

      return (
        item.expiryStatus !== 'EXPIRED' &&
        daysUntilExpiry !== null &&
        daysUntilExpiry >= 0 &&
        daysUntilExpiry <= selectedExpiryDays
      );
    });

      const criticalExpiryItems =
    inventoryItems.filter((item) => {
      const daysUntilExpiry =
        getDaysUntilExpiry(item.expiryDate);

      return (
        item.expiryStatus !== 'EXPIRED' &&
        daysUntilExpiry !== null &&
        daysUntilExpiry >= 0 &&
        daysUntilExpiry <= 30
      );
    });

  const warningExpiryItems =
    inventoryItems.filter((item) => {
      const daysUntilExpiry =
        getDaysUntilExpiry(item.expiryDate);

      return (
        item.expiryStatus !== 'EXPIRED' &&
        daysUntilExpiry !== null &&
        daysUntilExpiry >= 31 &&
        daysUntilExpiry <= 90
      );
    });

  const safeExpiryItems =
    inventoryItems.filter((item) => {
      const daysUntilExpiry =
        getDaysUntilExpiry(item.expiryDate);

      return (
        item.expiryStatus !== 'EXPIRED' &&
        daysUntilExpiry !== null &&
        daysUntilExpiry > 90
      );
    });

  const safeInventoryPercentage =
    inventoryItems.length > 0
      ? Math.round(
          (
            safeExpiryItems.length /
            inventoryItems.length
          ) * 100
        )
      : 0;


  const expiringWithinForecastWindow =
  inventoryItems.filter((item) => {
    const daysUntilExpiry =
      getDaysUntilExpiry(item.expiryDate);

    return (
      item.expiryStatus !== 'EXPIRED' &&
      daysUntilExpiry !== null &&
      daysUntilExpiry >= 0 &&
      daysUntilExpiry <= selectedExpiryDays
    );
  });

const expiryByMonth =
  expiringWithinForecastWindow.reduce(
    (totals, item) => {
      const month = item.expiryDate.slice(0, 7);

      totals[month] =
        (totals[month] || 0) + 1;

      return totals;
    },
    {}
  );

const expiryMonths =
  Object.keys(expiryByMonth).sort();

const expiryTrendData = {
  labels: expiryMonths,
  datasets: [
    {
      label: 'Expiring Items Count',
      data: expiryMonths.map(
        (month) => expiryByMonth[month]
      ),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.3,
      fill: true,
    },
  ],
};

const expiryForecastLabel =
  selectedExpiryDays === 365
    ? '1-Year'
    : selectedExpiryDays === 180
    ? '6-Month'
    : `${selectedExpiryDays}-Day`;

    const calculatedTotalUnits =
    inventoryItems.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    );

  const calculatedTotalValue =
    inventoryItems.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0) *
          Number(item.medicine?.unitPrice || 0),
      0
    );

  const totalUnits =
    valuationSummary?.totalUnits !== undefined
      ? Number(valuationSummary.totalUnits)
      : calculatedTotalUnits;

  const totalValue =
    valuationSummary?.totalStockValue !== undefined
      ? Number(
          valuationSummary.totalStockValue
        )
      : calculatedTotalValue;

  const averageUnitValue =
    valuationSummary?.averageUnitValue !==
    undefined
      ? Number(
          valuationSummary.averageUnitValue
        )
      : totalUnits > 0
      ? totalValue / totalUnits
      : 0;

        const valuationRows = inventoryItems
    .map((item) => {
      const quantity = Number(
        item.quantity || 0
      );

      const unitPrice = Number(
        item.medicine?.unitPrice || 0
      );

      return {
        id: item.id,
        medicineName:
          item.medicine?.name ||
          'Unknown Medicine',
        medicineCode:
          item.medicine?.medicineCode ||
          'N/A',
        category:
          item.medicine?.category?.name ||
          'Uncategorised',
        batchNumber:
          item.batchNumber || 'N/A',
        quantity,
        unitPrice,
        totalValue: quantity * unitPrice,
      };
    })
    .sort(
      (first, second) =>
        second.totalValue -
        first.totalValue
    );

  const normalizedReportSearch =
    reportSearch.trim().toLowerCase();

  const filteredValuationRows =
    valuationRows.filter((row) => {
      if (!normalizedReportSearch) {
        return true;
      }

      return [
        row.medicineName,
        row.medicineCode,
        row.category,
        row.batchNumber,
      ].some((value) =>
        String(value)
          .toLowerCase()
          .includes(normalizedReportSearch)
      );
    });

  const valuationTotalPages = Math.max(
    1,
    Math.ceil(
      filteredValuationRows.length /
        REPORT_PAGE_SIZE
    )
  );

  const safeValuationPage = Math.min(
    reportPage,
    valuationTotalPages
  );

  const paginatedValuationRows =
    filteredValuationRows.slice(
      (safeValuationPage - 1) *
        REPORT_PAGE_SIZE,
      safeValuationPage * REPORT_PAGE_SIZE
    );
  
    const expiryRiskRows = inventoryItems
    .map((item) => {
      const daysRemaining =
        getDaysUntilExpiry(item.expiryDate);

      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(
        item.medicine?.unitPrice || 0
      );

      let riskLevel = 'SAFE';

      if (
        item.expiryStatus === 'EXPIRED' ||
        (
          daysRemaining !== null &&
          daysRemaining < 0
        )
      ) {
        riskLevel = 'EXPIRED';
      } else if (
        daysRemaining !== null &&
        daysRemaining <= 30
      ) {
        riskLevel = 'CRITICAL';
      } else if (
        daysRemaining !== null &&
        daysRemaining <= 90
      ) {
        riskLevel = 'WARNING';
      } else if (
        daysRemaining !== null &&
        daysRemaining <= selectedExpiryDays
      ) {
        riskLevel = 'UPCOMING';
      }

      return {
        id: item.id,
        medicineName:
          item.medicine?.name || 'Unknown Medicine',
        medicineCode:
          item.medicine?.medicineCode || 'N/A',
        batchNumber: item.batchNumber || 'N/A',
        expiryDate: item.expiryDate,
        daysRemaining,
        quantity,
        valueAtRisk: quantity * unitPrice,
        riskLevel,
      };
    })
    .filter(
      (row) =>
        row.riskLevel === 'EXPIRED' ||
        (
          row.daysRemaining !== null &&
          row.daysRemaining >= 0 &&
          row.daysRemaining <=
            selectedExpiryDays
        )
    )
    .sort((first, second) =>
      first.daysRemaining - second.daysRemaining
    );

  const filteredExpiryRows =
    expiryRiskRows.filter((row) => {
      if (!normalizedReportSearch) {
        return true;
      }

      return [
        row.medicineName,
        row.medicineCode,
        row.batchNumber,
        row.riskLevel,
      ].some((value) =>
        String(value)
          .toLowerCase()
          .includes(normalizedReportSearch)
      );
    });

  const expiryTotalPages = Math.max(
    1,
    Math.ceil(
      filteredExpiryRows.length /
        REPORT_PAGE_SIZE
    )
  );

  const safeExpiryPage = Math.min(
    reportPage,
    expiryTotalPages
  );

  const paginatedExpiryRows =
    filteredExpiryRows.slice(
      (safeExpiryPage - 1) * REPORT_PAGE_SIZE,
      safeExpiryPage * REPORT_PAGE_SIZE
    );

    const supplierTotalOrders =
    supplierSummary.reduce(
      (sum, supplier) =>
        sum + supplier.poCount,
      0
    );

  const supplierTotalValue =
    supplierSummary.reduce(
      (sum, supplier) =>
        sum + supplier.totalValue,
      0
    );

  const supplierActiveOrders =
    supplierSummary.reduce(
      (sum, supplier) =>
        sum +
        supplier.pendingCount +
        supplier.approvedCount +
        supplier.processingCount +
        supplier.shippedCount,
      0
    );

  const supplierReceivedOrders =
    supplierSummary.reduce(
      (sum, supplier) =>
        sum + supplier.receivedCount,
      0
    );

  const supplierLateDeliveries =
    supplierSummary.reduce(
      (sum, supplier) =>
        sum + supplier.lateDeliveries,
      0
    );

  const filteredSupplierRows =
    supplierSummary.filter((supplier) => {
      if (!normalizedReportSearch) {
        return true;
      }

      return supplier.name
        .toLowerCase()
        .includes(normalizedReportSearch);
    });

  const supplierTotalPages = Math.max(
    1,
    Math.ceil(
      filteredSupplierRows.length /
        REPORT_PAGE_SIZE
    )
  );

  const safeSupplierPage = Math.min(
    reportPage,
    supplierTotalPages
  );

  const paginatedSupplierRows =
    filteredSupplierRows.slice(
      (safeSupplierPage - 1) *
        REPORT_PAGE_SIZE,
      safeSupplierPage * REPORT_PAGE_SIZE
    );

    if (!hasReportsAccess) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="w-full max-w-lg bg-white p-8 rounded-2xl border border-rose-200 shadow-sm text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-rose-600" />
          </div>

          <h1 className="text-xl font-black text-slate-900 mt-4">
            Reports Access Restricted
          </h1>

          <p className="text-sm text-slate-600 mt-2">
            {isUser
              ? 'Customer accounts cannot access internal inventory and procurement reports.'
              : 'Your account does not have permission to access the MediStock reporting module.'}
          </p>

          <p className="text-xs text-slate-400 mt-3">
            Contact a system administrator if you believe you require report access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" /> Executive Stock Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data insights, inventory valuation, expiry audits, and vendor supply chain analytics
          </p>
        </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
          {lastUpdated && (
            <span className="text-[10px] text-slate-400 font-medium">
              Last updated:{' '}
              {lastUpdated.toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}

          <button
            type="button"
            onClick={() =>
              setRefreshKey((current) => current + 1)
            }
            disabled={
              loadingInventory || loadingSuppliers
            }
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition disabled:opacity-50"
            title="Refresh report data"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loadingInventory || loadingSuppliers
                  ? 'animate-spin'
                  : ''
              }`}
            />
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>

                     <button
            onClick={handleExportPDF}
            disabled={
              exporting ||
              loadingInventory ||
              loadingSuppliers
            }
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/20 transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button> 

          <button
            onClick={handleExportCSV}
            disabled={
              exporting ||
              loadingInventory ||
              loadingSuppliers
            }
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}

            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

     {reportError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-rose-700">
              Report data could not be loaded
            </p>

            <p className="text-[11px] text-rose-600 mt-1">
              {reportError}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setRefreshKey((current) => current + 1)
            }
            className="px-3 py-2 bg-white border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tabs and Date Range Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Navigation Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {canViewInventoryReports && (
            <button
              onClick={() => setActiveTab('VALUATION')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'VALUATION'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <IndianRupee className="w-4 h-4" />
              Inventory Valuation
            </button>
          )}

          {canViewInventoryReports && (
            <button
              onClick={() => setActiveTab('EXPIRY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'EXPIRY'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Expiry Risk Audit
            </button>
          )}

          {canViewSupplierReports && (
            <button
              onClick={() => setActiveTab('SUPPLIERS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'SUPPLIERS'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PieChart className="w-4 h-4" />
              Supplier Share
            </button>
          )}
        </div>
        

        {/* Context-aware Date Filter */}
        {activeTab !== 'VALUATION' && (
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Calendar className="w-4 h-4 text-slate-400" />

            {activeTab === 'EXPIRY'
              ? 'Upcoming Window:'
              : 'Order History:'}

            <select
              value={dateRange}
              onChange={(event) =>
                setDateRange(event.target.value)
              }
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {activeTab === 'EXPIRY' ? (
                <>
                  <option value="30">Next 30 Days</option>
                  <option value="90">Next 90 Days</option>
                  <option value="180">Next 6 Months</option>
                  <option value="365">Next 1 Year</option>
                </>
              ) : (
                <>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                  <option value="180">Last 6 Months</option>
                  <option value="365">Last 1 Year</option>
                </>
              )}
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Valuation Report */}
      {activeTab === 'VALUATION' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">
                Total Stock Valuation
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {formatINR(totalValue)}
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Based on current inventory quantities
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">
                Total Units In Warehouse
              </span>
              <h3 className="text-2xl font-black text-blue-600 mt-1">
                {totalUnits.toLocaleString('en-IN')} Units
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Across {inventoryItems.length} inventory records
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">
                Average Unit Valuation
              </span>
              <h3 className="text-2xl font-black text-purple-600 mt-1">
                {formatINR(averageUnitValue)} / unit
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Based on current catalog prices
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Stock Value by Category
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Total capital allocation across pharmaceutical
              categories in INR
            </p>
            <div className="h-72">
              <Bar
                data={valuationData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Inventory Valuation Details
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Medicine and batch-level valuation using current stock and catalog prices
                </p>
              </div>

              <input
                type="search"
                value={reportSearch}
                onChange={(event) => {
                  setReportSearch(event.target.value);
                  setReportPage(1);
                }}
                placeholder="Search medicine, code, category or batch..."
                className="w-full sm:w-80 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">
                      Medicine
                    </th>
                    <th className="px-5 py-3.5">
                      Category
                    </th>
                    <th className="px-5 py-3.5">
                      Batch
                    </th>
                    <th className="px-5 py-3.5 text-right">
                      Quantity
                    </th>
                    <th className="px-5 py-3.5 text-right">
                      Unit Price
                    </th>
                    <th className="px-5 py-3.5 text-right">
                      Stock Value
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedValuationRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        No inventory records match your search.
                      </td>
                    </tr>
                  ) : (
                    paginatedValuationRows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-50/70 transition"
                      >
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">
                            {row.medicineName}
                          </p>

                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {row.medicineCode}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {row.category}
                        </td>

                        <td className="px-5 py-4 font-mono text-slate-600">
                          {row.batchNumber}
                        </td>

                        <td className="px-5 py-4 text-right font-mono font-semibold text-slate-700">
                          {row.quantity.toLocaleString(
                            'en-IN'
                          )}
                        </td>

                        <td className="px-5 py-4 text-right text-slate-600">
                          {formatINR(row.unitPrice)}
                        </td>

                        <td className="px-5 py-4 text-right font-bold text-blue-700">
                          {formatINR(row.totalValue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Showing{' '}
                {filteredValuationRows.length === 0
                  ? 0
                  : (safeValuationPage - 1) *
                      REPORT_PAGE_SIZE +
                    1}
                –
                {Math.min(
                  safeValuationPage *
                    REPORT_PAGE_SIZE,
                  filteredValuationRows.length
                )}{' '}
                of {filteredValuationRows.length} records
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safeValuationPage <= 1}
                  onClick={() =>
                    setReportPage((page) =>
                      Math.max(1, page - 1)
                    )
                  }
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="text-xs font-semibold text-slate-600">
                  Page {safeValuationPage} of{' '}
                  {valuationTotalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    safeValuationPage >=
                    valuationTotalPages
                  }
                  onClick={() =>
                    setReportPage((page) =>
                      Math.min(
                        valuationTotalPages,
                        page + 1
                      )
                    )
                  }
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Tab 2: Expiry Risk Report */}
      {activeTab === 'EXPIRY' && (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
  <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50/20 shadow-xs">
    <span className="text-xs text-red-700 font-semibold">
      Expired Batches
    </span>

    <h3 className="text-2xl font-black text-red-700 mt-1">
      {expirySummary?.expiredCount ??
        expiredItems.length}{' '}
      Batches
    </h3>

    <p className="text-[11px] text-red-600 mt-1">
      Value:{' '}
      {formatINR(
        expirySummary?.expiredValue ??
          expiredItems.reduce(
            (sum, item) =>
              sum +
              Number(item.quantity || 0) *
                Number(
                  item.medicine?.unitPrice || 0
                ),
            0
          )
      )}
    </p>
  </div>

  <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
    <span className="text-xs text-rose-700 font-semibold">
      Critical Risk (0–30 Days)
    </span>

    <h3 className="text-2xl font-black text-rose-700 mt-1">
      {expirySummary?.criticalCount ??
        criticalExpiryItems.length}{' '}
      Batches
    </h3>

    <p className="text-[11px] text-rose-600 mt-1">
      Value at risk:{' '}
      {formatINR(
        expirySummary?.criticalValue ??
          criticalExpiryItems.reduce(
            (sum, item) =>
              sum +
              Number(item.quantity || 0) *
                Number(
                  item.medicine?.unitPrice || 0
                ),
            0
          )
      )}
    </p>
  </div>

  <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
    <span className="text-xs text-amber-700 font-semibold">
      Warning Risk (31–90 Days)
    </span>

    <h3 className="text-2xl font-black text-amber-700 mt-1">
      {expirySummary?.warningCount ??
        warningExpiryItems.length}{' '}
      Batches
    </h3>

    <p className="text-[11px] text-amber-600 mt-1">
      Value at risk:{' '}
      {formatINR(
        expirySummary?.warningValue ??
          warningExpiryItems.reduce(
            (sum, item) =>
              sum +
              Number(item.quantity || 0) *
                Number(
                  item.medicine?.unitPrice || 0
                ),
            0
          )
      )}
    </p>
  </div>

  <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
    <span className="text-xs text-emerald-700 font-semibold">
      Safe Inventory (&gt;90 Days)
    </span>

    <h3 className="text-2xl font-black text-emerald-700 mt-1">
      {Number(
        expirySummary?.safePercentage ??
          safeInventoryPercentage
      ).toFixed(1)}
      %
    </h3>

    <p className="text-[11px] text-emerald-600 mt-1">
      {expirySummary?.safeCount ??
        safeExpiryItems.length}{' '}
      of{' '}
      {expirySummary?.totalInventoryRecords ??
        inventoryItems.length}{' '}
      batches
    </p>
  </div>
</div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              {expiryForecastLabel} Expiration Forecast
            </h3>

            <p className="text-xs text-slate-500 mb-4">
              Projected batch expiration dates within the next{' '}
              {selectedExpiryDays} days
            </p>

            <div className="h-72">
              <Line
                data={expiryTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Expiry Risk Details
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Expired batches and upcoming expirations within the selected {selectedExpiryDays}-day window
                </p>
              </div>

              <input
                type="search"
                value={reportSearch}
                onChange={(event) => {
                  setReportSearch(event.target.value);
                  setReportPage(1);
                }}
                placeholder="Search medicine, code, batch or risk..."
                className="w-full sm:w-80 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">
                      Medicine
                    </th>
                    <th className="px-5 py-3.5">
                      Batch
                    </th>
                    <th className="px-5 py-3.5">
                      Expiry Date
                    </th>
                    <th className="px-5 py-3.5">
                      Time Remaining
                    </th>
                    <th className="px-5 py-3.5">
                      Risk Level
                    </th>
                    <th className="px-5 py-3.5 text-right">
                      Quantity
                    </th>
                    <th className="px-5 py-3.5 text-right">
                      Value at Risk
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedExpiryRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        No expiry-risk records match this view.
                      </td>
                    </tr>
                  ) : (
                    paginatedExpiryRows.map((row) => {
                      const riskClass =
                        row.riskLevel === 'EXPIRED'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : row.riskLevel === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : row.riskLevel === 'WARNING'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200';

                      return (
                        <tr
                          key={row.id}
                          className="hover:bg-slate-50/70 transition"
                        >
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-900">
                              {row.medicineName}
                            </p>

                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {row.medicineCode}
                            </p>
                          </td>

                          <td className="px-5 py-4 font-mono text-slate-600">
                            {row.batchNumber}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {row.expiryDate
                              ? new Date(
                                  `${row.expiryDate}T00:00:00`
                                ).toLocaleDateString(
                                  'en-IN'
                                )
                              : 'N/A'}
                          </td>

                          <td className="px-5 py-4 font-semibold">
                            {row.daysRemaining < 0
                              ? `${Math.abs(
                                  row.daysRemaining
                                )} days overdue`
                              : row.daysRemaining === 0
                              ? 'Expires today'
                              : `${row.daysRemaining} days`}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full border text-[10px] font-bold ${riskClass}`}
                            >
                              {row.riskLevel}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right font-mono font-semibold text-slate-700">
                            {row.quantity.toLocaleString(
                              'en-IN'
                            )}
                          </td>

                          <td className="px-5 py-4 text-right font-bold text-rose-700">
                            {formatINR(row.valueAtRisk)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Showing{' '}
                {filteredExpiryRows.length === 0
                  ? 0
                  : (safeExpiryPage - 1) *
                      REPORT_PAGE_SIZE +
                    1}
                –
                {Math.min(
                  safeExpiryPage * REPORT_PAGE_SIZE,
                  filteredExpiryRows.length
                )}{' '}
                of {filteredExpiryRows.length} risk records
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safeExpiryPage <= 1}
                  onClick={() =>
                    setReportPage((page) =>
                      Math.max(1, page - 1)
                    )
                  }
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="text-xs font-semibold text-slate-600">
                  Page {safeExpiryPage} of{' '}
                  {expiryTotalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    safeExpiryPage >= expiryTotalPages
                  }
                  onClick={() =>
                    setReportPage((page) =>
                      Math.min(
                        expiryTotalPages,
                        page + 1
                      )
                    )
                  }
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        
      )}

            {/* Tab 3: Supplier Performance */}
      {activeTab === 'SUPPLIERS' && (
        <div className="space-y-6">
          {loadingSuppliers ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />

              <p className="text-sm font-semibold text-slate-500">
                Loading supplier procurement data...
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">
                    Procurement Value
                  </span>

                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {formatINR(supplierTotalValue)}
                  </h3>

                  <p className="text-[11px] text-slate-400 mt-1">
                    Excludes cancelled orders
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs">
                  <span className="text-xs text-blue-700 font-semibold">
                    Purchase Orders
                  </span>

                  <h3 className="text-2xl font-black text-blue-700 mt-1">
                    {supplierTotalOrders}
                  </h3>

                  <p className="text-[11px] text-blue-600 mt-1">
                    Within the selected period
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
                  <span className="text-xs text-amber-700 font-semibold">
                    Active Fulfilment
                  </span>

                  <h3 className="text-2xl font-black text-amber-700 mt-1">
                    {supplierActiveOrders}
                  </h3>

                  <p className="text-[11px] text-amber-600 mt-1">
                    Pending through shipped orders
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
                  <span className="text-xs text-emerald-700 font-semibold">
                    Received / Late
                  </span>

                  <h3 className="text-2xl font-black text-emerald-700 mt-1">
                    {supplierReceivedOrders}
                    <span className="text-sm text-rose-600 ml-2">
                      / {supplierLateDeliveries}
                    </span>
                  </h3>

                  <p className="text-[11px] text-emerald-600 mt-1">
                    Received shipments / late deliveries
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center">
                  <h3 className="font-bold text-slate-900 text-sm text-center">
                    Procurement Market Share
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 text-center">
                    Share of non-cancelled purchase-order value
                  </p>

                  <div className="w-64 h-64 mt-4">
                    {supplierShareData ? (
                      <Pie
                        data={supplierShareData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    ) : (
                      <p className="text-xs text-slate-400 text-center pt-24">
                        No procurement data available
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Top Supplier Overview
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Suppliers ranked by procurement value
                  </p>

                  <div className="space-y-3">
                    {supplierSummary.length === 0 ? (
                      <p className="text-xs text-slate-400 py-10 text-center">
                        No supplier data is available for this period.
                      </p>
                    ) : (
                      supplierSummary
                        .slice(0, 5)
                        .map((supplier) => (
                          <div
                            key={supplier.name}
                            className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-4"
                          >
                            <div>
                              <p className="font-bold text-slate-900 text-xs">
                                {supplier.name}
                              </p>

                              <p className="text-[10px] text-slate-500 mt-1">
                                {supplier.poCount} orders ·{' '}
                                {supplier.receivedCount} received ·{' '}
                                {supplier.lateDeliveries} late
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="font-black text-blue-700 text-sm">
                                {supplier.share}%
                              </p>

                              <p className="text-[10px] text-slate-500">
                                {formatINR(
                                  supplier.totalValue
                                )}
                              </p>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Supplier Performance Details
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      Purchase-order value, fulfilment status and delivery performance
                    </p>
                  </div>

                  <input
                    type="search"
                    value={reportSearch}
                    onChange={(event) => {
                      setReportSearch(event.target.value);
                      setReportPage(1);
                    }}
                    placeholder="Search supplier..."
                    className="w-full sm:w-72 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-4 py-3.5">
                          Supplier
                        </th>
                        <th className="px-4 py-3.5 text-right">
                          POs
                        </th>
                        <th className="px-4 py-3.5 text-right">
                          Procurement
                        </th>
                        <th className="px-4 py-3.5 text-right">
                          Avg Order
                        </th>
                        <th className="px-4 py-3.5 text-center">
                          Active
                        </th>
                        <th className="px-4 py-3.5 text-center">
                          Received
                        </th>
                        <th className="px-4 py-3.5 text-center">
                          Late
                        </th>
                        <th className="px-4 py-3.5 text-center">
                          Avg Delivery
                        </th>
                        <th className="px-4 py-3.5 text-right">
                          Share
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {paginatedSupplierRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-5 py-10 text-center text-slate-500"
                          >
                            No supplier records match this view.
                          </td>
                        </tr>
                      ) : (
                        paginatedSupplierRows.map(
                          (supplier) => {
                            const activeOrders =
                              supplier.pendingCount +
                              supplier.approvedCount +
                              supplier.processingCount +
                              supplier.shippedCount;

                            return (
                              <tr
                                key={supplier.name}
                                className="hover:bg-slate-50/70 transition"
                              >
                                <td className="px-4 py-4 font-bold text-slate-900">
                                  {supplier.name}
                                </td>

                                <td className="px-4 py-4 text-right font-mono">
                                  {supplier.poCount}
                                </td>

                                <td className="px-4 py-4 text-right font-semibold text-slate-700">
                                  {formatINR(
                                    supplier.totalValue
                                  )}
                                </td>

                                <td className="px-4 py-4 text-right text-slate-600">
                                  {formatINR(
                                    supplier.averageOrderValue
                                  )}
                                </td>

                                <td className="px-4 py-4 text-center text-amber-700 font-bold">
                                  {activeOrders}
                                </td>

                                <td className="px-4 py-4 text-center text-emerald-700 font-bold">
                                  {supplier.receivedCount}
                                </td>

                                <td className="px-4 py-4 text-center text-rose-700 font-bold">
                                  {supplier.lateDeliveries}
                                </td>

                                <td className="px-4 py-4 text-center text-slate-600">
                                  {supplier.averageDeliveryDays ===
                                  null
                                    ? 'N/A'
                                    : `${supplier.averageDeliveryDays} days`}
                                </td>

                                <td className="px-4 py-4 text-right font-black text-blue-700">
                                  {supplier.share}%
                                </td>
                              </tr>
                            );
                          }
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    Showing{' '}
                    {filteredSupplierRows.length === 0
                      ? 0
                      : (safeSupplierPage - 1) *
                          REPORT_PAGE_SIZE +
                        1}
                    –
                    {Math.min(
                      safeSupplierPage *
                        REPORT_PAGE_SIZE,
                      filteredSupplierRows.length
                    )}{' '}
                    of {filteredSupplierRows.length} suppliers
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={safeSupplierPage <= 1}
                      onClick={() =>
                        setReportPage((page) =>
                          Math.max(1, page - 1)
                        )
                      }
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <span className="text-xs font-semibold text-slate-600">
                      Page {safeSupplierPage} of{' '}
                      {supplierTotalPages}
                    </span>

                    <button
                      type="button"
                      disabled={
                        safeSupplierPage >=
                        supplierTotalPages
                      }
                      onClick={() =>
                        setReportPage((page) =>
                          Math.min(
                            supplierTotalPages,
                            page + 1
                          )
                        )
                      }
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      </div>
  );
}