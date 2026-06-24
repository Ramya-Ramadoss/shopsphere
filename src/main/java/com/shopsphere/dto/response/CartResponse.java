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
public class CartResponse {

    private Long id;

    private Long customerId;

    private List<CartItemResponse> items;

    private BigDecimal grandTotal;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}