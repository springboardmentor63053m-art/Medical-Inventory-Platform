package com.medistock.medicine.service.impl;

import com.medistock.category.dto.response.CategoryResponse;
import com.medistock.category.entity.Category;
import com.medistock.category.repository.CategoryRepository;
import com.medistock.common.exception.ResourceNotFoundException;
import com.medistock.common.exception.UserAlreadyExistsException;
import com.medistock.medicine.dto.request.MedicineRequest;
import com.medistock.medicine.dto.response.MedicineResponse;
import com.medistock.medicine.entity.Medicine;
import com.medistock.medicine.repository.MedicineRepository;
import com.medistock.medicine.service.MedicineService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public MedicineResponse createMedicine(MedicineRequest request) {
        if (medicineRepository.existsByMedicineCode(request.getMedicineCode())) {
            throw new UserAlreadyExistsException("Medicine code already exists: " + request.getMedicineCode());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Medicine medicine = Medicine.builder()
                .category(category)
                .medicineCode(request.getMedicineCode())
                .name(request.getName())
                .genericName(request.getGenericName())
                .manufacturer(request.getManufacturer())
                .dosage(request.getDosage())
                .unitPrice(request.getUnitPrice())
                .reorderLevel(request.getReorderLevel() != null ? request.getReorderLevel() : 10)
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        Medicine saved = medicineRepository.save(medicine);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MedicineResponse> getAllMedicines(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return medicineRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicineResponse getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));
        return mapToResponse(medicine);
    }

    @Override
    @Transactional
    public MedicineResponse updateMedicine(Long id, MedicineRequest request) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));

        if (!medicine.getMedicineCode().equalsIgnoreCase(request.getMedicineCode()) && medicineRepository.existsByMedicineCode(request.getMedicineCode())) {
            throw new UserAlreadyExistsException("Medicine code already exists: " + request.getMedicineCode());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        medicine.setCategory(category);
        medicine.setMedicineCode(request.getMedicineCode());
        medicine.setName(request.getName());
        medicine.setGenericName(request.getGenericName());
        medicine.setManufacturer(request.getManufacturer());
        medicine.setDosage(request.getDosage());
        medicine.setUnitPrice(request.getUnitPrice());
        medicine.setReorderLevel(request.getReorderLevel());
        medicine.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            medicine.setStatus(request.getStatus());
        }

        Medicine updated = medicineRepository.save(medicine);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteMedicine(Long id) {
        if (!medicineRepository.existsById(id)) {
            throw new ResourceNotFoundException("Medicine not found with id: " + id);
        }
        medicineRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineResponse> searchMedicines(String name) {
        return medicineRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineResponse> getMedicinesByCategory(Long categoryId) {
        return medicineRepository.findByCategoryId(categoryId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private MedicineResponse mapToResponse(Medicine medicine) {
        CategoryResponse categoryResp = null;
        if (medicine.getCategory() != null) {
            categoryResp = CategoryResponse.builder()
                    .id(medicine.getCategory().getId())
                    .name(medicine.getCategory().getName())
                    .description(medicine.getCategory().getDescription())
                    .createdAt(medicine.getCategory().getCreatedAt())
                    .updatedAt(medicine.getCategory().getUpdatedAt())
                    .build();
        }

        return MedicineResponse.builder()
                .id(medicine.getId())
                .category(categoryResp)
                .medicineCode(medicine.getMedicineCode())
                .name(medicine.getName())
                .genericName(medicine.getGenericName())
                .manufacturer(medicine.getManufacturer())
                .dosage(medicine.getDosage())
                .unitPrice(medicine.getUnitPrice())
                .reorderLevel(medicine.getReorderLevel())
                .description(medicine.getDescription())
                .status(medicine.getStatus())
                .createdAt(medicine.getCreatedAt())
                .updatedAt(medicine.getUpdatedAt())
                .build();
    }
}
