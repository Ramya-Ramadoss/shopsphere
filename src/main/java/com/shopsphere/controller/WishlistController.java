package com.shopsphere.controller;

import com.shopsphere.dto.request.WishlistRequest;
import com.shopsphere.dto.response.WishlistResponse;
import com.shopsphere.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/add")
    public ResponseEntity<WishlistResponse> addToWishlist(
            @Valid @RequestBody WishlistRequest request) {

        WishlistResponse response = wishlistService.addToWishlist(request.getCustomerId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<WishlistResponse> getWishlist(@PathVariable Long customerId) {

        WishlistResponse response = wishlistService.getWishlist(customerId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/remove/{wishlistItemId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long wishlistItemId) {

        wishlistService.removeFromWishlistById(wishlistItemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/move-to-cart")
    public ResponseEntity<Void> moveToCart(
            @Valid @RequestBody WishlistRequest request) {

        wishlistService.moveToCart(request.getCustomerId(), request.getProductId());
        return ResponseEntity.ok().build();
    }
}
