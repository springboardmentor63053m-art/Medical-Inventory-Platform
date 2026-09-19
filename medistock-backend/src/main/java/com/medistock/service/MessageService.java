package com.medistock.service;

import com.medistock.dto.MessageDTO;
import com.medistock.dto.PageResponse;
import com.medistock.dto.SendMessageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MessageService {
    MessageDTO sendMessage(SendMessageRequest request, Long senderId);
    List<MessageDTO> getConversation(Long user1Id, Long user2Id);
    PageResponse<MessageDTO> getInbox(Long userId, Pageable pageable);
    List<MessageDTO> getOrderMessages(Long purchaseOrderId);
    MessageDTO markAsRead(Long messageId);
    long getUnreadCount(Long userId);
}
