package com.shopsphere.mapper;

import com.shopsphere.dto.response.WishlistItemResponse;
import com.shopsphere.entity.WishlistItem;
import org.springframework.stereotype.Component;

@Component
public class WishlistItemMapper {

    public WishlistItemResponse toResponse(WishlistItem item) {

        return WishlistItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getProductName())
                .productImage(
                        item.getProduct().getImages().isEmpty()
                                ? null
                                : item.getProduct().getImages().get(0).getImageUrl()
                )
                .available(item.getAvailable())
                .price(item.getProduct().getPrice())
                .build();

    }
}