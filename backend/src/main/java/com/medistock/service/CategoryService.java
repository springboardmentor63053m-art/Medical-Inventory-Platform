package com.medistock.service;

import com.medistock.dto.CategoryRequest;
import com.medistock.model.Category;
import com.medistock.repository.CategoryRepository;
import com.medistock.repository.MedicineRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final MedicineRepository medicineRepository;

    public List<Category> getActive() {
        return categoryRepository.findByActiveTrueOrderByNameAsc();
    }

    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    @Transactional
    public Category create(CategoryRequest request) {
        String name = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("A category named \"" + name + "\" already exists.");
        }
        Category category = Category.builder()
                .name(name)
                .description(request.getDescription())
                .defaultReorderLevel(request.getDefaultReorderLevel())
                .active(true)
                .build();
        return categoryRepository.save(category);
    }

    @Transactional
    public Category update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));
        String name = request.getName().trim();
        categoryRepository.findByNameIgnoreCase(name).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("A category named \"" + name + "\" already exists.");
            }
        });
        category.setName(name);
        category.setDescription(request.getDescription());
        category.setDefaultReorderLevel(request.getDefaultReorderLevel());
        return categoryRepository.save(category);
    }

    /**
     * Deactivates (never hard-deletes) a category — medicines reference it
     * by name, not by foreign key, so removing the row outright wouldn't
     * even stop it from being reused, it would just hide it from the
     * management list while doing nothing useful. Deactivating removes it
     * from the "add medicine" dropdown without touching existing data.
     */
    @Transactional
    public void deactivate(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));
        category.setActive(false);
        categoryRepository.save(category);
    }

    /**
     * One-time seed: if the categories table is empty, populate it from
     * whatever distinct category strings already exist on medicines (so
     * existing data isn't orphaned), plus a handful of sensible pharmacy
     * defaults if there's no data at all yet. Safe to call on every
     * startup — it only acts when the table is genuinely empty.
     */
    @Transactional
    public void seedIfEmpty() {
        if (categoryRepository.count() > 0) {
            return;
        }
        List<String> existingNames = medicineRepository.findAll().stream()
                .map(m -> m.getCategory() == null ? null : m.getCategory().trim())
                .filter(c -> c != null && !c.isBlank())
                .map(c -> c.substring(0, 1).toUpperCase() + c.substring(1))
                .distinct()
                .toList();

        List<String> names = existingNames.isEmpty()
                ? List.of("Tablet", "Capsule", "Syrup", "Injection", "Ointment", "Drops", "Other")
                : existingNames;

        for (String name : names) {
            if (!categoryRepository.existsByNameIgnoreCase(name)) {
                categoryRepository.save(Category.builder().name(name).active(true).build());
            }
        }
    }
}
