import React, { useState, useEffect } from 'react';
import { customerService } from '../../../services/api/customerService';
import Modal from '../../../components/common/Modal';
import { toast } from 'react-toastify';
import {
  Users,
  Search,
  Phone,
  Calendar,
  ShoppingBag,
  IndianRupee,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Receipt,
  ChevronRight,
  User,
  Activity,
  Filter
} from 'lucide-react';

export default function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Selected Customer Details Modal
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Selected Receipt Modal inside History Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomers(page, searchQuery, statusFilter);
  }, [page, statusFilter]);

  const fetchCustomers = async (pageNumber = 0, search = '', status = 'ALL') => {
    setLoading(true);
    try {
      const res = await customerService.getAllCustomers(search, status, pageNumber, 10);
      setCustomers(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      toast.error('Failed to load POS customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchCustomers(0, searchQuery, statusFilter);
  };

  const handleStatusToggle = async (customer) => {
    const newStatus = customer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await customerService.updateCustomerStatus(customer.id, newStatus);
      toast.success(`Customer status updated to ${newStatus}`);
      fetchCustomers(page, searchQuery);
    } catch (err) {
      toast.error('Failed to update customer status');
    }
  };

  const openCustomerHistory = async (customerId) => {
    setLoadingHistory(true);
    setHistoryModalOpen(true);
    try {
      const details = await customerService.getCustomerById(customerId);
      setSelectedCustomerDetails(details);
    } catch (err) {
      toast.error('Failed to load customer purchase history');
      setHistoryModalOpen(false);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePrintReceipt = (receipt) => {
    const printWindow = window.open('', '_blank');
    const itemsHtml = (receipt.items || []).map(item => `
      <tr>
        <td style="padding: 6px 0; font-size: 11px;">${item.medicineName}</td>
        <td style="padding: 6px 0; text-align: center; font-size: 11px;">${item.quantity}</td>
        <td style="padding: 6px 0; text-align: right; font-size: 11px;">₹${(item.unitPrice || 0).toFixed(2)}</td>
        <td style="padding: 6px 0; text-align: right; font-size: 11px;">₹${(item.subtotal || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>POS Receipt - ${receipt.receiptNumber}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 300px; margin: 0 auto; padding: 15px; color: #000; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .title { font-size: 16px; font-weight: bold; }
            .info { font-size: 11px; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th { border-bottom: 1px dashed #000; font-size: 11px; text-align: left; padding: 4px 0; }
            .total { border-top: 1px dashed #000; padding-top: 8px; font-weight: bold; text-align: right; font-size: 13px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 15px; font-size: 10px; border-top: 1px dashed #000; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">MEDISTOCK PHARMA</div>
            <div class="info">In-Store POS Sales Counter</div>
            <div class="info">Receipt #: ${receipt.receiptNumber}</div>
            <div class="info">Date: ${new Date(receipt.createdAt).toLocaleString()}</div>
          </div>
          <div class="info"><strong>Customer:</strong> ${receipt.customerName || 'Walk-in Customer'}</div>
          <div class="info"><strong>Phone:</strong> ${receipt.customerPhone || 'N/A'}</div>
          <div class="info"><strong>Payment Method:</strong> ${receipt.paymentMethod}</div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div class="total">Total Paid: ₹${(receipt.totalAmount || 0).toFixed(2)}</div>
          <div class="footer">Thank you for visiting MediStock!<br/>Get well soon.</div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Metrics calculation
  const totalSpentAll = customers.reduce((sum, c) => sum + (c.totalAmountSpent || 0), 0);
  const totalPurchasesAll = customers.reduce((sum, c) => sum + (c.totalPurchases || c.previousPurchasesCount || 0), 0);
  const activeCount = customers.filter(c => c.status === 'ACTIVE').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER TITLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" /> POS Customer Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage in-store walk-in pharmacy customers, track total expenditure, and view full transaction history.
          </p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Customers</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalElements}</h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Customers</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">POS Sales Count</p>
            <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{totalPurchasesAll}</h3>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Customer Revenue</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{totalSpentAll.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SEARCH AND CONTROLS */}
      <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name or phone number..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Customers</option>
            <option value="INACTIVE">Inactive Customers</option>
          </select>
          <button
            onClick={() => fetchCustomers(0, searchQuery, statusFilter)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">
            Loading POS customers...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No POS customers found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customers will automatically appear here once walk-in sales are processed at the POS counter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="p-3.5 pl-5">Customer ID</th>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Phone Number</th>
                  <th className="p-3.5 text-center">Total Purchases</th>
                  <th className="p-3.5 text-right">Total Spent</th>
                  <th className="p-3.5">Last Purchase</th>
                  <th className="p-3.5">Customer Since</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 pl-5 font-mono font-bold text-blue-600 dark:text-blue-400">
                      #CUST-{String(cust.id).padStart(4, '0')}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {cust.name}
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                      {cust.phone || cust.normalizedPhone || 'N/A'}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 rounded-lg font-bold">
                        {cust.totalPurchases || cust.previousPurchasesCount || 0}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{(cust.totalAmountSpent || 0).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">
                      {cust.lastPurchaseDate ? new Date(cust.lastPurchaseDate).toLocaleDateString() : 'No sales yet'}
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">
                      {cust.createdAt ? new Date(cust.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleStatusToggle(cust)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-full border transition ${
                          cust.status === 'ACTIVE'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {cust.status || 'ACTIVE'}
                      </button>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => openCustomerHistory(cust.id)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> History & Receipts
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Showing page {page + 1} of {totalPages} ({totalElements} customers)</span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CUSTOMER PURCHASE HISTORY MODAL */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Customer Profile & POS Purchase History"
        maxWidth="max-w-4xl"
      >
        {loadingHistory ? (
          <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
            Loading customer history...
          </div>
        ) : selectedCustomerDetails ? (
          <div className="space-y-6">
            {/* Customer Header Info */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedCustomerDetails.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Phone: {selectedCustomerDetails.phone || selectedCustomerDetails.normalizedPhone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Purchases</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedCustomerDetails.totalPurchases || 0} Sales
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Spent</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{(selectedCustomerDetails.totalAmountSpent || 0).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Status</span>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    selectedCustomerDetails.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {selectedCustomerDetails.status || 'ACTIVE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Purchases List */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-500" /> Store Receipts & Transactions
              </h3>

              {(!selectedCustomerDetails.purchases || selectedCustomerDetails.purchases.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  No purchase history found for this customer.
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {selectedCustomerDetails.purchases.map((p) => (
                    <div key={p.id} className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold rounded-lg border border-blue-200 dark:border-blue-800">
                            {p.receiptNumber}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(p.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                            {p.paymentMethod}
                          </span>
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{(p.totalAmount || 0).toFixed(2)}
                          </span>
                          <button
                            onClick={() => handlePrintReceipt(p)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5" /> Print
                          </button>
                        </div>
                      </div>

                      {/* Items table */}
                      <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                        <table className="w-full text-left text-[11px]">
                          <thead>
                            <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1">
                              <th className="pb-1">Medicine</th>
                              <th className="pb-1 text-center">Qty</th>
                              <th className="pb-1 text-right">Price</th>
                              <th className="pb-1 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
                            {(p.items || []).map((item) => (
                              <tr key={item.id}>
                                <td className="py-1 font-medium">{item.medicineName}</td>
                                <td className="py-1 text-center">{item.quantity}</td>
                                <td className="py-1 text-right">₹{(item.unitPrice || 0).toFixed(2)}</td>
                                <td className="py-1 text-right font-semibold">₹{(item.subtotal || 0).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
