package com.medistock.supplier.repository;

import com.medistock.supplier.entity.SupplierMessageAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierMessageAttachmentRepository extends JpaRepository<SupplierMessageAttachment, Long> {
    List<SupplierMessageAttachment> findByMessageId(Long messageId);
}
