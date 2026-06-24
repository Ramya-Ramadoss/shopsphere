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

        return ProductResponse.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .description(product.getDescription())
                .price(product.getPrice())
                .brand(product.getBrand())
                .sku(product.getSku())
                .active(product.getActive())
                .categoryName(product.getCategory().getName())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .adminName(product.getAdmin().getFullName())
                .quantity(product.getInventory() != null ? product.getInventory().getQuantity() : 0)
                .inStock(product.getInventory() != null && product.getInventory().getInStock())
                .images(product.getImages() != null ? product.getImages().stream()
                        .map(img -> com.shopsphere.dto.response.ProductImageResponse.builder()
                                .id(img.getId())
                                .imageUrl(img.getImageUrl())
                                .altText(img.getAltText())
                                .primaryImage(img.getPrimaryImage())
                                .build())
                        .collect(java.util.stream.Collectors.toList()) : null)
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
    }
}