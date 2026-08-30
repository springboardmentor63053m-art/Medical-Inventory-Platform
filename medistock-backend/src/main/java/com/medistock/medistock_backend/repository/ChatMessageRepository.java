package com.medistock.medistock_backend.repository;

import com.medistock.medistock_backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE " +
           "(m.senderId = :id1 AND m.receiverId = :id2) OR " +
           "(m.senderId = :id2 AND m.receiverId = :id1) " +
           "ORDER BY m.timestamp ASC")
    List<ChatMessage> findConversation(@Param("id1") String id1, @Param("id2") String id2);
}
