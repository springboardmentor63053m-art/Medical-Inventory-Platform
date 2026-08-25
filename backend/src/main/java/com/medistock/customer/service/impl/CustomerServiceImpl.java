package com.medistock.customer.service.impl;

import com.medistock.common.exception.ResourceNotFoundException;
import com.medistock.customer.dto.CreateCustomerRequest;
import com.medistock.customer.dto.CustomerDTO;
import com.medistock.customer.entity.Customer;
import com.medistock.customer.repository.CustomerRepository;
import com.medistock.customer.service.CustomerService;
import com.medistock.prescription.dto.response.StorePurchaseItemResponse;
import com.medistock.prescription.dto.response.StorePurchaseResponse;
import com.medistock.prescription.entity.StorePurchase;
import com.medistock.prescription.repository.StorePurchaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final StorePurchaseRepository storePurchaseRepository;

    @Override
    public String normalizePhone(String rawPhone) {
        if (rawPhone == null) return "";
        String digitsOnly = rawPhone.replaceAll("[^0-9]", "");
        if (digitsOnly.isEmpty()) return "";

        // Standard 10-digit Indian mobile number
        if (digitsOnly.length() == 10) {
            return digitsOnly;
        }
        // 12-digits with leading 91 (e.g. 919876543210)
        if (digitsOnly.length() == 12 && digitsOnly.startsWith("91")) {
            return digitsOnly.substring(2);
        }
        // 11-digits with leading 0 (e.g. 09876543210)
        if (digitsOnly.length() == 11 && digitsOnly.startsWith("0")) {
            return digitsOnly.substring(1);
        }
        return digitsOnly;
    }

    /**
     * Strictly read-only phone lookup. Never creates or saves a customer record.
     */
    @Override
    @Transactional(readOnly = true)
    public CustomerDTO lookupByPhone(String rawPhone) {
        String normalized = normalizePhone(rawPhone);
        if (normalized.isEmpty()) {
            return CustomerDTO.builder()
                    .found(false)
                    .exists(false)
                    .normalizedPhone("")
                    .customer(null)
                    .build();
        }

        Optional<Customer> optionalCustomer = customerRepository.findByNormalizedPhone(normalized);
        if (optionalCustomer.isPresent()) {
            return mapToDTO(optionalCustomer.get(), false);
        }

        return CustomerDTO.builder()
                .found(false)
                .exists(false)
                .normalizedPhone(normalized)
                .previousPurchasesCount(0)
                .totalPurchases(0)
                .lifetimeSpend(BigDecimal.ZERO)
                .totalAmountSpent(BigDecimal.ZERO)
                .customer(null)
                .build();
    }

    @Override
    @Transactional
    public CustomerDTO createOrGetCustomer(CreateCustomerRequest request) {
        String normalized = normalizePhone(request.getPhone());
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("Invalid or empty phone number");
        }

        Optional<Customer> existing = customerRepository.findByNormalizedPhone(normalized);
        if (existing.isPresent()) {
            return mapToDTO(existing.get(), false);
        }

        try {
            Customer newCustomer = Customer.builder()
                    .name(request.getName().trim())
                    .phone(request.getPhone().trim())
                    .normalizedPhone(normalized)
                    .totalPurchases(0L)
                    .lifetimeSpend(BigDecimal.ZERO)
                    .status("ACTIVE")
                    .build();
            Customer saved = customerRepository.save(newCustomer);
            log.info("Created new POS customer '{}' with normalized phone '{}'", saved.getName(), saved.getNormalizedPhone());
            return mapToDTO(saved, false);
        } catch (DataIntegrityViolationException ex) {
            log.warn("Concurrent creation conflict for normalized phone '{}'. Fallback to lookup.", normalized);
            Customer c = customerRepository.findByNormalizedPhone(normalized)
                    .orElseThrow(() -> new IllegalStateException("Failed to create or retrieve customer for phone: " + normalized));
            return mapToDTO(c, false);
        }
    }

    @Override
    @Transactional
    public Customer recordCustomerSale(String name, String phone, BigDecimal saleAmount) {
        if (phone == null || phone.trim().isEmpty()) {
            return null;
        }

        String normalized = normalizePhone(phone);
        if (normalized.isEmpty()) {
            return null;
        }

        Customer customer = customerRepository.findByNormalizedPhone(normalized).orElse(null);

        if (customer == null) {
            String custName = (name != null && !name.trim().isEmpty()) ? name.trim() : "Walk-in Customer";
            try {
                customer = Customer.builder()
                        .name(custName)
                        .phone(phone.trim())
                        .normalizedPhone(normalized)
                        .totalPurchases(1L)
                        .lifetimeSpend(saleAmount != null ? saleAmount : BigDecimal.ZERO)
                        .lastPurchaseAt(LocalDateTime.now())
                        .status("ACTIVE")
                        .build();
                customer = customerRepository.save(customer);
                log.info("Created new customer record on POS checkout: '{}' ({})", customer.getName(), customer.getNormalizedPhone());
            } catch (DataIntegrityViolationException ex) {
                customer = customerRepository.findByNormalizedPhone(normalized).orElse(null);
            }
        }

        if (customer != null) {
            long currentCount = customer.getTotalPurchases() != null ? customer.getTotalPurchases() : 0L;
            BigDecimal currentSpend = customer.getLifetimeSpend() != null ? customer.getLifetimeSpend() : BigDecimal.ZERO;

            customer.setTotalPurchases(currentCount + 1);
            customer.setLifetimeSpend(currentSpend.add(saleAmount != null ? saleAmount : BigDecimal.ZERO));
            customer.setLastPurchaseAt(LocalDateTime.now());
            if (name != null && !name.trim().isEmpty() && !name.trim().equalsIgnoreCase("Walk-in Customer")) {
                customer.setName(name.trim());
            }
            customer = customerRepository.save(customer);
            log.info("Updated customer '{}' stats: {} total sales, ₹{} spend", customer.getName(), customer.getTotalPurchases(), customer.getLifetimeSpend());
        }

        return customer;
    }

    @Override
    @Transactional(readOnly = true)
    public Customer getCustomerEntityById(Long id) {
        if (id == null) return null;
        return customerRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerDTO> getAllCustomers(String search, String status, Pageable pageable) {
        Page<Customer> customersPage;
        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasStatus = status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL");

        if (hasSearch && hasStatus) {
            String q = search.trim();
            String norm = normalizePhone(q);
            customersPage = customerRepository.findByStatusAndNameContainingIgnoreCaseOrStatusAndNormalizedPhoneContaining(status.toUpperCase(), q, status.toUpperCase(), norm.isEmpty() ? q : norm, pageable);
        } else if (hasStatus) {
            customersPage = customerRepository.findByStatus(status.toUpperCase(), pageable);
        } else if (hasSearch) {
            String q = search.trim();
            String norm = normalizePhone(q);
            customersPage = customerRepository.findByNameContainingIgnoreCaseOrNormalizedPhoneContaining(q, norm.isEmpty() ? q : norm, pageable);
        } else {
            customersPage = customerRepository.findAll(pageable);
        }

        List<CustomerDTO> dtos = customersPage.getContent().stream()
                .map(c -> mapToDTO(c, false))
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, customersPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDTO getCustomerDetails(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return mapToDTO(customer, true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StorePurchaseResponse> getCustomerPurchases(Long customerId) {
        return storePurchaseRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(p -> p.getCustomer() != null && p.getCustomer().getId().equals(customerId))
                .map(this::mapToStorePurchaseResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CustomerDTO updateCustomerStatus(Long id, String status) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        String newStatus = status != null && status.equalsIgnoreCase("INACTIVE") ? "INACTIVE" : "ACTIVE";
        customer.setStatus(newStatus);
        Customer updated = customerRepository.save(customer);
        log.info("Updated customer id {} status to {}", id, newStatus);
        return mapToDTO(updated, false);
    }

    private CustomerDTO mapToDTO(Customer customer, boolean includePurchaseHistory) {
        List<StorePurchase> purchases = storePurchaseRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(p -> p.getCustomer() != null && p.getCustomer().getId().equals(customer.getId()))
                .collect(Collectors.toList());

        long count = purchases.size();
        BigDecimal totalSpent = purchases.stream()
                .map(StorePurchase::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Fallback to aggregated stats if customer.getTotalPurchases() is null/0
        long finalCount = Math.max(customer.getTotalPurchases() != null ? customer.getTotalPurchases() : 0L, count);
        BigDecimal finalSpent = (customer.getLifetimeSpend() != null && customer.getLifetimeSpend().compareTo(BigDecimal.ZERO) > 0)
                ? customer.getLifetimeSpend()
                : totalSpent;

        LocalDateTime lastPurchase = customer.getLastPurchaseAt() != null
                ? customer.getLastPurchaseAt()
                : (purchases.isEmpty() ? null : purchases.get(0).getCreatedAt());

        CustomerDTO.CustomerData data = CustomerDTO.CustomerData.builder()
                .id(customer.getId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .normalizedPhone(customer.getNormalizedPhone())
                .email(customer.getEmail())
                .address(customer.getAddress())
                .previousPurchasesCount(finalCount)
                .totalPurchases(finalCount)
                .lifetimeSpend(finalSpent)
                .totalAmountSpent(finalSpent)
                .lastPurchaseAt(lastPurchase)
                .lastPurchaseDate(lastPurchase)
                .createdAt(customer.getCreatedAt())
                .status(customer.getStatus() != null ? customer.getStatus() : "ACTIVE")
                .build();

        List<StorePurchaseResponse> purchaseResponses = null;
        if (includePurchaseHistory) {
            purchaseResponses = purchases.stream().map(this::mapToStorePurchaseResponse).collect(Collectors.toList());
        }

        return CustomerDTO.builder()
                .id(customer.getId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .normalizedPhone(customer.getNormalizedPhone())
                .email(customer.getEmail())
                .address(customer.getAddress())
                .previousPurchasesCount(finalCount)
                .totalPurchases(finalCount)
                .lifetimeSpend(finalSpent)
                .totalAmountSpent(finalSpent)
                .lastPurchaseAt(lastPurchase)
                .lastPurchaseDate(lastPurchase)
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .status(customer.getStatus() != null ? customer.getStatus() : "ACTIVE")
                .found(true)
                .exists(true)
                .customer(data)
                .purchases(purchaseResponses)
                .build();
    }

    private StorePurchaseResponse mapToStorePurchaseResponse(StorePurchase purchase) {
        List<StorePurchaseItemResponse> itemResponses = purchase.getItems().stream()
                .map(item -> StorePurchaseItemResponse.builder()
                        .id(item.getId())
                        .medicineId(item.getMedicine().getId())
                        .medicineCode(item.getMedicine().getMedicineCode())
                        .medicineName(item.getMedicine().getName())
                        .genericName(item.getMedicine().getGenericName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        String pharmacistName = purchase.getPharmacist() != null ? purchase.getPharmacist().getFirstName() + " " + purchase.getPharmacist().getLastName() : "Store Pharmacist";

        return StorePurchaseResponse.builder()
                .id(purchase.getId())
                .receiptNumber(purchase.getReceiptNumber())
                .customerId(purchase.getCustomer() != null ? purchase.getCustomer().getId() : null)
                .customerName(purchase.getCustomerName())
                .customerPhone(purchase.getCustomerPhone())
                .normalizedPhone(purchase.getCustomer() != null ? purchase.getCustomer().getNormalizedPhone() : "")
                .pharmacistName(pharmacistName)
                .totalAmount(purchase.getTotalAmount())
                .paymentMethod(purchase.getPaymentMethod())
                .createdAt(purchase.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
