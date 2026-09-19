package com.medistock.service.impl;

import com.medistock.dto.MessageDTO;
import com.medistock.dto.PageResponse;
import com.medistock.dto.SendMessageRequest;
import com.medistock.entity.Message;
import com.medistock.entity.PurchaseOrder;
import com.medistock.entity.User;
import com.medistock.enums.NotificationType;
import com.medistock.exception.ResourceNotFoundException;
import com.medistock.repository.MessageRepository;
import com.medistock.repository.PurchaseOrderRepository;
import com.medistock.repository.UserRepository;
import com.medistock.service.MessageService;
import com.medistock.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final NotificationService notificationService;

    public MessageServiceImpl(MessageRepository messageRepository,
                              UserRepository userRepository,
                              PurchaseOrderRepository purchaseOrderRepository,
                              NotificationService notificationService) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public MessageDTO sendMessage(SendMessageRequest request, Long senderId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found with ID: " + senderId));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found with ID: " + request.getReceiverId()));

        PurchaseOrder order = null;
        if (request.getPurchaseOrderId() != null) {
            order = purchaseOrderRepository.findById(request.getPurchaseOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with ID: " + request.getPurchaseOrderId()));
        }

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setPurchaseOrder(order);
        message.setSubject(request.getSubject());
        message.setContent(request.getContent());

        Message saved = messageRepository.save(message);

        // Send notification to receiver
        notificationService.createNotification(
                "New Message from " + sender.getFullName(),
                request.getContent().length() > 50 ? request.getContent().substring(0, 50) + "..." : request.getContent(),
                NotificationType.MESSAGE_ALERT
        );

        return mapToDTO(saved);
    }

    @Override
    public List<MessageDTO> getConversation(Long user1Id, Long user2Id) {
        return messageRepository.findConversationBetweenUsers(user1Id, user2Id).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PageResponse<MessageDTO> getInbox(Long userId, Pageable pageable) {
        Page<Message> page = messageRepository.findInboxByUserId(userId, pageable);
        List<MessageDTO> content = page.getContent().stream().map(this::mapToDTO).collect(Collectors.toList());
        return PageResponse.<MessageDTO>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Override
    public List<MessageDTO> getOrderMessages(Long purchaseOrderId) {
        return messageRepository.findByPurchaseOrderIdOrderByCreatedAtAsc(purchaseOrderId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MessageDTO markAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found with ID: " + messageId));
        message.setRead(true);
        return mapToDTO(messageRepository.save(message));
    }

    @Override
    public long getUnreadCount(Long userId) {
        return messageRepository.countByReceiverIdAndIsReadFalse(userId);
    }

    private MessageDTO mapToDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderName(message.getSender().getFullName());
        dto.setSenderRole(message.getSender().getRole() != null ? message.getSender().getRole().getRoleName() : null);

        dto.setReceiverId(message.getReceiver().getId());
        dto.setReceiverName(message.getReceiver().getFullName());
        dto.setReceiverRole(message.getReceiver().getRole() != null ? message.getReceiver().getRole().getRoleName() : null);

        if (message.getPurchaseOrder() != null) {
            dto.setPurchaseOrderId(message.getPurchaseOrder().getId());
            dto.setOrderNumber(message.getPurchaseOrder().getOrderNumber());
        }

        dto.setSubject(message.getSubject());
        dto.setContent(message.getContent());
        dto.setRead(message.isRead());
        dto.setCreatedAt(message.getCreatedAt());
        return dto;
    }
}
