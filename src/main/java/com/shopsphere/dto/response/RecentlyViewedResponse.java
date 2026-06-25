package com.shopsphere.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentlyViewedResponse {

    private Long id;

    private Long productId;

    private String productName;

    private LocalDateTime viewedAt;

    private String productImage;

    private java.math.BigDecimal price;
}