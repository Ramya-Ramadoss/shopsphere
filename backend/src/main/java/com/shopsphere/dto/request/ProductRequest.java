package com.shopsphere.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 200)
    private String productName;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price must be greater than or equal to 0")
    private BigDecimal price;

    private String brand;

    private String sku;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Admin ID is required")
    private Long adminId;

    @NotNull(message = "Quantity is required")
    private Integer quantity;

    private String imageUrl;
}