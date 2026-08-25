package com.medistock.supplier.service.impl;

import com.medistock.common.exception.ResourceNotFoundException;
import com.medistock.purchase.entity.PurchaseOrder;
import com.medistock.purchase.repository.PurchaseOrderRepository;
import com.medistock.supplier.dto.*;
import com.medistock.supplier.entity.*;
import com.medistock.supplier.repository.*;
import com.medistock.supplier.service.SupplierCommunicationService;
import com.medistock.user.entity.User;
import com.medistock.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierCommunicationServiceImpl implements SupplierCommunicationService {

    private final SupplierConversationRepository conversationRepository;
    private final SupplierMessageRepository messageRepository;
    private final SupplierMessageAttachmentRepository attachmentRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/supplier-attachments/";

    private String getUserPrimaryRole(User user) {
        if (user == null || user.getRoles() == null || user.getRoles().isEmpty()) {
            return "USER";
        }
        return user.getRoles().iterator().next().getName().replace("ROLE_", "").toUpperCase();
    }

    private Supplier findSupplierByIdOrCode(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new ResourceNotFoundException("Supplier identifier is required");
        }
        String idStr = identifier.trim();

        // 1. Try numeric primary key
        try {
            Long numericId = Long.parseLong(idStr);
            Optional<Supplier> byId = supplierRepository.findById(numericId);
            if (byId.isPresent()) {
                return byId.get();
            }
        } catch (NumberFormatException ignored) {
        }

        // 2. Try supplierCode (e.g. SUP-112, SUP-129)
        Optional<Supplier> byCode = supplierRepository.findBySupplierCode(idStr);
        if (byCode.isPresent()) {
            return byCode.get();
        }

        // 3. Try email
        return supplierRepository.findByEmailIgnoreCase(idStr)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with identifier: " + idStr));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierConversationResponse> getAllConversationsForAdmin(String search, String filter) {
        List<SupplierConversation> conversations = conversationRepository.findAllByOrderByLastMessageAtDesc();

        return conversations.stream()
                .filter(conv -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String q = search.trim().toLowerCase();
                    String name = conv.getSupplier().getSupplierName().toLowerCase();
                    String code = conv.getSupplier().getSupplierCode().toLowerCase();
                    return name.contains(q) || code.contains(q);
                })
                .map(conv -> mapToConversationResponse(conv, "ADMIN"))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SupplierConversationResponse getConversationForSupplierUser(String userEmail) {
        Supplier supplier = supplierRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier account not found for email: " + userEmail));
        SupplierConversation conv = getOrCreateConversationEntity(supplier.getId());
        return mapToConversationResponse(conv, "SUPPLIER");
    }

    @Override
    @Transactional
    public SupplierConversationResponse getOrCreateConversation(Long supplierId) {
        SupplierConversation conv = getOrCreateConversationEntity(supplierId);
        return mapToConversationResponse(conv, "ADMIN");
    }

    @Override
    @Transactional
    public SupplierConversationResponse getConversationBySupplierIdentifier(String supplierIdentifier, boolean createIfAbsent) {
        Supplier supplier = findSupplierByIdOrCode(supplierIdentifier);
        Optional<SupplierConversation> existing = conversationRepository.findBySupplierId(supplier.getId());

        if (existing.isPresent()) {
            return mapToConversationResponse(existing.get(), "ADMIN");
        }

        if (!createIfAbsent) {
            // Read-only opening: return 200 OK response with null id without polluting DB
            return SupplierConversationResponse.builder()
                    .id(null)
                    .supplierId(supplier.getId())
                    .supplierCode(supplier.getSupplierCode())
                    .supplierName(supplier.getSupplierName())
                    .contactPerson(supplier.getContactPerson())
                    .phone(supplier.getPhone())
                    .email(supplier.getEmail())
                    .status("ACTIVE")
                    .lastMessageAt(null)
                    .lastMessageContent(null)
                    .unreadCount(0)
                    .activeOrdersCount(0)
                    .build();
        }

        SupplierConversation created = getOrCreateConversationEntity(supplier.getId());
        return mapToConversationResponse(created, "ADMIN");
    }

    @Override
    @Transactional
    public SupplierConversationResponse startNewConversation(Long supplierId, Long purchaseOrderId, String initialMessage, String userEmail) {
        SupplierConversation conv = getOrCreateConversationEntity(supplierId);
        conv.setStatus("ACTIVE");
        conv.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conv);

        if (initialMessage != null && !initialMessage.trim().isEmpty()) {
            CreateSupplierMessageRequest req = new CreateSupplierMessageRequest(initialMessage.trim(), "SUPPLIER_MESSAGE", purchaseOrderId);
            sendMessage(conv.getId(), req, null, userEmail);
        }

        return mapToConversationResponse(conv, "ADMIN");
    }

    @Override
    @Transactional
    public SupplierConversationResponse updateConversationStatus(Long conversationId, String status) {
        SupplierConversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));

        String newStatus = (status != null && !status.trim().isEmpty()) ? status.trim().toUpperCase() : "ACTIVE";
        conv.setStatus(newStatus);
        SupplierConversation updated = conversationRepository.save(conv);
        log.info("Updated conversation {} status to {}", conversationId, newStatus);

        return mapToConversationResponse(updated, "ADMIN");
    }

    @Override
    @Transactional
    public SupplierConversationResponse getConversationByPOId(Long purchaseOrderId) {
        PurchaseOrder po = purchaseOrderRepository.findById(purchaseOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with id: " + purchaseOrderId));
        SupplierConversation conv = getOrCreateConversationEntity(po.getSupplier().getId());
        return mapToConversationResponse(conv, "ADMIN");
    }

    @Override
    @Transactional
    public List<SupplierMessageResponse> getMessages(Long conversationId, String userEmail) {
        SupplierConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));

        User user = userRepository.findByEmail(userEmail).orElse(null);
        String roleName = getUserPrimaryRole(user);
        boolean isSupplierUser = "SUPPLIER".equalsIgnoreCase(roleName);

        if (isSupplierUser) {
            Supplier supplier = supplierRepository.findByEmailIgnoreCase(userEmail).orElse(null);
            if (supplier == null || !conversation.getSupplier().getId().equals(supplier.getId())) {
                throw new AccessDeniedException("Access denied to conversation of another supplier");
            }
        }

        markAsRead(conversationId, userEmail);

        List<SupplierMessage> messages;
        if (isSupplierUser) {
            messages = messageRepository.findByConversationIdAndMessageTypeNotOrderByCreatedAtAsc(conversationId, "INTERNAL_NOTE");
        } else {
            messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        }

        return messages.stream().map(this::mapToMessageResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<SupplierMessageResponse> getMessagesBySupplierIdentifier(String supplierIdentifier, String userEmail) {
        Supplier supplier = findSupplierByIdOrCode(supplierIdentifier);
        Optional<SupplierConversation> existing = conversationRepository.findBySupplierId(supplier.getId());

        if (existing.isEmpty()) {
            return Collections.emptyList();
        }

        return getMessages(existing.get().getId(), userEmail);
    }

    @Override
    @Transactional
    public SupplierMessageResponse sendMessage(Long conversationId, CreateSupplierMessageRequest request, MultipartFile attachment, String userEmail) {
        SupplierConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));

        User sender = userRepository.findByEmail(userEmail).orElse(null);
        String senderRole = getUserPrimaryRole(sender);
        String senderName = sender != null ? (sender.getFirstName() + " " + (sender.getLastName() != null ? sender.getLastName() : "")).trim() : "System Admin";

        boolean isSupplierUser = "SUPPLIER".equalsIgnoreCase(senderRole);

        if (isSupplierUser) {
            Supplier supplier = supplierRepository.findByEmailIgnoreCase(userEmail).orElse(null);
            if (supplier == null || !conversation.getSupplier().getId().equals(supplier.getId())) {
                throw new AccessDeniedException("Access denied: Cannot send message to another supplier's conversation");
            }
            if ("INTERNAL_NOTE".equalsIgnoreCase(request.getMessageType())) {
                throw new AccessDeniedException("Suppliers cannot create internal admin notes");
            }
        }

        PurchaseOrder po = null;
        if (request.getPurchaseOrderId() != null) {
            po = purchaseOrderRepository.findById(request.getPurchaseOrderId()).orElse(null);
        }

        String type = (request.getMessageType() != null && !request.getMessageType().trim().isEmpty())
                ? request.getMessageType().toUpperCase()
                : "SUPPLIER_MESSAGE";

        SupplierMessage message = SupplierMessage.builder()
                .conversation(conversation)
                .senderUser(sender)
                .senderName(senderName)
                .senderRole(senderRole)
                .messageType(type)
                .content(request.getContent().trim())
                .purchaseOrder(po)
                .isReadByAdmin(!isSupplierUser)
                .isReadBySupplier(isSupplierUser)
                .build();

        SupplierMessage savedMessage = messageRepository.save(message);

        if (attachment != null && !attachment.isEmpty()) {
            SupplierMessageAttachment att = saveAttachmentFile(savedMessage, attachment);
            savedMessage.getAttachments().add(att);
        }

        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        log.info("Sent message (id {}) in conversation {} by {}", savedMessage.getId(), conversationId, userEmail);

        return mapToMessageResponse(savedMessage);
    }

    @Override
    @Transactional
    public SupplierMessageResponse sendMessageBySupplierIdentifier(String supplierIdentifier, CreateSupplierMessageRequest request, MultipartFile attachment, String userEmail) {
        Supplier supplier = findSupplierByIdOrCode(supplierIdentifier);
        SupplierConversation conversation = getOrCreateConversationEntity(supplier.getId());
        return sendMessage(conversation.getId(), request, attachment, userEmail);
    }

    @Override
    @Transactional
    public void markAsRead(Long conversationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElse(null);
        String roleName = getUserPrimaryRole(user);
        boolean isSupplierUser = "SUPPLIER".equalsIgnoreCase(roleName);

        List<SupplierMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        for (SupplierMessage m : messages) {
            if (isSupplierUser) {
                m.setIsReadBySupplier(true);
            } else {
                m.setIsReadByAdmin(true);
            }
        }
        messageRepository.saveAll(messages);
    }

    @Override
    @Transactional
    public SupplierMessageResponse updatePOStatusFromChat(Long purchaseOrderId, String newStatus, String note, String userEmail) {
        PurchaseOrder po = purchaseOrderRepository.findById(purchaseOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with id: " + purchaseOrderId));

        User user = userRepository.findByEmail(userEmail).orElse(null);
        String senderRole = getUserPrimaryRole(user);
        String senderName = user != null ? (user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "")).trim() : "System Admin";

        String oldStatus = po.getStatus();
        String validStatus = newStatus.toUpperCase();
        po.setStatus(validStatus);
        po.setStatusUpdatedBy(senderName);
        po.setStatusUpdatedAt(LocalDateTime.now());
        purchaseOrderRepository.save(po);

        SupplierConversation conversation = getOrCreateConversationEntity(po.getSupplier().getId());

        String eventText = String.format("Purchase Order %s status updated from %s to %s.%s",
                po.getOrderNumber(), oldStatus, validStatus,
                (note != null && !note.trim().isEmpty()) ? " Note: " + note.trim() : "");

        SupplierMessage systemMessage = SupplierMessage.builder()
                .conversation(conversation)
                .senderUser(user)
                .senderName(senderName)
                .senderRole(senderRole)
                .messageType("SYSTEM_EVENT")
                .content(eventText)
                .purchaseOrder(po)
                .isReadByAdmin(true)
                .isReadBySupplier(true)
                .build();

        SupplierMessage savedEvent = messageRepository.save(systemMessage);
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        log.info("PO {} status updated to {} via chat by {}", po.getOrderNumber(), validStatus, userEmail);

        return mapToMessageResponse(savedEvent);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElse(null);
        String roleName = getUserPrimaryRole(user);
        boolean isSupplierUser = "SUPPLIER".equalsIgnoreCase(roleName);

        if (isSupplierUser) {
            return messageRepository.countByConversation_Supplier_EmailAndIsReadBySupplierFalse(userEmail);
        } else {
            return messageRepository.countByIsReadByAdminFalse();
        }
    }

    private SupplierConversation getOrCreateConversationEntity(Long supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));

        return conversationRepository.findBySupplierId(supplierId)
                .orElseGet(() -> {
                    SupplierConversation newConv = SupplierConversation.builder()
                            .supplier(supplier)
                            .status("ACTIVE")
                            .lastMessageAt(LocalDateTime.now())
                            .build();
                    return conversationRepository.save(newConv);
                });
    }

    private SupplierMessageAttachment saveAttachmentFile(SupplierMessage message, MultipartFile file) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment";
            String cleanName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
            String fileName = System.currentTimeMillis() + "_" + cleanName;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            SupplierMessageAttachment attachment = SupplierMessageAttachment.builder()
                    .message(message)
                    .fileName(originalName)
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .fileUrl("/uploads/supplier-attachments/" + fileName)
                    .build();

            return attachmentRepository.save(attachment);
        } catch (IOException e) {
            log.error("Failed to save attachment file", e);
            throw new RuntimeException("Could not store file attachment: " + e.getMessage());
        }
    }

    private SupplierConversationResponse mapToConversationResponse(SupplierConversation conv, String userRole) {
        List<SupplierMessage> messages = conv.getMessages();
        SupplierMessage lastMsg = messages.isEmpty() ? null : messages.get(messages.size() - 1);

        long unread;
        if ("SUPPLIER".equalsIgnoreCase(userRole)) {
            unread = messageRepository.countByConversationIdAndIsReadBySupplierFalse(conv.getId());
        } else {
            unread = messageRepository.countByConversationIdAndIsReadByAdminFalse(conv.getId());
        }

        List<PurchaseOrder> pos = purchaseOrderRepository.findAll().stream()
                .filter(po -> po.getSupplier() != null && po.getSupplier().getId().equals(conv.getSupplier().getId()))
                .collect(Collectors.toList());

        long activeOrders = pos.stream().filter(po -> !"DELIVERED".equalsIgnoreCase(po.getStatus()) && !"CANCELLED".equalsIgnoreCase(po.getStatus())).count();
        String lastOrderNum = pos.isEmpty() ? null : pos.get(pos.size() - 1).getOrderNumber();

        return SupplierConversationResponse.builder()
                .id(conv.getId())
                .supplierId(conv.getSupplier().getId())
                .supplierCode(conv.getSupplier().getSupplierCode())
                .supplierName(conv.getSupplier().getSupplierName())
                .contactPerson(conv.getSupplier().getContactPerson())
                .phone(conv.getSupplier().getPhone())
                .email(conv.getSupplier().getEmail())
                .status(conv.getStatus())
                .lastMessageAt(conv.getLastMessageAt())
                .lastMessageContent(lastMsg != null ? lastMsg.getContent() : "No messages yet")
                .lastMessageSender(lastMsg != null ? lastMsg.getSenderName() : null)
                .unreadCount(unread)
                .activeOrdersCount(activeOrders)
                .lastOrderNumber(lastOrderNum)
                .createdAt(conv.getCreatedAt())
                .build();
    }

    private SupplierMessageResponse mapToMessageResponse(SupplierMessage msg) {
        List<SupplierMessageAttachmentDTO> attDTOs = msg.getAttachments().stream()
                .map(a -> SupplierMessageAttachmentDTO.builder()
                        .id(a.getId())
                        .fileName(a.getFileName())
                        .fileType(a.getFileType())
                        .fileSize(a.getFileSize())
                        .fileUrl(a.getFileUrl())
                        .createdAt(a.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        PurchaseOrder po = msg.getPurchaseOrder();

        return SupplierMessageResponse.builder()
                .id(msg.getId())
                .conversationId(msg.getConversation().getId())
                .senderUserId(msg.getSenderUser() != null ? msg.getSenderUser().getId() : null)
                .senderName(msg.getSenderName())
                .senderRole(msg.getSenderRole())
                .messageType(msg.getMessageType())
                .content(msg.getContent())
                .purchaseOrderId(po != null ? po.getId() : null)
                .purchaseOrderNumber(po != null ? po.getOrderNumber() : null)
                .purchaseOrderTotal(po != null ? po.getTotalAmount() : null)
                .purchaseOrderStatus(po != null ? po.getStatus() : null)
                .isReadByAdmin(msg.getIsReadByAdmin())
                .isReadBySupplier(msg.getIsReadBySupplier())
                .createdAt(msg.getCreatedAt())
                .attachments(attDTOs)
                .build();
    }
}
