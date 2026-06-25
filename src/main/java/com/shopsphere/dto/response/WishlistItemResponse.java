package com.shopsphere.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItemResponse {

    private Long id;

    private Long productId;

    private String productName;

    private String productImage;

    private Boolean available;

    private java.math.BigDecimal price;
}