package com.shopsphere.serviceImpl;

import com.shopsphere.dto.request.CartRequest;
import com.shopsphere.dto.response.CartResponse;
import com.shopsphere.entity.Cart;
import com.shopsphere.entity.CartItem;
import com.shopsphere.entity.Customer;
import com.shopsphere.entity.Product;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.CartMapper;
import com.shopsphere.repository.CartItemRepository;
import com.shopsphere.repository.CartRepository;
import com.shopsphere.repository.CustomerRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final CartMapper cartMapper;

    private Cart getOrCreateCart(Long customerId) {
        return cartRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    Customer customer = customerRepository.findById(customerId)
                            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
                    Cart newCart = Cart.builder()
                            .customer(customer)
                            .active(true)
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    @Override
    public CartResponse getCart(Long customerId) {

        Cart cart = getOrCreateCart(customerId);

        return cartMapper.toResponse(cart);
    }

    @Override
    public CartResponse addToCart(Long customerId, CartRequest request) {

        Cart cart = getOrCreateCart(customerId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found"));

        CartItem cartItem = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), product.getId())
                .orElse(null);

        if (cartItem != null) {

            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());

        } else {

            cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .price(product.getPrice())
                    .build();

            cart.getCartItems().add(cartItem);
        }

        cartItemRepository.save(cartItem);

        return cartMapper.toResponse(cartRepository.save(cart));
    }

    @Override
    public CartResponse updateCart(Long customerId, CartRequest request) {

        Cart cart = getOrCreateCart(customerId);

        CartItem cartItem = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), request.getProductId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Cart Item not found"));

        cartItem.setQuantity(request.getQuantity());

        cartItemRepository.save(cartItem);

        return cartMapper.toResponse(cart);
    }

    @Override
    public void clearCart(Long customerId) {

        Cart cart = getOrCreateCart(customerId);

        cart.getCartItems().clear();

        cartRepository.save(cart);
    }

    @Override
    public void removeCartItem(Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart Item not found"));
        Cart cart = cartItem.getCart();
        if (cart != null) {
            cart.getCartItems().remove(cartItem);
            cartRepository.save(cart);
        }
        cartItemRepository.delete(cartItem);
    }
}