package com.shopsphere.mapper;

import com.shopsphere.dto.request.ProductRequest;
import com.shopsphere.dto.response.ProductResponse;
import com.shopsphere.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public Product toEntity(ProductRequest request) {

        Product product = new Product();

        product.setProductName(request.getProductName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setBrand(request.getBrand());
        product.setSku(request.getSku());

        return product;
    }

    public ProductResponse toResponse(Product product) {
        Long daysUntilDeletion = null;
        if (product.getDeleted() != null && product.getDeleted() && product.getDeletedAt() != null) {
            long elapsedDays = java.time.temporal.ChronoUnit.DAYS.between(product.getDeletedAt(), java.time.LocalDateTime.now());
            daysUntilDeletion = Math.max(0L, 7L - elapsedDays);
        }

        return ProductResponse.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .description(product.getDescription())
                .price(product.getPrice())
                .brand(product.getBrand())
                .sku(product.getSku())
                .active(product.getActive())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : "Unassigned")
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .adminName(product.getAdmin() != null ? product.getAdmin().getFullName() : "System")
                .quantity(product.getInventory() != null ? product.getInventory().getQuantity() : 0)
                .inStock(product.getInventory() != null && product.getInventory().getInStock())
                .images(product.getImages() != null ? product.getImages().stream()
                        .sorted(java.util.Comparator.comparing(img -> img.getSortOrder() != null ? img.getSortOrder() : 0))
                        .map(img -> com.shopsphere.dto.response.ProductImageResponse.builder()
                                .id(img.getId())
                                .imageUrl(img.getImageUrl())
                                .altText(img.getAltText())
                                .primaryImage(img.getPrimaryImage())
                                .sortOrder(img.getSortOrder() != null ? img.getSortOrder() : 0)
                                .build())
                        .collect(java.util.stream.Collectors.toList()) : null)
                .deleted(product.getDeleted())
                .deletedAt(product.getDeletedAt())
                .approved(product.getApproved())
                .premium(product.getPremium())
                .reviewVerified(product.getReviewVerified())
                .daysUntilDeletion(daysUntilDeletion)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public void updateEntity(ProductRequest request, Product product) {

        product.setProductName(request.getProductName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setBrand(request.getBrand());
        product.setSku(request.getSku());
        if (request.getPremium() != null) {
            product.setPremium(request.getPremium());
        }
        if (request.getApproved() != null) {
            product.setApproved(request.getApproved());
        }
    }
}