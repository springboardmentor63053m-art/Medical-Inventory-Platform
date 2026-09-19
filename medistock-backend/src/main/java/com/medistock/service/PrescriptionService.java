package com.medistock.service;

import com.medistock.dto.CreateSaleRequest;
import com.medistock.dto.PageResponse;
import com.medistock.dto.PrescriptionDTO;
import com.medistock.dto.SaleDTO;
import com.medistock.enums.PrescriptionStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PrescriptionService {
    PrescriptionDTO uploadPrescription(Long customerId, MultipartFile file);
    PageResponse<PrescriptionDTO> getAllPrescriptions(PrescriptionStatus status, Pageable pageable);
    List<PrescriptionDTO> getCustomerPrescriptions(Long customerId);
    PrescriptionDTO getPrescriptionById(Long id);
    PrescriptionDTO verifyPrescription(Long id, PrescriptionStatus status, String adminNotes, Long reviewerId);
    SaleDTO fulfillPrescriptionOrder(Long prescriptionId, List<CreateSaleRequest.SaleItemRequest> items, Long fulfilledById, String deliveryNotes);
}

