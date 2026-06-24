package com.shopsphere.mapper;

import com.shopsphere.dto.request.WishlistRequest;
import com.shopsphere.dto.response.WishlistResponse;
import com.shopsphere.entity.Wishlist;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class WishlistMapper {

    private final WishlistItemMapper wishlistItemMapper;

    public WishlistMapper(WishlistItemMapper wishlistItemMapper) {
        this.wishlistItemMapper = wishlistItemMapper;
    }

    public Wishlist toEntity(WishlistRequest request) {

        return Wishlist.builder()
                .active(true)
                .build();
    }

    public void updateEntity(WishlistRequest request, Wishlist wishlist) {
        // Wishlist items are handled inside WishlistService.
    }

    public WishlistResponse toResponse(Wishlist wishlist) {

        return WishlistResponse.builder()
                .id(wishlist.getId())
                .customerId(wishlist.getCustomer().getId())
                .items(wishlist.getWishlistItems()
                        .stream()
                        .map(wishlistItemMapper::toResponse)
                        .collect(Collectors.toList()))
                .active(wishlist.getActive())
                .createdAt(wishlist.getCreatedAt())
                .updatedAt(wishlist.getUpdatedAt())
                .build();
    }
}