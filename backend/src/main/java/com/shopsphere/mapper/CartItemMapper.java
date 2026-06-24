package com.shopsphere.mapper;

import com.shopsphere.dto.response.CartItemResponse;
import com.shopsphere.entity.CartItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class CartItemMapper {

    public CartItemResponse toResponse(CartItem item) {

        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getProductName())
                .productImage(
                        item.getProduct().getImages().isEmpty()
                                ? null
                                : item.getProduct().getImages().get(0).getImageUrl()
                )
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subtotal(item.getPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .build();
    }
}