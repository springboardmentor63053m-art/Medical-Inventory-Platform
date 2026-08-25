import React, { useState, useEffect, useRef } from 'react';
import { supplierCommunicationService } from '../../../services/api/supplierCommunicationService';
import { purchaseOrderService } from '../../../services/api/purchaseOrderService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  MessageSquare,
  X,
  Paperclip,
  Send,
  Building2,
  Phone,
  Mail,
  User,
  ShoppingBag,
  FileText,
  Lock,
  ExternalLink,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Info,
  MapPin,
  ShieldCheck
} from 'lucide-react';

export default function SupplierCommunicationDrawer({ isOpen, onClose, supplier, initialPO = null, onConversationUpdated }) {
  const { isAdmin, isPharmacist, isStaff, isSupplier } = useAuth();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Supplier info expanded view
  const [showSupplierDetails, setShowSupplierDetails] = useState(false);

  // Actions menu state
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Purchase Orders
  const [supplierPOs, setSupplierPOs] = useState([]);
  const [selectedPO, setSelectedPO] = useState(initialPO);

  // Message Form State
  const [messageContent, setMessageContent] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const actionsMenuRef = useRef(null);

  // Escape key & click outside actions menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (showActionsMenu) {
          setShowActionsMenu(false);
        } else {
          onClose();
        }
      }
    };
    const handleClickOutside = (e) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target)) {
        setShowActionsMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, showActionsMenu, onClose]);

  useEffect(() => {
    if (isOpen && supplier) {
      loadConversationAndMessages();
      loadSupplierPOs();
    }
  }, [isOpen, supplier]);

  // Background polling every 5s when open
  useEffect(() => {
    if (!isOpen || !conversation || !conversation.id) return;
    const interval = setInterval(() => {
      fetchMessagesSilently(conversation.id);
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen, conversation]);

  const loadConversationAndMessages = async () => {
    setLoading(true);
    try {
      let conv;
      if (isSupplier) {
        conv = await supplierCommunicationService.getMyConversation();
      } else {
        const identifier = supplier.id || supplier.supplierCode;
        conv = await supplierCommunicationService.getSupplierConversation(identifier);
      }
      setConversation(conv);

      if (conv && conv.id) {
        const msgs = await supplierCommunicationService.getMessages(conv.id);
        setMessages(msgs || []);
        scrollToBottom();
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Supplier conversation load:', err);
      setConversation(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSupplierPOs = async () => {
    try {
      const pos = await purchaseOrderService.getAllPurchaseOrders();
      const filtered = (pos || []).filter(
        po => (po.supplier && String(po.supplier.id) === String(supplier.id)) || String(po.supplierId) === String(supplier.id)
      );
      setSupplierPOs(filtered);
      if (initialPO) {
        setSelectedPO(initialPO);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessagesSilently = async (conversationId) => {
    try {
      const msgs = await supplierCommunicationService.getMessages(conversationId);
      setMessages(msgs || []);
    } catch (err) {
      // Silent catch
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageContent.trim() && !attachmentFile) return;

    setSending(true);
    try {
      const messageType = isInternalNote ? 'INTERNAL_NOTE' : 'SUPPLIER_MESSAGE';
      const poId = selectedPO ? selectedPO.id : null;
      const identifier = supplier.id || supplier.supplierCode;

      if (conversation && conversation.id) {
        await supplierCommunicationService.sendMessage(
          conversation.id,
          messageContent,
          messageType,
          poId,
          attachmentFile
        );
      } else {
        await supplierCommunicationService.sendMessageToSupplier(
          identifier,
          messageContent,
          messageType,
          poId,
          attachmentFile
        );
      }

      setMessageContent('');
      setAttachmentFile(null);
      setIsInternalNote(false);
      if (fileInputRef.current) fileInputRef.current.value = '';

      const updatedConv = await supplierCommunicationService.getSupplierConversation(identifier);
      setConversation(updatedConv);

      if (updatedConv && updatedConv.id) {
        const msgs = await supplierCommunicationService.getMessages(updatedConv.id);
        setMessages(msgs || []);
        scrollToBottom();
      }
      if (onConversationUpdated) onConversationUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!conversation || !conversation.id) return;
    try {
      const updated = await supplierCommunicationService.updateConversationStatus(conversation.id, newStatus);
      setConversation(updated);
      toast.success(`Status updated to ${newStatus}`);
      if (onConversationUpdated) onConversationUpdated();
    } catch (err) {
      toast.error('Failed to update conversation status');
    }
  };

  const handlePOStatusUpdate = async (poId, newStatus) => {
    try {
      await supplierCommunicationService.updatePOStatusFromChat(poId, newStatus);
      toast.success(`Purchase Order status updated to ${newStatus}`);
      if (conversation && conversation.id) {
        const msgs = await supplierCommunicationService.getMessages(conversation.id);
        setMessages(msgs || []);
      }
    } catch (err) {
      toast.error('Failed to update PO status');
    }
  };

  const handleSelectTemplate = (templateText, internal = false) => {
    const contactName = supplier?.contactPerson ? supplier.contactPerson.split(' ')[0] : 'Representative';
    const text = templateText.replace('{contact}', contactName);
    setMessageContent(text);
    if (internal) setIsInternalNote(true);
    setShowActionsMenu(false);
  };

  if (!isOpen || !supplier) return null;

  const supplierLocation = [supplier.city, supplier.state, supplier.country].filter(Boolean).join(', ');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end animate-in fade-in">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* RIGHT SLIDE-OVER DRAWER (550-650px wide) */}
      <div className="relative w-full sm:w-[620px] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-slate-800 transform transition-transform duration-300">
        
        {/* COMPACT HEADER */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800/50">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {supplier.supplierName}
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> {conversation?.status || 'ACTIVE'}
                  </span>
                </h2>
                <button
                  onClick={() => setShowSupplierDetails(!showSupplierDetails)}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition font-mono"
                >
                  <span>{supplier.supplierCode} • {supplier.contactPerson || 'N/A'} • {supplier.phone}</span>
                  {showSupplierDetails ? <ChevronUp className="w-3.5 h-3.5 text-blue-500" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(isAdmin || isPharmacist || isStaff) && conversation && conversation.id && (
                <select
                  value={conversation.status || 'ACTIVE'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="WAITING_FOR_SUPPLIER">WAITING</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              )}

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Close Drawer (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono px-0.5 flex items-center justify-between">
            <span>{supplier.email} • {supplierLocation || 'Official Supply Partner'}</span>
          </div>

          {/* EXPANDABLE SUPPLIER DETAILS SECTION */}
          {showSupplierDetails && (
            <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2 animate-in fade-in">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Official Address</span>
                  <span className="text-slate-800 dark:text-slate-200">{supplier.address || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Location</span>
                  <span className="text-slate-800 dark:text-slate-200">{supplierLocation || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COMPACT PURCHASE ORDER CONTEXT BAR */}
        <div className="px-3.5 py-2 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1">
            <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-bold text-slate-700 dark:text-slate-300 text-xs shrink-0">Purchase Order:</span>
            <select
              value={selectedPO ? selectedPO.id : ''}
              onChange={(e) => {
                const po = supplierPOs.find(p => String(p.id) === e.target.value);
                setSelectedPO(po || null);
              }}
              className="flex-1 max-w-xs px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="">-- No PO linked --</option>
              {supplierPOs.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.orderNumber} (₹{po.totalAmount}) - {po.status}
                </option>
              ))}
            </select>
          </div>

          {selectedPO && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-medium hidden sm:inline">
                ₹{(selectedPO.totalAmount || 0).toLocaleString()} • {selectedPO.status}
              </span>
            </div>
          )}
        </div>

        {/* MESSAGES CHAT STREAM */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40 dark:bg-slate-950/20">
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <span>Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-full text-blue-600 dark:text-blue-400">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No conversation yet</h3>
              <p className="text-slate-400 max-w-xs text-[11px]">Start a conversation with {supplier.supplierName} to discuss purchase orders, stock availability, or pricing.</p>
              
              <div className="pt-2 flex flex-wrap justify-center gap-1.5 max-w-sm">
                <button
                  onClick={() => handleSelectTemplate('Hello {contact}, could you please confirm current availability for the requested medicines?')}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-blue-50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition"
                >
                  Ask Product Availability
                </button>
                <button
                  onClick={() => handleSelectTemplate('Hello {contact}, please provide your latest price quotation for our upcoming order.')}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-blue-50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition"
                >
                  Request Price Quotation
                </button>
                <button
                  onClick={() => handleSelectTemplate('Hello {contact}, could you please provide an updated delivery status for our shipment?')}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-blue-50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition"
                >
                  Delivery Update
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isSystem = msg.messageType === 'SYSTEM_EVENT';
              const isInternal = msg.messageType === 'INTERNAL_NOTE';
              const isMe = msg.senderRole === (isSupplier ? 'SUPPLIER' : 'ADMIN') || msg.senderRole === 'PHARMACIST' || msg.senderRole === 'STAFF';

              if (isSystem) {
                return (
                  <div key={msg.id} className="my-2 p-2.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl text-center text-xs text-purple-800 dark:text-purple-300 font-medium">
                    <span className="font-bold">⚡ SYSTEM EVENT:</span> {msg.content}
                    <span className="block text-[10px] text-purple-600/70 dark:text-purple-400/60 mt-0.5">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                );
              }

              if (isInternal) {
                return (
                  <div key={msg.id} className="my-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/70 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-[11px] text-amber-800 dark:text-amber-300 border-b border-amber-200 dark:border-amber-800/50 pb-1">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-600" /> INTERNAL ADMIN NOTE (Hidden from Supplier)
                      </span>
                      <span className="font-mono text-[10px]">{msg.senderName}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span className="block text-right text-[10px] text-amber-700/60 dark:text-amber-400/60">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{msg.senderName}</span>
                    <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-slate-800 rounded font-mono">{msg.senderRole}</span>
                    <span>• {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-2 shadow-2xs ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-none'
                    }`}
                  >
                    {/* Attached Purchase Order Card */}
                    {msg.purchaseOrderNumber && (
                      <div className={`p-2 rounded-xl border text-[11px] space-y-1 ${
                        isMe ? 'bg-blue-700/80 border-blue-500/50 text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                      }`}>
                        <div className="flex items-center justify-between font-bold">
                          <span>PO #: {msg.purchaseOrderNumber}</span>
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono text-[10px]">
                            {msg.purchaseOrderStatus}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span>Amount: ₹{(msg.purchaseOrderTotal || 0).toLocaleString()}</span>
                          {(isAdmin || isPharmacist || isSupplier) && (
                            <button
                              onClick={() => handlePOStatusUpdate(msg.purchaseOrderId, 'DISPATCHED')}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded transition"
                            >
                              Mark Dispatched
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* File Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="pt-2 border-t border-white/20 space-y-1">
                        {msg.attachments.map((att) => (
                          <a
                            key={att.id}
                            href={att.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 rounded-xl flex items-center justify-between text-[11px] font-mono transition"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <FileText className="w-3.5 h-3.5" /> {att.fileName}
                            </span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* STICKY MODERN COMPOSER */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          {attachmentFile && (
            <div className="flex items-center justify-between px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-mono">
              <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                <Paperclip className="w-3.5 h-3.5" /> Attached: {attachmentFile.name}
              </span>
              <button type="button" onClick={() => setAttachmentFile(null)}><X className="w-3.5 h-3.5 text-rose-500" /></button>
            </div>
          )}

          {isInternalNote && (
            <div className="flex items-center justify-between px-3 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Mode: Internal Admin Note (Hidden from Supplier)
              </span>
              <button type="button" onClick={() => setIsInternalNote(false)}><X className="w-3.5 h-3.5 text-amber-700" /></button>
            </div>
          )}

          <div className="flex items-end gap-2 relative">
            {/* ACTIONS POPUP MENU BUTTON */}
            <div className="relative" ref={actionsMenuRef}>
              <button
                type="button"
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition flex items-center gap-1 text-xs font-bold"
                title="Procurement Actions"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Actions</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* DROPDOWN MENU */}
              {showActionsMenu && (
                <div className="absolute bottom-11 left-0 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-30 space-y-1 animate-in fade-in">
                  <div className="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    Procurement Templates
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectTemplate('Hello {contact}, could you please confirm current product availability for our requested order?')}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition font-medium"
                  >
                    • Ask product availability
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTemplate('Hello {contact}, please provide your latest price quotation for the requested medicines.')}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition font-medium"
                  >
                    • Request price quotation
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTemplate('Hello {contact}, please confirm the expected delivery arrival date for our purchase order.')}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition font-medium"
                  >
                    • Confirm delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTemplate('Hello {contact}, please upload the official tax invoice and delivery note for our records.')}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition font-medium"
                  >
                    • Request invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTemplate('Reporting quantity shortage / damaged shipment received in our latest order. Please inspect.')}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition font-medium"
                  >
                    • Report shortage / damage
                  </button>
                  
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <button
                      type="button"
                      onClick={() => { fileInputRef.current?.click(); setShowActionsMenu(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition font-medium flex items-center gap-1.5"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-blue-500" /> Attach File / PDF
                    </button>
                    {(isAdmin || isPharmacist || isStaff) && (
                      <button
                        type="button"
                        onClick={() => { setIsInternalNote(!isInternalNote); setShowActionsMenu(false); }}
                        className="w-full text-left px-3 py-1.5 text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition font-medium flex items-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-500" /> Toggle Internal Admin Note
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setAttachmentFile(e.target.files[0])}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
              title="Attach File"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <textarea
              rows={1}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isInternalNote ? "Type internal note (Press Shift+Enter for newline)..." : "Type message (Press Enter to send)..."}
              className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32"
            />

            <button
              type="submit"
              disabled={sending || (!messageContent.trim() && !attachmentFile)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
