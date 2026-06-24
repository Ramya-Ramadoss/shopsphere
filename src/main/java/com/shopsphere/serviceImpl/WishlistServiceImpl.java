package com.shopsphere.serviceImpl;

import com.shopsphere.dto.request.CartRequest;
import com.shopsphere.dto.request.WishlistRequest;
import com.shopsphere.dto.response.WishlistResponse;
import com.shopsphere.entity.Customer;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.Wishlist;
import com.shopsphere.entity.WishlistItem;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.WishlistMapper;
import com.shopsphere.repository.CustomerRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.WishlistItemRepository;
import com.shopsphere.repository.WishlistRepository;
import com.shopsphere.service.CartService;
import com.shopsphere.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final WishlistMapper wishlistMapper;
    private final CartService cartService;
    private final CustomerRepository customerRepository;

    private Wishlist getOrCreateWishlist(Long customerId) {
        return wishlistRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    Customer customer = customerRepository.findById(customerId)
                            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
                    Wishlist newWishlist = Wishlist.builder()
                            .customer(customer)
                            .active(true)
                            .build();
                    return wishlistRepository.save(newWishlist);
                });
    }

    @Override
    public WishlistResponse getWishlist(Long customerId) {

        Wishlist wishlist = getOrCreateWishlist(customerId);

        return wishlistMapper.toResponse(wishlist);
    }

    @Override
    public WishlistResponse addToWishlist(Long customerId, WishlistRequest request) {

        Wishlist wishlist = getOrCreateWishlist(customerId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found"));

        WishlistItem wishlistItem = wishlistItemRepository
                .findByWishlistIdAndProductId(wishlist.getId(), product.getId())
                .orElse(null);

        if (wishlistItem == null) {

            wishlistItem = WishlistItem.builder()
                    .wishlist(wishlist)
                    .product(product)
                    .available(product.getActive())
                    .build();

            wishlist.getWishlistItems().add(wishlistItem);

            wishlistItemRepository.save(wishlistItem);
        }

        return wishlistMapper.toResponse(wishlistRepository.save(wishlist));
    }

    @Override
    public void removeFromWishlist(Long customerId, Long productId) {

        Wishlist wishlist = getOrCreateWishlist(customerId);

        WishlistItem wishlistItem = wishlistItemRepository
                .findByWishlistIdAndProductId(wishlist.getId(), productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Wishlist Item not found"));

        wishlist.getWishlistItems().remove(wishlistItem);

        wishlistItemRepository.delete(wishlistItem);

        wishlistRepository.save(wishlist);
    }

    @Override
    public void removeFromWishlistById(Long wishlistItemId) {
        WishlistItem wishlistItem = wishlistItemRepository.findById(wishlistItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist Item not found"));
        Wishlist wishlist = wishlistItem.getWishlist();
        if (wishlist != null) {
            wishlist.getWishlistItems().remove(wishlistItem);
            wishlistRepository.save(wishlist);
        }
        wishlistItemRepository.delete(wishlistItem);
    }

    @Override
    public void moveToCart(Long customerId, Long productId) {
        CartRequest cartRequest = CartRequest.builder()
                .customerId(customerId)
                .productId(productId)
                .quantity(1)
                .build();
        cartService.addToCart(customerId, cartRequest);
        removeFromWishlist(customerId, productId);
    }
}