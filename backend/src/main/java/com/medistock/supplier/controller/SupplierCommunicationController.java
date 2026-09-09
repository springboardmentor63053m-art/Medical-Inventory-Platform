package com.medistock.supplier.controller;

import com.medistock.supplier.dto.*;
import com.medistock.supplier.service.SupplierCommunicationService;
import com.medistock.user.entity.User;
import com.medistock.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/supplier-communications")
@RequiredArgsConstructor
public class SupplierCommunicationController {

    private final SupplierCommunicationService communicationService;
    private final UserRepository userRepository;

    @GetMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SupplierConversationResponse>> getAllConversations(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "filter", required = false) String filter,
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        boolean isSupplier = user != null && user.getRoles().stream()
                .anyMatch(r -> r.getName().equalsIgnoreCase("ROLE_SUPPLIER") || r.getName().equalsIgnoreCase("SUPPLIER"));

        if (isSupplier) {
            SupplierConversationResponse myConv = communicationService.getConversationForSupplierUser(authentication.getName());
            return ResponseEntity.ok(Collections.singletonList(myConv));
        }

        List<SupplierConversationResponse> conversations = communicationService.getAllConversationsForAdmin(search, filter);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/suppliers/{supplierIdentifier}/conversation")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SupplierConversationResponse> getConversationForSupplierIdentifier(
            @PathVariable("supplierIdentifier") String supplierIdentifier
    ) {
        SupplierConversationResponse response = communicationService.getConversationBySupplierIdentifier(supplierIdentifier, false);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/suppliers/{supplierIdentifier}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SupplierMessageResponse>> getMessagesForSupplierIdentifier(
            @PathVariable("supplierIdentifier") String supplierIdentifier,
            Authentication authentication
    ) {
        List<SupplierMessageResponse> messages = communicationService.getMessagesBySupplierIdentifier(supplierIdentifier, authentication.getName());
        return ResponseEntity.ok(messages);
    }

    @PostMapping(value = "/suppliers/{supplierIdentifier}/messages", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SupplierMessageResponse> sendMessageBySupplierIdentifierWithAttachment(
            @PathVariable("supplierIdentifier") String supplierIdentifier,
            @RequestParam("content") String content,
            @RequestParam(value = "messageType", defaultValue = "SUPPLIER_MESSAGE") String messageType,
            @RequestParam(value = "purchaseOrderId", required = false) Long purchaseOrderId,
            @RequestPart(value = "attachment", required = false) MultipartFile attachment,
            Authentication authentication
    ) {
        CreateSupplierMessageRequest request = new CreateSupplierMessageRequest(content, messageType, purchaseOrderId);
        SupplierMessageResponse response = communicationService.sendMessageBySupplierIdentifier(supplierIdentifier, request, attachment, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/suppliers/{supplierIdentifier}/messages/text")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SupplierMessageResponse> sendMessageBySupplierIdentifierText(
            @PathVariable("supplierIdentifier") String supplierIdentifier,
            @Valid @RequestBody CreateSupplierMessageRequest request,
            Authentication authentication
    ) {
        SupplierMessageResponse response = communicationService.sendMessageBySupplierIdentifier(supplierIdentifier, request, null, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/conversations")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF')")
    public ResponseEntity<SupplierConversationResponse> createConversation(
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        Long supplierId = Long.parseLong(body.get("supplierId").toString());
        Long poId = body.get("purchaseOrderId") != null ? Long.parseLong(body.get("purchaseOrderId").toString()) : null;
        String initialMessage = body.get("initialMessage") != null ? body.get("initialMessage").toString() : null;

        SupplierConversationResponse response = communicationService.startNewConversation(supplierId, poId, initialMessage, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/conversations/my")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<SupplierConversationResponse> getMyConversation(Authentication authentication) {
        SupplierConversationResponse response = communicationService.getConversationForSupplierUser(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/conversations/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SupplierConversationResponse> getConversationById(@PathVariable("id") Long id) {
        SupplierConversationResponse response = communicationService.getOrCreateConversation(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/conversations/{id}/status")
    @PatchMapping("/conversations/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST', 'STAFF')")
    public ResponseEntity<SupplierConversationResponse> updateStatus(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> body
    ) {
        String status = body.getOrDefault("status", "ACTIVE");
        SupplierConversationResponse response = communicationService.updateConversationStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-po/{poId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SupplierConversationResponse> getConversationByPO(@PathVariable("poId") Long poId) {
        SupplierConversationResponse response = communicationService.getConversationByPOId(poId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/conversations/{id}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SupplierMessageResponse>> getMessages(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        List<SupplierMessageResponse> messages = communicationService.getMessages(id, authentication.getName());
        return ResponseEntity.ok(messages);
    }

    @PostMapping(value = "/conversations/{id}/messages", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SupplierMessageResponse> sendMessageWithAttachment(
            @PathVariable("id") Long id,
            @RequestParam("content") String content,
            @RequestParam(value = "messageType", defaultValue = "SUPPLIER_MESSAGE") String messageType,
            @RequestParam(value = "purchaseOrderId", required = false) Long purchaseOrderId,
            @RequestPart(value = "attachment", required = false) MultipartFile attachment,
            Authentication authentication
    ) {
        CreateSupplierMessageRequest request = new CreateSupplierMessageRequest(content, messageType, purchaseOrderId);
        SupplierMessageResponse response = communicationService.sendMessage(id, request, attachment, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/conversations/{id}/messages/text")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SupplierMessageResponse> sendMessageText(
            @PathVariable("id") Long id,
            @Valid @RequestBody CreateSupplierMessageRequest request,
            Authentication authentication
    ) {
        SupplierMessageResponse response = communicationService.sendMessage(id, request, null, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/conversations/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        communicationService.markAsRead(id, authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Conversation marked as read"));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        long count = communicationService.getUnreadCount(authentication.getName());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }
}
