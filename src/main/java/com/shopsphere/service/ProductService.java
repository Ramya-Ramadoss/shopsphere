package com.shopsphere.service;

import com.shopsphere.dto.request.ProductRequest;
import com.shopsphere.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    ProductResponse getProductById(Long id);

    List<ProductResponse> getAllProducts();

    List<ProductResponse> getProductsByCategory(Long categoryId);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

    List<ProductResponse> searchProducts(String name);

    org.springframework.data.domain.Page<ProductResponse> getProductsPaginatedAndFiltered(
            String name,
            Long categoryId,
            String brand,
            java.math.BigDecimal minPrice,
            java.math.BigDecimal maxPrice,
            Boolean available,
            org.springframework.data.domain.Pageable pageable
    );
}