package com.medistock.repository;

import com.medistock.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE (m.sender.id = :user1Id AND m.receiver.id = :user2Id) OR (m.sender.id = :user2Id AND m.receiver.id = :user1Id) ORDER BY m.createdAt ASC")
    List<Message> findConversationBetweenUsers(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);

    @Query("SELECT m FROM Message m WHERE m.receiver.id = :userId ORDER BY m.createdAt DESC")
    Page<Message> findInboxByUserId(@Param("userId") Long userId, Pageable pageable);

    List<Message> findByPurchaseOrderIdOrderByCreatedAtAsc(Long purchaseOrderId);

    long countByReceiverIdAndIsReadFalse(Long receiverId);
}
