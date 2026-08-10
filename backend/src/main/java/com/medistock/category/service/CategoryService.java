package com.medistock.category.service;

import com.medistock.category.dto.request.CategoryRequest;
import com.medistock.category.dto.response.CategoryDetailsResponse;
import com.medistock.category.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(CategoryRequest request);
    List<CategoryResponse> getAllCategories();
    CategoryResponse getCategoryById(Long id);
    CategoryDetailsResponse getCategoryDetails(Long id);
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
}
