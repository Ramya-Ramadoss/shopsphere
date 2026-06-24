package com.shopsphere.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long id;

    private String productName;

    private String description;

    private BigDecimal price;

    private String brand;

    private String sku;

    private Boolean active;

    private String categoryName;

    private Long categoryId;

    private String adminName;

    private Integer quantity;

    private Boolean inStock;

    private List<ProductImageResponse> images;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}