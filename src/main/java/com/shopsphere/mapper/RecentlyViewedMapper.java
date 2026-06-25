package com.shopsphere.mapper;

import com.shopsphere.dto.response.RecentlyViewedResponse;
import com.shopsphere.entity.RecentlyViewed;
import org.springframework.stereotype.Component;

@Component
public class RecentlyViewedMapper {

    public RecentlyViewedResponse toResponse(RecentlyViewed viewed) {

        return RecentlyViewedResponse.builder()
                .id(viewed.getId())
                .productId(viewed.getProduct().getId())
                .productName(viewed.getProduct().getProductName())
                .viewedAt(viewed.getViewedAt())
                .productImage(
                        viewed.getProduct().getImages().isEmpty()
                                ? null
                                : viewed.getProduct().getImages().get(0).getImageUrl()
                )
                .price(viewed.getProduct().getPrice())
                .build();

    }
}