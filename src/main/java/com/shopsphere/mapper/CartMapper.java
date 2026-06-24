package com.shopsphere.mapper;

import com.shopsphere.dto.request.CartRequest;
import com.shopsphere.dto.response.CartResponse;
import com.shopsphere.entity.Cart;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Component
public class CartMapper {

    private final CartItemMapper cartItemMapper;

    public CartMapper(CartItemMapper cartItemMapper) {
        this.cartItemMapper = cartItemMapper;
    }

    public Cart toEntity(CartRequest request) {

        return Cart.builder()
                .active(true)
                .build();
    }

    public void updateEntity(CartRequest request, Cart cart) {
        // Cart fields are managed through CartService.
        // No direct fields to update.
    }

    public CartResponse toResponse(Cart cart) {

        BigDecimal grandTotal = cart.getCartItems()
                .stream()
                .map(item -> item.getPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .id(cart.getId())
                .customerId(cart.getCustomer().getId())
                .items(cart.getCartItems()
                        .stream()
                        .map(cartItemMapper::toResponse)
                        .collect(Collectors.toList()))
                .grandTotal(grandTotal)
                .active(cart.getActive())
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .build();
    }
}