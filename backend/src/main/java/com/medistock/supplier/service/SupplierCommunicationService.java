package com.medistock.supplier.service;

import com.medistock.supplier.dto.CreateSupplierMessageRequest;
import com.medistock.supplier.dto.SupplierConversationResponse;
import com.medistock.supplier.dto.SupplierMessageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SupplierCommunicationService {
    List<SupplierConversationResponse> getAllConversationsForAdmin(String search, String filter);
    SupplierConversationResponse getConversationForSupplierUser(String userEmail);
    SupplierConversationResponse getOrCreateConversation(Long supplierId);
    SupplierConversationResponse getConversationBySupplierIdentifier(String supplierIdentifier, boolean createIfAbsent);
    SupplierConversationResponse startNewConversation(Long supplierId, Long purchaseOrderId, String initialMessage, String userEmail);
    SupplierConversationResponse updateConversationStatus(Long conversationId, String status);
    SupplierConversationResponse getConversationByPOId(Long purchaseOrderId);
    List<SupplierMessageResponse> getMessages(Long conversationId, String userEmail);
    List<SupplierMessageResponse> getMessagesBySupplierIdentifier(String supplierIdentifier, String userEmail);
    SupplierMessageResponse sendMessage(Long conversationId, CreateSupplierMessageRequest request, MultipartFile attachment, String userEmail);
    SupplierMessageResponse sendMessageBySupplierIdentifier(String supplierIdentifier, CreateSupplierMessageRequest request, MultipartFile attachment, String userEmail);
    void markAsRead(Long conversationId, String userEmail);
    SupplierMessageResponse updatePOStatusFromChat(Long purchaseOrderId, String newStatus, String note, String userEmail);
    void logPurchaseOrderStatusChangeEvent(com.medistock.purchase.entity.PurchaseOrder po, String oldStatus, String newStatus, String note, String userEmail);
    long getUnreadCount(String userEmail);
}
