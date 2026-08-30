package com.medistock.medistock_backend.security;

import com.medistock.medistock_backend.entity.ChatMessage;
import com.medistock.medistock_backend.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
@Slf4j
public class SeedChatMessagesRunner implements CommandLineRunner {

    private final ChatMessageRepository chatMessageRepository;

    @Override
    public void run(String... args) throws Exception {
        if (chatMessageRepository.count() == 0) {
            log.info("Seeding default chat messages...");
            
            LocalDateTime now = LocalDateTime.now();

            ChatMessage m1 = ChatMessage.builder()
                    .senderId("user_3")
                    .receiverId("user_1")
                    .text("Hello Admin, we are running low on Amoxicillin 250mg. Should I create a purchase order?")
                    .timestamp(now.minusHours(2))
                    .build();

            ChatMessage m2 = ChatMessage.builder()
                    .senderId("user_1")
                    .receiverId("user_3")
                    .text("Hi Sneha! Yes, please generate PO for 1,000 units from Sani Sharma.")
                    .timestamp(now.minusHours(1).minusMinutes(50))
                    .build();

            ChatMessage m3 = ChatMessage.builder()
                    .senderId("user_3")
                    .receiverId("user_1")
                    .text("Great, creating purchase order now.")
                    .timestamp(now.minusHours(1).minusMinutes(45))
                    .build();

            ChatMessage m4 = ChatMessage.builder()
                    .senderId("user_4")
                    .receiverId("user_1")
                    .text("Stock adjustment completed for rack RACK-A1.")
                    .timestamp(now.minusDays(2))
                    .build();

            ChatMessage m5 = ChatMessage.builder()
                    .senderId("user_1")
                    .receiverId("user_4")
                    .text("Received and verified. Thank you Kiran!")
                    .timestamp(now.minusDays(2).plusMinutes(10))
                    .build();

            ChatMessage m6 = ChatMessage.builder()
                    .senderId("user_1")
                    .receiverId("supplier_5")
                    .text("Hello Sani Sharma, please confirm delivery date for PO-2026-0012.")
                    .timestamp(now.minusDays(1))
                    .build();

            ChatMessage m7 = ChatMessage.builder()
                    .senderId("supplier_5")
                    .receiverId("user_1")
                    .text("Hi Admin! Shipment is dispatched and expected to arrive by tomorrow morning.")
                    .timestamp(now.minusDays(1).plusMinutes(30))
                    .build();

            chatMessageRepository.saveAll(Arrays.asList(m1, m2, m3, m4, m5, m6, m7));
            log.info("Default chat messages seeded successfully.");
        }
    }
}
