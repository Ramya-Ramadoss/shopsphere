package com.shopsphere.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponse {

    private Long id;

    private Long productId;

    private String productName;

    private Integer quantity;

    private Integer reservedQuantity;

    private Boolean inStock;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}