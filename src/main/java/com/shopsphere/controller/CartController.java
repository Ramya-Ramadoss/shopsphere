package com.shopsphere.controller;

import com.shopsphere.dto.request.CartRequest;
import com.shopsphere.dto.response.CartResponse;
import com.shopsphere.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(
            @Valid @RequestBody CartRequest request) {

        CartResponse response = cartService.addToCart(request.getCustomerId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<CartResponse> getCart(@PathVariable Long customerId) {

        CartResponse response = cartService.getCart(customerId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update")
    public ResponseEntity<CartResponse> updateCart(
            @Valid @RequestBody CartRequest request) {

        CartResponse response = cartService.updateCart(request.getCustomerId(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<Void> removeCartItem(@PathVariable Long cartItemId) {

        cartService.removeCartItem(cartItemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear/{customerId}")
    public ResponseEntity<Void> clearCart(@PathVariable Long customerId) {

        cartService.clearCart(customerId);
        return ResponseEntity.noContent().build();
    }
}
