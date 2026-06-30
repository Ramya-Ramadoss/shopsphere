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

    void deleteProduct(Long id, String password);

    ProductResponse restoreProduct(Long id);

    void permanentDeleteProduct(Long id);

    List<ProductResponse> getTrashProducts();

    List<ProductResponse> getProductsAwaitingReviewVerification();

    ProductResponse verifyProductReviews(Long id);

    com.shopsphere.dto.response.ProductImageResponse addProductImage(Long id, com.shopsphere.dto.request.ProductImageRequest request);

    void deleteProductImage(Long id, Long imageId);

    List<com.shopsphere.dto.response.ProductImageResponse> reorderProductImages(Long id, com.shopsphere.dto.request.ImageReorderRequest request);

    com.shopsphere.dto.response.ProductImageResponse setProductCoverImage(Long id, Long imageId);

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