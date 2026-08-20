import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { toast } from 'react-toastify';
import { purchaseOrderService } from '../../../services/api/purchaseOrderService';
import { supplierService } from '../../../services/api/supplierService';
import { medicineService } from '../../../services/api/medicineService';
import { inventoryService } from '../../../services/api/inventoryService';
import { useAuth } from '../../../contexts/AuthContext';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  FileText,
  X,
  Trash2,
  Download,
  IndianRupee,
  RefreshCw,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function PurchaseOrderPage() {
  const { isSupplier, isAdmin, isPharmacist } = useAuth();
  const canCreatePO = isAdmin || isPharmacist;

  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [supplierMedicines, setSupplierMedicines] = useState([]);
  const [inventoryByMedicine, setInventoryByMedicine] = useState({});
  const [supplierMedicinesLoading, setSupplierMedicinesLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Column Sorting
  const [sortField, setSortField] = useState('orderDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  // New PO Form state
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [lineItems, setLineItems] = useState([
    { medicineId: '', quantity: 100, unitPrice: 150.0 },
  ]);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await purchaseOrderService.getAllPurchaseOrders();
      const list = Array.isArray(res) ? res : [];
      setOrders(list);
    } catch (err) {
      console.error('Failed to load purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [sups, meds, inventory] = await Promise.all([
        supplierService.getAllSuppliers(),
        medicineService.getAllMedicines(0, 500),
        inventoryService.getAllInventory()
      ]);
      const supList = Array.isArray(sups) ? sups.filter(s => s.active !== false) : [];
      const medList = meds.content || meds || [];
      setSuppliers(supList);
      setMedicines(Array.isArray(medList) ? medList : []);
      const inventoryMap = (Array.isArray(inventory) ? inventory : []).reduce((map, row) => {
        const key = String(row.medicine?.id || row.medicineId);
        const current = map[key] || { quantity: 0, minimumStock: 0 };
        map[key] = {
          quantity: current.quantity + Number(row.quantity || 0),
          minimumStock: Math.max(current.minimumStock, Number(row.minimumStock || 0))
        };
        return map;
      }, {});
      setInventoryByMedicine(inventoryMap);
    } catch (err) {
      console.error('Failed to load dropdown data:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (!selectedSupplierId) {
      setSupplierMedicines([]);
      return;
    }

    const loadSupplierMedicines = async () => {
      setSupplierMedicinesLoading(true);
      try {
        const linked = await supplierService.getSuppliedMedicines(selectedSupplierId);
        setSupplierMedicines(Array.isArray(linked) ? linked : []);
        setLineItems(items => items.map(item => ({ ...item, medicineId: '', unitPrice: 0 })));
      } catch (err) {
        setSupplierMedicines([]);
        toast.error('Unable to load medicines approved for this supplier');
      } finally {
        setSupplierMedicinesLoading(false);
      }
    };

    loadSupplierMedicines();
  }, [selectedSupplierId]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { medicineId: '', quantity: 100, unitPrice: 150.0 }]);
  };

  const handleRemoveLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    if (field === 'medicineId') {
      const medicine = supplierMedicines.find(item => String(item.id) === String(value));
      updated[index].unitPrice = medicine?.unitPrice || 0;
    }
    setLineItems(updated);
  };

  const eligibleMedicines = supplierMedicines
    .map(linked => medicines.find(medicine => Number(medicine.id) === Number(linked.id)) || linked)
    .filter(Boolean);

  const calculateTotal = () => {
    return lineItems.reduce((acc, item) => acc + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!selectedSupplierId || !expectedDate || lineItems.some(i => !i.medicineId)) {
      toast.error('Please fill in required fields: Supplier, Expected Date, and Medicine line items.');
      return;
    }

    try {
      const payload = {
        supplierId: Number(selectedSupplierId),
        expectedDelivery: expectedDate,
        status: 'PENDING',
        items: lineItems.map(i => ({
          medicineId: Number(i.medicineId),
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice)
        }))
      };

      await purchaseOrderService.createPurchaseOrder(payload);
      toast.success('Purchase Order created successfully!');
      setCreateModalOpen(false);
      fetchOrders();
      
      // Reset form
      setSelectedSupplierId('');
      setExpectedDate('');
      setLineItems([{ medicineId: '', quantity: 100, unitPrice: 150.0 }]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create purchase order');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await purchaseOrderService.updatePurchaseOrderStatus(id, newStatus);
      toast.success(`Purchase Order status updated to ${newStatus}`);
      fetchOrders();
      if (viewOrder?.id === id) {
        setViewOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    const q = searchTerm.toLowerCase();
    const poNum = (o.orderNumber || o.id || '').toString().toLowerCase();
    const supName = (o.supplier?.supplierName || o.supplierName || '').toLowerCase();
    return poNum.includes(q) || supName.includes(q);
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'supplierName') {
      valA = (a.supplier?.supplierName || a.supplierName || '').toLowerCase();
      valB = (b.supplier?.supplierName || b.supplierName || '').toLowerCase();
    } else if (sortField === 'orderNumber') {
      valA = (a.orderNumber || a.id || '').toString().toLowerCase();
      valB = (b.orderNumber || b.id || '').toString().toLowerCase();
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600 font-bold" /> : <ArrowDown className="w-3 h-3 text-blue-600 font-bold" />;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold text-[10px] rounded-full border border-blue-200 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> APPROVED
          </span>
        );
      case 'DELIVERED':
      case 'RECEIVED':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-200 inline-flex items-center gap-1">
            <Truck className="w-3 h-3" /> RECEIVED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-bold text-[10px] rounded-full border border-rose-200 inline-flex items-center gap-1">
            <XCircle className="w-3 h-3" /> CANCELLED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full border border-amber-200 inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
    }
  };
    const handleDownloadInvoice = (order) => {
    try {
      if (!order) {
        toast.error('Purchase order details are unavailable');
        return;
      }

      const document = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth =
        document.internal.pageSize.getWidth();

      const pageHeight =
        document.internal.pageSize.getHeight();

      const margin = 18;
      const contentWidth = pageWidth - margin * 2;

      const orderNumber =
        order.orderNumber || `PO-${order.id}`;

      const supplierName =
        order.supplier?.supplierName ||
        order.supplierName ||
        `Supplier #${order.supplierId || 'N/A'}`;

      const items =
        Array.isArray(order.items) ? order.items : [];

      const formatPdfAmount = (value) =>
        `INR ${Number(value || 0).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

      const safeFilename = String(orderNumber).replace(
        /[^a-zA-Z0-9-_]/g,
        '-'
      );

      let y = 0;

      const addHeader = () => {
        document.setFillColor(30, 64, 175);
        document.rect(0, 0, pageWidth, 38, 'F');

        document.setTextColor(255, 255, 255);
        document.setFont('helvetica', 'bold');
        document.setFontSize(20);
        document.text('MediStock', margin, 16);

        document.setFontSize(10);
        document.setFont('helvetica', 'normal');
        document.text(
          'Medical Inventory Management System',
          margin,
          23
        );

        document.setFont('helvetica', 'bold');
        document.setFontSize(16);
        document.text(
          'PURCHASE ORDER INVOICE',
          pageWidth - margin,
          16,
          { align: 'right' }
        );

        document.setFontSize(10);
        document.setFont('helvetica', 'normal');
        document.text(
          orderNumber,
          pageWidth - margin,
          23,
          { align: 'right' }
        );

        document.setTextColor(15, 23, 42);
      };

      const addTableHeader = () => {
        document.setFillColor(226, 232, 240);
        document.rect(
          margin,
          y,
          contentWidth,
          9,
          'F'
        );

        document.setFont('helvetica', 'bold');
        document.setFontSize(8);
        document.setTextColor(51, 65, 85);

        document.text('#', margin + 3, y + 6);
        document.text('MEDICINE', margin + 12, y + 6);
        document.text('QTY', margin + 95, y + 6);
        document.text('UNIT PRICE', margin + 115, y + 6);
        document.text(
          'AMOUNT',
          pageWidth - margin - 3,
          y + 6,
          { align: 'right' }
        );

        document.setTextColor(15, 23, 42);
        y += 9;
      };

      const addPageFooter = () => {
        document.setDrawColor(203, 213, 225);
        document.line(
          margin,
          pageHeight - 18,
          pageWidth - margin,
          pageHeight - 18
        );

        document.setFont('helvetica', 'normal');
        document.setFontSize(8);
        document.setTextColor(100, 116, 139);

        document.text(
          'Generated by MediStock Medical Inventory Management System',
          margin,
          pageHeight - 11
        );

        document.text(
          `Generated: ${new Date().toLocaleString('en-IN')}`,
          pageWidth - margin,
          pageHeight - 11,
          { align: 'right' }
        );
      };

      addHeader();

      y = 49;

      document.setFont('helvetica', 'bold');
      document.setFontSize(9);
      document.setTextColor(100, 116, 139);
      document.text('SUPPLIER', margin, y);

      document.text('STATUS', margin + 92, y);

      y += 6;

      document.setTextColor(15, 23, 42);
      document.setFontSize(11);
      document.text(supplierName, margin, y);

      document.setTextColor(
        order.status === 'CANCELLED' ? 190 : 30,
        order.status === 'CANCELLED' ? 24 : 100,
        order.status === 'CANCELLED' ? 93 : 80
      );

      document.text(
        order.status || 'PENDING',
        margin + 92,
        y
      );

      document.setTextColor(15, 23, 42);

      y += 12;

      document.setFont('helvetica', 'bold');
      document.setFontSize(8);
      document.setTextColor(100, 116, 139);
      document.text('ORDER DATE', margin, y);
      document.text(
        'EXPECTED DELIVERY',
        margin + 60,
        y
      );

      y += 6;

      document.setFont('helvetica', 'normal');
      document.setFontSize(10);
      document.setTextColor(15, 23, 42);

      document.text(
        String(order.orderDate || 'N/A'),
        margin,
        y
      );

      document.text(
        String(order.expectedDelivery || 'N/A'),
        margin + 60,
        y
      );

      y += 12;
      addTableHeader();

      if (items.length === 0) {
        document.setFont('helvetica', 'normal');
        document.setFontSize(9);
        document.setTextColor(100, 116, 139);
        document.text(
          'No line items are available for this order.',
          margin + 3,
          y + 8
        );
        y += 15;
      } else {
        items.forEach((item, index) => {
          const medicineName =
            item.medicineName ||
            item.medicine?.name ||
            `Medicine #${item.medicineId || index + 1}`;

          const quantity = Number(item.quantity || 0);
          const unitPrice = Number(item.unitPrice || 0);

          const subtotal = Number(
            item.subtotal ?? quantity * unitPrice
          );

          const medicineLines =
            document.splitTextToSize(
              medicineName,
              76
            );

          const rowHeight = Math.max(
            10,
            medicineLines.length * 4.5 + 4
          );

          if (y + rowHeight > pageHeight - 27) {
            addPageFooter();
            document.addPage();
            addHeader();
            y = 47;
            addTableHeader();
          }

          if (index % 2 === 1) {
            document.setFillColor(248, 250, 252);
            document.rect(
              margin,
              y,
              contentWidth,
              rowHeight,
              'F'
            );
          }

          document.setFont('helvetica', 'normal');
          document.setFontSize(8.5);
          document.setTextColor(15, 23, 42);

          document.text(
            String(index + 1),
            margin + 3,
            y + 6
          );

          document.text(
            medicineLines,
            margin + 12,
            y + 6
          );

          document.text(
            String(quantity),
            margin + 95,
            y + 6
          );

          document.text(
            formatPdfAmount(unitPrice),
            margin + 115,
            y + 6
          );

          document.setFont('helvetica', 'bold');

          document.text(
            formatPdfAmount(subtotal),
            pageWidth - margin - 3,
            y + 6,
            { align: 'right' }
          );

          document.setDrawColor(226, 232, 240);
          document.line(
            margin,
            y + rowHeight,
            pageWidth - margin,
            y + rowHeight
          );

          y += rowHeight;
        });
      }

      if (y + 28 > pageHeight - 25) {
        addPageFooter();
        document.addPage();
        addHeader();
        y = 50;
      }

      y += 7;

      document.setFillColor(239, 246, 255);
      document.setDrawColor(191, 219, 254);
      document.roundedRect(
        margin,
        y,
        contentWidth,
        18,
        2,
        2,
        'FD'
      );

      document.setFont('helvetica', 'bold');
      document.setFontSize(10);
      document.setTextColor(30, 64, 175);

      document.text(
        'TOTAL PURCHASE VALUE',
        margin + 5,
        y + 11
      );

      document.setFontSize(14);

      document.text(
        formatPdfAmount(order.totalAmount),
        pageWidth - margin - 5,
        y + 11,
        { align: 'right' }
      );

      addPageFooter();

      document.save(
        `MediStock-Invoice-${safeFilename}.pdf`
      );

      toast.success(
        `Invoice PDF downloaded for ${orderNumber}`
      );
    } catch (error) {
      console.error('Invoice PDF generation failed:', error);

      toast.error(
        'Unable to generate the invoice PDF'
      );
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" /> {isSupplier ? 'Orders From MediStock' : 'Enterprise Purchase Orders & Procurement'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isSupplier
              ? 'View and track purchase orders received from MediStock.'
              : 'Procurement management, vendor purchase requests, order status lifecycle tracking, and invoicing'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="Refresh orders list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {canCreatePO && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Purchase Order
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total PO Value (INR)</span>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            {formatINR(orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0))}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-700">Pending Approval</span>
          <h3 className="text-xl font-black text-amber-700 mt-1">
            {orders.filter(o => o.status === 'PENDING').length}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-blue-700">Approved Orders</span>
          <h3 className="text-xl font-black text-blue-700 mt-1">
            {orders.filter(o => o.status === 'APPROVED').length}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700">Received Shipments</span>
          <h3 className="text-xl font-black text-emerald-700 mt-1">
            {orders.filter(o => o.status === 'RECEIVED' || o.status === 'DELIVERED').length}
          </h3>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by PO order number or supplier name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="RECEIVED">RECEIVED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th
                  onClick={() => handleSort('orderNumber')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Order No.</span>
                    {renderSortIcon('orderNumber')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('supplierName')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Supplier Vendor</span>
                    {renderSortIcon('supplierName')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('orderDate')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Order Date</span>
                    {renderSortIcon('orderDate')}
                  </div>
                </th>
                <th className="py-3.5 px-6">Expected Delivery</th>
                <th
                  onClick={() => handleSort('totalAmount')}
                  className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Total Amount (INR)</span>
                    {renderSortIcon('totalAmount')}
                  </div>
                </th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Loading purchase orders...
                  </td>
                </tr>
              ) : sortedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    {isSupplier ? 'No purchase orders have been received from MediStock yet.' : 'No purchase orders found.'}
                  </td>
                </tr>
              ) : (
                sortedOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">{po.orderNumber || `PO-${po.id}`}</td>
                    <td className="py-4 px-6 font-semibold text-slate-800">{po.supplier?.supplierName || po.supplierName || 'Vendor N/A'}</td>
                    <td className="py-4 px-6 text-slate-600">{po.orderDate}</td>
                    <td className="py-4 px-6 text-slate-600">{po.expectedDelivery}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {formatINR(po.totalAmount)}
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(po.status)}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setViewOrder(po)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View PO
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create PO Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col animate-in fade-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-600" /> Create New Purchase Order
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supplier Vendor <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Vendor</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.supplierName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expected Delivery Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Line items section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800">Order Items</h4>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item Row
                  </button>
                </div>

                <div className="space-y-2">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <select
                        required
                        value={item.medicineId}
                        onChange={(e) => handleLineItemChange(idx, 'medicineId', e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="">{supplierMedicinesLoading ? 'Loading approved medicines...' : 'Select approved medicine'}</option>
                        {eligibleMedicines.map(m => {
                          const stock = inventoryByMedicine[String(m.id)] || { quantity: 0, minimumStock: 0 };
                          return (
                          <option key={m.id} value={m.id}>
                            {m.name} | Stock {stock.quantity} / Reorder {stock.minimumStock}
                          </option>
                          );
                        })}
                      </select>
                      <input
                        type="number"
                        placeholder="Qty"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                        className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Unit ₹"
                        required
                        value={item.unitPrice}
                        readOnly
                        onChange={(e) => handleLineItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-28 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-900">Total Purchase Value:</span>
                <span className="font-black text-base text-blue-900">{formatINR(calculateTotal())}</span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View PO Details Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden">
            {/* 1. FIXED HEADER */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0 bg-white">
              <div>
                <span className="text-xs font-bold text-blue-600 font-mono">{viewOrder.orderNumber || `PO-${viewOrder.id}`}</span>
                <h3 className="font-bold text-slate-900 text-base">Purchase Order Details</h3>
              </div>
              <button
                onClick={() => setViewOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. SCROLLABLE CONTENT BODY */}
            <div className="p-5 overflow-y-auto min-h-0 flex-1 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Supplier</span>
                  <span className="font-bold text-slate-900">{viewOrder.supplier?.supplierName || viewOrder.supplierName || 'Vendor N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Status</span>
                  <div className="mt-0.5">{getStatusBadge(viewOrder.status)}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Order Date</span>
                  <span className="font-medium text-slate-700">{viewOrder.orderDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Expected Delivery</span>
                  <span className="font-medium text-slate-700">{viewOrder.expectedDelivery}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                    Line Items ({viewOrder.items ? viewOrder.items.length : 0})
                  </h4>
                </div>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                  {viewOrder.items && viewOrder.items.map((it, i) => (
                    <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50/50 transition">
                      <div>
                        <div className="font-bold text-slate-900">{it.medicineName || `Medicine #${it.medicineId}`}</div>
                        <div className="text-slate-400 text-[11px] font-mono">
                          Qty: <span className="font-bold text-slate-700">{it.quantity}</span> x {formatINR(it.unitPrice)}
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 font-mono">
                        {formatINR(it.subtotal || (it.quantity * it.unitPrice))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center font-bold text-xs text-blue-900">
                <span className="uppercase text-[10px] font-extrabold tracking-wider">Total Purchase Value:</span>
                <span className="text-base font-black text-blue-900">{formatINR(viewOrder.totalAmount)}</span>
              </div>
            </div>

            {/* 3. FIXED FOOTER */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 shrink-0 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {viewOrder.status === 'PENDING' && (
                  <button
                    onClick={() => handleUpdateStatus(viewOrder.id, 'APPROVED')}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
                  >
                    Approve PO
                  </button>
                )}
                {viewOrder.status === 'APPROVED' && (
                  <button
                    onClick={() => handleUpdateStatus(viewOrder.id, 'RECEIVED')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
                  >
                    Mark Received
                  </button>
                )}
                {viewOrder.status !== 'CANCELLED' && viewOrder.status !== 'RECEIVED' && (
                  <button
                    onClick={() => handleUpdateStatus(viewOrder.id, 'CANCELLED')}
                    className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-xl text-xs transition"
                  >
                    Cancel PO
                  </button>
                )}
              </div>

              <button
                onClick={() => handleDownloadInvoice(viewOrder)}
                className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition"
              >
                <Download className="w-3.5 h-3.5" /> PDF Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
