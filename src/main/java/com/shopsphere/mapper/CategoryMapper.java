package com.shopsphere.mapper;

import com.shopsphere.dto.request.CategoryRequest;
import com.shopsphere.dto.response.CategoryResponse;
import com.shopsphere.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public Category toEntity(CategoryRequest request) {

        Category category = new Category();

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        return category;
    }

    public CategoryResponse toResponse(Category category) {

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .active(category.getActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    public void updateEntity(CategoryRequest request, Category category) {

        category.setName(request.getName());
        category.setDescription(request.getDescription());
    }
}