package com.medistock.supplier.repository;

import com.medistock.supplier.entity.SupplierMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierMessageRepository extends JpaRepository<SupplierMessage, Long> {
    List<SupplierMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
    List<SupplierMessage> findByConversationIdAndMessageTypeNotOrderByCreatedAtAsc(Long conversationId, String excludedMessageType);
    
    long countByConversationIdAndIsReadByAdminFalse(Long conversationId);
    long countByConversationIdAndIsReadBySupplierFalse(Long conversationId);

    long countByIsReadByAdminFalse();
    long countByConversation_Supplier_EmailAndIsReadBySupplierFalse(String supplierEmail);

    List<SupplierMessage> findByPurchaseOrderIdOrderByCreatedAtAsc(Long purchaseOrderId);
}
