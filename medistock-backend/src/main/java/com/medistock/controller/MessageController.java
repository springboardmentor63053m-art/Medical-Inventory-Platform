package com.medistock.controller;

import com.medistock.dto.ApiResponse;
import com.medistock.dto.MessageDTO;
import com.medistock.dto.PageResponse;
import com.medistock.dto.SendMessageRequest;
import com.medistock.entity.User;
import com.medistock.repository.UserRepository;
import com.medistock.security.CustomUserDetails;
import com.medistock.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@Tag(name = "Messages", description = "Admin & Supplier Communication APIs")
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;

    public MessageController(MessageService messageService, UserRepository userRepository) {
        this.messageService = messageService;
        this.userRepository = userRepository;
    }

    private Long getCurrentUserId(Authentication authentication, CustomUserDetails userDetails) {
        if (userDetails != null && userDetails.getUser() != null) {
            return userDetails.getUser().getId();
        }
        if (authentication != null && authentication.getName() != null) {
            User user = userRepository.findByEmail(authentication.getName()).orElse(null);
            if (user != null) return user.getId();
        }
        return 1L; // Fallback default admin ID
    }

    @PostMapping
    @Operation(summary = "Send Message", description = "Send an in-app message to another user or on a purchase order")
    public ResponseEntity<ApiResponse<MessageDTO>> sendMessage(
            @Valid @RequestBody SendMessageRequest request,
            Authentication authentication,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long senderId = getCurrentUserId(authentication, userDetails);
        MessageDTO message = messageService.sendMessage(request, senderId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(message, "Message sent successfully"));
    }

    @GetMapping("/conversation/{otherUserId}")
    @Operation(summary = "Get Conversation Thread", description = "Get chat history with a specific user")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getConversation(
            @PathVariable Long otherUserId,
            Authentication authentication,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long currentUserId = getCurrentUserId(authentication, userDetails);
        List<MessageDTO> messages = messageService.getConversation(currentUserId, otherUserId);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @GetMapping("/inbox")
    @Operation(summary = "Get User Inbox", description = "Paginated list of received messages")
    public ResponseEntity<ApiResponse<PageResponse<MessageDTO>>> getInbox(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long currentUserId = getCurrentUserId(authentication, userDetails);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PageResponse<MessageDTO> inbox = messageService.getInbox(currentUserId, pageable);
        return ResponseEntity.ok(ApiResponse.success(inbox));
    }

    @GetMapping("/order/{purchaseOrderId}")
    @Operation(summary = "Get Purchase Order Messages", description = "Get messages related to a specific purchase order")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getOrderMessages(@PathVariable Long purchaseOrderId) {
        List<MessageDTO> messages = messageService.getOrderMessages(purchaseOrderId);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark Message as Read", description = "Update message status to read")
    public ResponseEntity<ApiResponse<MessageDTO>> markAsRead(@PathVariable Long id) {
        MessageDTO updated = messageService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get Unread Count", description = "Get unread message count for current user")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            Authentication authentication,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long currentUserId = getCurrentUserId(authentication, userDetails);
        long count = messageService.getUnreadCount(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
