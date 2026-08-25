package com.medistock.supplier.repository;

import com.medistock.supplier.entity.SupplierConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierConversationRepository extends JpaRepository<SupplierConversation, Long> {
    Optional<SupplierConversation> findBySupplierId(Long supplierId);
    Optional<SupplierConversation> findBySupplier_Email(String email);
    List<SupplierConversation> findAllByOrderByLastMessageAtDesc();
}
