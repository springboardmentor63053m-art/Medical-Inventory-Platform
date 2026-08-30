package com.medistock.medistock_backend.controller;

import com.medistock.medistock_backend.dto.ApiResponse;
import com.medistock.medistock_backend.dto.ChatMessageRequest;
import com.medistock.medistock_backend.dto.ChatMessageResponse;
import com.medistock.medistock_backend.entity.ChatMessage;
import com.medistock.medistock_backend.entity.User;
import com.medistock.medistock_backend.entity.Supplier;
import com.medistock.medistock_backend.repository.ChatMessageRepository;
import com.medistock.medistock_backend.repository.UserRepository;
import com.medistock.medistock_backend.repository.SupplierRepository;
import com.medistock.medistock_backend.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getConversation(
            @RequestParam String contactId,
            Authentication authentication) {

        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        String currentId = resolveStringId(currentUser);

        // Pre-fetch contact info to optimize DB queries inside mapToResponse loop
        User contactUser = null;
        Supplier contactSupplier = null;

        if (contactId.startsWith("user_")) {
            Long userId = Long.parseLong(contactId.substring(5));
            contactUser = userRepository.findById(userId).orElse(null);
        } else if (contactId.startsWith("supplier_")) {
            Long supplierId = Long.parseLong(contactId.substring(9));
            contactSupplier = supplierRepository.findById(supplierId).orElse(null);
        }

        User finalContactUser = contactUser;
        Supplier finalContactSupplier = contactSupplier;

        List<ChatMessageResponse> conversation = chatMessageRepository
                .findConversation(currentId, contactId)
                .stream()
                .map(msg -> mapToResponse(msg, currentUser, finalContactUser, finalContactSupplier))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Conversation retrieved successfully", conversation));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @Valid @RequestBody ChatMessageRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        String senderId = resolveStringId(currentUser);

        ChatMessage chatMessage = ChatMessage.builder()
                .senderId(senderId)
                .receiverId(request.getReceiverId())
                .text(request.getText())
                .timestamp(LocalDateTime.now())
                .build();

        ChatMessage saved = chatMessageRepository.save(chatMessage);

        // Pre-fetch receiver details for response DTO mapping
        User contactUser = null;
        Supplier contactSupplier = null;
        String receiverId = request.getReceiverId();

        if (receiverId.startsWith("user_")) {
            Long userId = Long.parseLong(receiverId.substring(5));
            contactUser = userRepository.findById(userId).orElse(null);
        } else if (receiverId.startsWith("supplier_")) {
            Long supplierId = Long.parseLong(receiverId.substring(9));
            contactSupplier = supplierRepository.findById(supplierId).orElse(null);
        }

        ChatMessageResponse response = mapToResponse(saved, currentUser, contactUser, contactSupplier);

        return ResponseEntity.ok(ApiResponse.success("Message sent successfully", response));
    }

    private String resolveStringId(User user) {
        boolean isSupplier = user.getRoles().stream()
                .anyMatch(role -> role.getName().name().equals("ROLE_SUPPLIER"));
        if (isSupplier) {
            return supplierRepository.findByUserId(user.getId())
                    .map(supplier -> "supplier_" + supplier.getId())
                    .orElse("user_" + user.getId());
        }
        return "user_" + user.getId();
    }

    private ChatMessageResponse mapToResponse(ChatMessage msg, User currentUser, User contactUser, Supplier contactSupplier) {
        String sender = "";
        String senderName = "";

        if (msg.getSenderId().startsWith("user_")) {
            Long userId = Long.parseLong(msg.getSenderId().substring(5));
            if (userId.equals(currentUser.getId())) {
                sender = currentUser.getUsername();
                senderName = currentUser.getFullName() != null ? currentUser.getFullName() : currentUser.getUsername();
            } else if (contactUser != null && userId.equals(contactUser.getId())) {
                sender = contactUser.getUsername();
                senderName = contactUser.getFullName() != null ? contactUser.getFullName() : contactUser.getUsername();
            } else {
                User other = userRepository.findById(userId).orElse(null);
                if (other != null) {
                    sender = other.getUsername();
                    senderName = other.getFullName() != null ? other.getFullName() : other.getUsername();
                }
            }
        } else if (msg.getSenderId().startsWith("supplier_")) {
            Long supplierId = Long.parseLong(msg.getSenderId().substring(9));
            Supplier supplier = null;
            if (contactSupplier != null && supplierId.equals(contactSupplier.getId())) {
                supplier = contactSupplier;
            } else {
                supplier = supplierRepository.findById(supplierId).orElse(null);
            }

            if (supplier != null) {
                senderName = supplier.getName();
                sender = supplier.getUser() != null ? supplier.getUser().getUsername() : supplier.getName();
            }
        }

        String formattedTime = "";
        if (msg.getTimestamp() != null) {
            LocalDateTime now = LocalDateTime.now();
            java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter.ofPattern("hh:mm a");
            java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter.ofPattern("MMM dd, hh:mm a");
            if (msg.getTimestamp().toLocalDate().isEqual(now.toLocalDate())) {
                formattedTime = msg.getTimestamp().format(timeFormatter);
            } else {
                formattedTime = msg.getTimestamp().format(dateFormatter);
            }
        }

        return ChatMessageResponse.builder()
                .id(msg.getId())
                .sender(sender)
                .senderName(senderName)
                .text(msg.getText())
                .timestamp(formattedTime)
                .build();
    }
}
