import React, { useState, useEffect } from 'react';
import { prescriptionService } from '../../../services/api/prescriptionService';
import { toast } from 'react-toastify';
import Modal from '../../../components/common/Modal';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  User,
  MapPin,
  Phone,
  ExternalLink,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Building2,
  Download
} from 'lucide-react';

export default function PharmacistVerificationPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('PENDING_REVIEW');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [docBlobUrl, setDocBlobUrl] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await prescriptionService.getAllOrders(statusFilter);
      setOrders(data || []);
    } catch (err) {
      toast.error('Failed to load prescription orders queue');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    (ord) =>
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.patientName && ord.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ord.userEmail && ord.userEmail.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    return () => {
      if (docBlobUrl) {
        URL.revokeObjectURL(docBlobUrl);
      }
    };
  }, [docBlobUrl]);

  const openReviewModal = async (ord) => {
    setSelectedOrder(ord);
    setReviewNotes(ord.pharmacistNotes || '');
    setReviewModalOpen(true);

    if (docBlobUrl) {
      URL.revokeObjectURL(docBlobUrl);
      setDocBlobUrl(null);
    }

    if (ord.prescriptionFileUrl) {
      setLoadingDoc(true);
      try {
        const rawBlob = await prescriptionService.getPrescriptionDocumentBlob(ord.id);
        const fileName = ord.prescriptionFileName?.toLowerCase() || '';
        const rawType = ord.prescriptionContentType?.toLowerCase() || '';

        let mimeType = rawBlob.type || rawType;
        if (!mimeType || mimeType === 'application/octet-stream') {
          if (fileName.endsWith('.pdf') || rawType.includes('pdf')) {
            mimeType = 'application/pdf';
          } else if (fileName.endsWith('.png') || rawType.includes('png')) {
            mimeType = 'image/png';
          } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || rawType.includes('jpeg') || rawType.includes('jpg')) {
            mimeType = 'image/jpeg';
          }
        }

        const typedBlob = new Blob([rawBlob], { type: mimeType });
        const url = URL.createObjectURL(typedBlob);
        setDocBlobUrl(url);
      } catch (err) {
        console.error('Failed to load prescription document blob:', err);
      } finally {
        setLoadingDoc(false);
      }
    }
  };

  const closeReviewModal = () => {
    if (docBlobUrl) {
      URL.revokeObjectURL(docBlobUrl);
      setDocBlobUrl(null);
    }
    setReviewModalOpen(false);
  };

  const handleVerifyOrReject = async (status) => {
    if (!selectedOrder) return;
    setActionLoading(true);

    try {
      await prescriptionService.verifyOrder(selectedOrder.id, {
        status,
        pharmacistNotes: reviewNotes.trim(),
      });

      toast.success(
        status === 'VERIFIED' || status === 'APPROVED'
          ? `Order ${selectedOrder.orderNumber} verified and stock updated!`
          : `Order ${selectedOrder.orderNumber} rejected.`
      );

      closeReviewModal();
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order verification status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-white tracking-tight">Pharmacist Rx Verification Hub</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  Pharmacist & Admin Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Review uploaded doctor prescriptions, verify patient safety compliance, approve orders, and dispatch inventory.
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            {['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === st ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Order Queue */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" /> Queue Orders ({filteredOrders.length})
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order number, patient, or email..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-xs">Fetching prescription queue from PostgreSQL...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No prescription orders found matching current filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 transition flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white group-hover:text-indigo-400 transition">
                      {ord.orderNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === 'PENDING_REVIEW' || ord.status === 'PENDING_VERIFICATION'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : ord.status === 'APPROVED' || ord.status === 'VERIFIED' || ord.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-slate-300">
                      Patient: <strong className="text-white">{ord.patientName || 'N/A'}</strong>
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Doctor: {ord.doctorName || 'Not specified'}
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Customer: {ord.userFullName} ({ord.userEmail})
                    </p>
                    <p className="text-slate-400 text-[11px] truncate">
                      Address: {ord.deliveryAddress}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{ord.items?.length || 0} items</span>
                    <span className="text-sm font-black text-emerald-400">₹{(ord.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => openReviewModal(ord)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Review Prescription
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comprehensive Review Prescription Modal */}
      {reviewModalOpen && selectedOrder && (
        <Modal
          isOpen={true}
          onClose={closeReviewModal}
          title={`Review & Verify Prescription Order #${selectedOrder.orderNumber}`}
          subtitle={`Customer: ${selectedOrder.userFullName} | Patient: ${selectedOrder.patientName}`}
          icon={ShieldCheck}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-5 py-2 text-xs">
            {/* 1. ORDER & CUSTOMER INFORMATION GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Order Information */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Order Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Order Number</span>
                    <strong className="text-white font-mono">{selectedOrder.orderNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Status</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block">
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Created Date & Time</span>
                    <span className="text-slate-300">
                      {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Last Updated</span>
                    <span className="text-slate-300">
                      {selectedOrder.updatedAt ? new Date(selectedOrder.updatedAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-900 flex justify-between items-center">
                    <span className="text-slate-400 font-semibold">Total Amount:</span>
                    <span className="text-base font-black text-emerald-400">₹{(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Customer & Patient Details */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Customer & Patient Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Customer Name</span>
                    <strong className="text-slate-200">{selectedOrder.userFullName || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">User ID / Email</span>
                    <span className="text-slate-300 truncate block">#{selectedOrder.userId} • {selectedOrder.userEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Patient Name</span>
                    <strong className="text-white">{selectedOrder.patientName || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Prescribing Doctor</span>
                    <strong className="text-white">{selectedOrder.doctorName || 'Not specified'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Delivery Address</span>
                    <span className="text-slate-300 block truncate">{selectedOrder.deliveryAddress}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Contact Phone</span>
                    <span className="text-slate-300 font-mono">{selectedOrder.contactPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. PRESCRIPTION DOCUMENT PREVIEW & METADATA */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" /> Prescribed Document (PostgreSQL BYTEA Storage)
                </h4>
                {docBlobUrl && (
                  <div className="flex items-center gap-2">
                    <a
                      href={docBlobUrl}
                      download={selectedOrder.prescriptionFileName || `prescription-${selectedOrder.orderNumber}.pdf`}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                    <a
                      href={docBlobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-xs font-bold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
                    >
                      Open Full View <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {selectedOrder.prescriptionFileUrl ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 block">Filename</span>
                      <strong className="text-slate-200 truncate block">{selectedOrder.prescriptionFileName || 'prescription-doc'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Content Type</span>
                      <strong className="text-indigo-400 block">{selectedOrder.prescriptionContentType || 'Document'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">File Size</span>
                      <strong className="text-emerald-400 block">
                        {selectedOrder.prescriptionFileSize ? (selectedOrder.prescriptionFileSize / 1024).toFixed(1) + ' KB' : 'Stored in DB'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Upload Date</span>
                      <strong className="text-slate-300 block">
                        {selectedOrder.uploadDate ? new Date(selectedOrder.uploadDate).toLocaleDateString() : 'N/A'}
                      </strong>
                    </div>
                  </div>

                  {/* Document Byte Preview Box */}
                  <div className="bg-slate-900 rounded-xl border border-slate-800 p-2 min-h-48 flex items-center justify-center">
                    {loadingDoc ? (
                      <div className="flex flex-col items-center gap-2 text-slate-400 text-xs py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                        <span>Fetching binary data from PostgreSQL database...</span>
                      </div>
                    ) : docBlobUrl ? (
                      (selectedOrder.prescriptionContentType?.toLowerCase().includes('pdf') || selectedOrder.prescriptionFileName?.toLowerCase().endsWith('.pdf')) ? (
                        <object data={docBlobUrl} type="application/pdf" className="w-full h-96 rounded-lg border border-slate-800">
                          <iframe src={docBlobUrl} title="Prescription PDF" className="w-full h-96 rounded-lg border border-slate-800">
                            <div className="p-4 text-center text-xs text-slate-400">
                              PDF inline display unsupported by browser.{' '}
                              <a href={docBlobUrl} target="_blank" rel="noreferrer" className="text-indigo-400 underline font-bold">
                                Click here to open PDF document
                              </a>
                            </div>
                          </iframe>
                        </object>
                      ) : (
                        <img
                          src={docBlobUrl}
                          alt="Prescription Document"
                          className="max-h-96 max-w-full rounded-lg object-contain border border-slate-800 shadow-md"
                        />
                      )
                    ) : (
                      <span className="text-xs text-slate-500">Document preview unavailable</span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-900 p-3 rounded-xl border border-slate-800">
                  No prescription file uploaded for this order (OTC order).
                </p>
              )}
            </div>

            {/* 3. ORDER ITEMS & LIVE INVENTORY STOCK */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Prescribed Medicines ({selectedOrder.items?.length || 0})</span>
                <span className="text-[11px] text-slate-500 font-normal">Real Database Stock & Pricing</span>
              </h4>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white truncate">{item.medicineName}</p>
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {item.medicineCode}
                        </span>
                        {item.prescriptionRequired ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Rx</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">OTC</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {item.genericName} • Manufacturer: <strong className="text-slate-300">{item.manufacturer || 'Standard'}</strong>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Current DB Stock: <strong className={item.currentStock >= item.quantity ? 'text-emerald-400' : 'text-rose-400'}>{item.currentStock ?? 'In Stock'} units</strong>
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-slate-200">Qty: {item.quantity} × ₹{(item.unitPrice || 0).toFixed(2)}</span>
                      <p className="text-sm font-black text-emerald-400">₹{(item.subtotal || 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. PHARMACIST REVIEW & COMPLIANCE NOTES */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Pharmacist / Admin Review Notes & Compliance Audit Record
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter pharmacist notes regarding dosage verification, patient safety validation, or reason for order rejection..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {selectedOrder.verifiedBy && (
                <p className="text-[11px] text-indigo-400 italic">
                  Previously reviewed by: <strong>{selectedOrder.verifiedBy}</strong>
                </p>
              )}
            </div>

            {/* 5. ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => handleVerifyOrReject('REJECTED')}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Reject Prescription
              </button>
              <button
                onClick={() => handleVerifyOrReject('APPROVED')}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve & Verify Order
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
