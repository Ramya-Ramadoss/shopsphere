package com.shopsphere.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistResponse {

    private Long id;

    private Long customerId;

    private List<WishlistItemResponse> items;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}