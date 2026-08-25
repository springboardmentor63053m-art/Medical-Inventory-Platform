import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supplierCommunicationService } from '../../../services/api/supplierCommunicationService';
import { supplierService } from '../../../services/api/supplierService';
import { purchaseOrderService } from '../../../services/api/purchaseOrderService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  MessageSquare,
  Search,
  Paperclip,
  Send,
  Truck,
  Building2,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Lock,
  ChevronRight,
  User,
  ShoppingBag,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  X,
  FileCheck,
  ShieldAlert,
  Info,
  Filter,
  CheckSquare,
  Archive
} from 'lucide-react';

export default function SupplierCommunicationPage() {
  const { isAdmin, isPharmacist, isStaff, isSupplier } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const poIdParam = searchParams.get('poId');
  const supplierIdParam = searchParams.get('supplierId');

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Search & Status Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL | UNREAD | ACTIVE | WAITING_FOR_SUPPLIER | RESOLVED | ARCHIVED

  // Message Form State
  const [messageContent, setMessageContent] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [sending, setSending] = useState(false);

  // New Conversation Modal State
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [allPurchaseOrders, setAllPurchaseOrders] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState('');
  const [initialMessageText, setInitialMessageText] = useState('');
  const [creatingConv, setCreatingConv] = useState(false);

  // PO Linking Modal State
  const [poModalOpen, setPoModalOpen] = useState(false);

  const [detailsPanelOpen, setDetailsPanelOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, [filterType]);

  // Poll for messages every 5 seconds
  useEffect(() => {
    if (!activeConversation) return;
    const interval = setInterval(() => {
      fetchMessagesSilently(activeConversation.id);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeConversation]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      if (isSupplier) {
        const myConv = await supplierCommunicationService.getMyConversation();
        setConversations(myConv ? [myConv] : []);
        if (myConv) {
          setActiveConversation(myConv);
          fetchMessages(myConv.id);
        }
      } else {
        const list = await supplierCommunicationService.getAllConversations(searchQuery, filterType);
        setConversations(list || []);

        if (poIdParam) {
          const convByPo = await supplierCommunicationService.getConversationByPO(poIdParam);
          if (convByPo) {
            setActiveConversation(convByPo);
            fetchMessages(convByPo.id);
          }
        } else if (supplierIdParam) {
          const convBySupp = (list || []).find(c => String(c.supplierId) === String(supplierIdParam));
          if (convBySupp) {
            setActiveConversation(convBySupp);
            fetchMessages(convBySupp.id);
          } else if (list && list.length > 0) {
            setActiveConversation(list[0]);
            fetchMessages(list[0].id);
          }
        } else if (list && list.length > 0 && !activeConversation) {
          setActiveConversation(list[0]);
          fetchMessages(list[0].id);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Unable to load supplier conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    setLoadingMessages(true);
    try {
      const msgs = await supplierCommunicationService.getMessages(conversationId);
      setMessages(msgs || []);
      scrollToBottom();
    } catch (err) {
      toast.error('Unable to load conversation messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchMessagesSilently = async (conversationId) => {
    try {
      const msgs = await supplierCommunicationService.getMessages(conversationId);
      setMessages(msgs || []);
    } catch (err) {
      // Silent error handling for background polling
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    fetchMessages(conv.id);
  };

  const openNewConversationModal = async () => {
    setNewModalOpen(true);
    try {
      const suppliersRes = await supplierService.getAllSuppliers();
      setAllSuppliers(suppliersRes || []);
      const posRes = await purchaseOrderService.getAllPurchaseOrders();
      setAllPurchaseOrders(posRes || []);
    } catch (err) {
      toast.error('Failed to load supplier list');
    }
  };

  const handleCreateNewConversation = async (e) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      toast.warning('Please select a supplier');
      return;
    }

    setCreatingConv(true);
    try {
      const conv = await supplierCommunicationService.startConversation(
        Number(selectedSupplierId),
        selectedPurchaseOrderId ? Number(selectedPurchaseOrderId) : null,
        initialMessageText
      );

      toast.success('Conversation started successfully');
      setNewModalOpen(false);
      setSelectedSupplierId('');
      setSelectedPurchaseOrderId('');
      setInitialMessageText('');

      await fetchConversations();
      setActiveConversation(conv);
      fetchMessages(conv.id);
    } catch (err) {
      toast.error('Failed to start conversation');
    } finally {
      setCreatingConv(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageContent.trim() && !attachmentFile) return;
    if (!activeConversation) return;

    setSending(true);
    try {
      const messageType = isInternalNote ? 'INTERNAL_NOTE' : 'SUPPLIER_MESSAGE';
      const poId = selectedPO ? selectedPO.id : (poIdParam ? Number(poIdParam) : null);

      await supplierCommunicationService.sendMessage(
        activeConversation.id,
        messageContent,
        messageType,
        poId,
        attachmentFile
      );

      setMessageContent('');
      setAttachmentFile(null);
      setSelectedPO(null);
      setIsInternalNote(false);
      if (fileInputRef.current) fileInputRef.current.value = '';

      fetchMessages(activeConversation.id);
      fetchConversations();
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
    if (!activeConversation) return;
    try {
      const updated = await supplierCommunicationService.updateConversationStatus(activeConversation.id, newStatus);
      setActiveConversation(updated);
      toast.success(`Conversation marked as ${newStatus}`);
      fetchConversations();
    } catch (err) {
      toast.error('Failed to update conversation status');
    }
  };

  const handleQuickAction = (templateText) => {
    setMessageContent(templateText);
  };

  const handlePOStatusUpdateFromChat = async (poId, newStatus) => {
    try {
      await supplierCommunicationService.updatePOStatusFromChat(poId, newStatus);
      toast.success(`Purchase Order status updated to ${newStatus}`);
      if (activeConversation) {
        fetchMessages(activeConversation.id);
      }
    } catch (err) {
      toast.error('Failed to update Purchase Order status');
    }
  };

  const quickActions = [
    { label: 'Ask Availability', text: 'Please confirm current availability for medicine stock and expected dispatch date.' },
    { label: 'Ask Price Quotation', text: 'Please provide official price quotation and lead time for upcoming purchase order.' },
    { label: 'Confirm Delivery', text: 'Please confirm expected delivery arrival date for current shipment.' },
    { label: 'Request Invoice', text: 'Please upload final tax invoice and dispatch note for our records.' },
    { label: 'Report Shortage/Damage', text: 'Reporting quantity shortage / damaged items received in latest delivery. Please inspect.' },
  ];

  const filteredConversations = conversations.filter(c => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.supplierName?.toLowerCase().includes(q);
      const matchCode = c.supplierCode?.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    if (filterType === 'UNREAD') return c.unreadCount > 0;
    if (filterType === 'ACTIVE') return c.status === 'ACTIVE';
    if (filterType === 'WAITING_FOR_SUPPLIER') return c.status === 'WAITING_FOR_SUPPLIER';
    if (filterType === 'RESOLVED') return c.status === 'RESOLVED';
    if (filterType === 'ARCHIVED') return c.status === 'ARCHIVED';
    return true;
  });

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col max-w-7xl mx-auto p-4 md:p-6 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Supplier Communication Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Direct procurement messaging, delivery confirmations, purchase order discussions, and audit logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(isAdmin || isPharmacist || isStaff) && (
            <button
              onClick={openNewConversationModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> + New Conversation
            </button>
          )}
          <button
            onClick={() => fetchConversations()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* MAIN 3-COLUMN LAYOUT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* LEFT COLUMN: CONVERSATIONS LIST (3 Cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0 overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search supplier..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto text-[11px] pb-1">
              {['ALL', 'UNREAD', 'ACTIVE', 'RESOLVED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-2.5 py-1 font-bold rounded-lg transition whitespace-nowrap ${
                    filterType === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {f === 'ALL' ? 'All' : f === 'UNREAD' ? 'Unread' : f === 'ACTIVE' ? 'Active' : 'Resolved'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading supplier conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                <span>No supplier conversations found.</span>
                {(isAdmin || isPharmacist || isStaff) && (
                  <button
                    onClick={openNewConversationModal}
                    className="mt-1 text-blue-600 dark:text-blue-400 font-bold underline hover:text-blue-700"
                  >
                    Start + New Conversation
                  </button>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConversation && activeConversation.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left p-3.5 transition flex flex-col gap-1 ${
                      isActive
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-blue-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {conv.supplierName}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{conv.supplierCode}</span>
                      <span>{conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {conv.lastMessageContent}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* CENTER COLUMN: CHAT STREAM & COMPOSER (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-0 overflow-hidden">
          {activeConversation ? (
            <>
              {/* CHAT HEADER */}
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {activeConversation.supplierName}
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> {activeConversation.status || 'ACTIVE'}
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Contact: {activeConversation.contactPerson || 'N/A'} • {activeConversation.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {(isAdmin || isPharmacist || isStaff) && (
                    <select
                      value={activeConversation.status || 'ACTIVE'}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="WAITING_FOR_SUPPLIER">WAITING FOR SUPPLIER</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  )}
                  <button
                    onClick={() => setDetailsPanelOpen(!detailsPanelOpen)}
                    className="lg:hidden p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* QUICK ACTION TEMPLATE CHIPS */}
              <div className="p-2 bg-slate-100/70 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-slate-400 font-bold px-1 uppercase tracking-wider text-[10px]">Quick Template:</span>
                {quickActions.map((qa, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(qa.text)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg whitespace-nowrap font-medium transition"
                  >
                    {qa.label}
                  </button>
                ))}
              </div>

              {/* CHAT MESSAGES STREAM */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/40 dark:bg-slate-950/20">
                {loadingMessages ? (
                  <div className="py-12 text-center text-xs text-slate-400">Loading chat messages...</div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">No messages in this conversation yet. Send a message to start procurement communication.</div>
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
                          className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-2 shadow-xs ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-none'
                          }`}
                        >
                          {/* Attached Purchase Order Card */}
                          {msg.purchaseOrderNumber && (
                            <div className={`p-2.5 rounded-xl border text-[11px] space-y-1.5 ${
                              isMe ? 'bg-blue-700/80 border-blue-500/50 text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                            }`}>
                              <div className="flex items-center justify-between font-bold">
                                <span>PO #: {msg.purchaseOrderNumber}</span>
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono text-[10px]">
                                  {msg.purchaseOrderStatus}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px]">
                                <span>Total Amount: ₹{(msg.purchaseOrderTotal || 0).toFixed(2)}</span>
                                {(isAdmin || isPharmacist || isSupplier) && (
                                  <button
                                    onClick={() => handlePOStatusUpdateFromChat(msg.purchaseOrderId, 'DISPATCHED')}
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

              {/* MESSAGE COMPOSER */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  {(isAdmin || isPharmacist || isStaff) && (
                    <label className="flex items-center gap-1.5 cursor-pointer text-amber-700 dark:text-amber-400 font-bold text-[11px]">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <Lock className="w-3.5 h-3.5" /> Internal Admin Note
                    </label>
                  )}

                  {attachmentFile && (
                    <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full font-mono text-[10px] flex items-center gap-1">
                      <Paperclip className="w-3 h-3" /> {attachmentFile.name}
                      <button type="button" onClick={() => setAttachmentFile(null)}><X className="w-3 h-3 text-rose-500" /></button>
                    </span>
                  )}
                </div>

                <div className="flex items-end gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setAttachmentFile(e.target.files[0])}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    title="Attach file/document"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <textarea
                    rows={1}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isInternalNote ? "Type internal admin note (Press Shift+Enter for newline)..." : "Type procurement message (Press Enter to send)..."}
                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32"
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
            </>
          ) : (
            <div className="py-24 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Select a supplier conversation</h3>
              <p className="text-slate-400 max-w-sm">Choose a supplier from the left panel or click "+ New Conversation" to start messaging.</p>
              {(isAdmin || isPharmacist || isStaff) && (
                <button
                  onClick={openNewConversationModal}
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-sm hover:bg-blue-700 transition"
                >
                  + Start New Conversation
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SUPPLIER & PO CONTEXT DETAILS PANEL (3 Cols) */}
        {detailsPanelOpen && activeConversation && (
          <div className="lg:col-span-3 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-4 overflow-y-auto">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" /> Supplier Profile
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white text-sm block">{activeConversation.supplierName}</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono text-[11px] block">{activeConversation.supplierCode}</span>
              </div>

              <div className="space-y-1.5 pt-1 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contact: <strong>{activeConversation.contactPerson || 'N/A'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{activeConversation.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-[11px] truncate">{activeConversation.email}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions for Supplier */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h4>
              <button
                onClick={() => navigate('/suppliers')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <Truck className="w-3.5 h-3.5" /> View Supplier Master
              </button>
              <button
                onClick={() => navigate('/purchase-orders')}
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> View Purchase Orders
              </button>
            </div>
          </div>
        )}
      </div>

      {/* START NEW CONVERSATION MODAL */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-blue-500" /> Start Supplier Conversation
              </h3>
              <button onClick={() => setNewModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewConversation} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Supplier Vendor <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Choose Supplier from Database --</option>
                  {allSuppliers.map((supp) => (
                    <option key={supp.id} value={supp.id}>
                      {supp.supplierName} ({supp.supplierCode}) - {supp.contactPerson || supp.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Link Optional Purchase Order
                </label>
                <select
                  value={selectedPurchaseOrderId}
                  onChange={(e) => setSelectedPurchaseOrderId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Unassigned (General Conversation) --</option>
                  {allPurchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.orderNumber} (₹{po.totalAmount}) - {po.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Procurement Message
                </label>
                <textarea
                  rows={3}
                  value={initialMessageText}
                  onChange={(e) => setInitialMessageText(e.target.value)}
                  placeholder="e.g. Please confirm delivery date and item availability..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingConv}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
                >
                  Start Conversation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
