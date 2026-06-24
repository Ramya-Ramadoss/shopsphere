package com.shopsphere.service;

import com.shopsphere.dto.request.CartRequest;
import com.shopsphere.dto.response.CartResponse;

public interface CartService {

    CartResponse getCart(Long customerId);

    CartResponse addToCart(Long customerId, CartRequest request);

    CartResponse updateCart(Long customerId, CartRequest request);

    void clearCart(Long customerId);

    void removeCartItem(Long cartItemId);
}