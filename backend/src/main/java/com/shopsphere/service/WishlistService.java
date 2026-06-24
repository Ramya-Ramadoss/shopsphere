package com.shopsphere.service;

import com.shopsphere.dto.request.WishlistRequest;
import com.shopsphere.dto.response.WishlistResponse;

public interface WishlistService {

    WishlistResponse getWishlist(Long customerId);

    WishlistResponse addToWishlist(Long customerId, WishlistRequest request);

    void removeFromWishlist(Long customerId, Long productId);

    void removeFromWishlistById(Long wishlistItemId);

    void moveToCart(Long customerId, Long productId);
}