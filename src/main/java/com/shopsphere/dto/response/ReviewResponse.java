package com.shopsphere.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private Long id;

    private String customerName;

    private Long productId;

    private String productName;

    private Integer rating;

    private String reviewText;

    private Boolean approved;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}