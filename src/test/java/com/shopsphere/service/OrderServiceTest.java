package com.shopsphere.service;

import com.shopsphere.dto.request.OrderRequest;
import com.shopsphere.dto.response.OrderResponse;
import com.shopsphere.entity.*;
import com.shopsphere.enums.OrderStatus;
import com.shopsphere.enums.Role;
import com.shopsphere.mapper.OrderMapper;
import com.shopsphere.repository.CartItemRepository;
import com.shopsphere.repository.CustomerRepository;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.serviceImpl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private OrderServiceImpl orderService;

    private Customer customer;
    private Order order;
    private Product product;
    private Cart cart;
    private CartItem cartItem;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .fullName("Test Customer")
                .email("customer@test.com")
                .role(Role.CUSTOMER)
                .build();
        customer.setId(1L);

        product = Product.builder()
                .productName("Laptop")
                .price(new BigDecimal("1000.00"))
                .build();
        product.setId(2L);

        Inventory inventory = Inventory.builder()
                .quantity(20)
                .product(product)
                .inStock(true)
                .build();
        product.setInventory(inventory);

        cart = new Cart();
        cart.setCustomer(customer);
        cartItem = CartItem.builder()
                .cart(cart)
                .product(product)
                .quantity(2)
                .build();
        cart.setCartItems(new ArrayList<>(Collections.singletonList(cartItem)));
        customer.setCart(cart);

        order = new Order();
        order.setId(1L);
        order.setCustomer(customer);
        order.setOrderStatus(OrderStatus.PENDING);
        order.setTotalAmount(new BigDecimal("2000.00"));
    }

    @Test
    void testPlaceOrderSuccess() {
        OrderRequest request = OrderRequest.builder()
                .customerId(1L)
                .build();

        OrderResponse mockResponse = OrderResponse.builder()
                .id(1L)
                .customerId(1L)
                .totalAmount(new BigDecimal("2000.00"))
                .orderStatus("PENDING")
                .build();

        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(orderMapper.toResponse(any(Order.class))).thenReturn(mockResponse);

        OrderResponse response = orderService.placeOrder(request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("PENDING", response.getOrderStatus());
        assertEquals(new BigDecimal("2000.00"), response.getTotalAmount());

        verify(cartItemRepository, times(1)).deleteAll(any());
        verify(notificationService, times(1)).createNotification(eq(1L), anyString(), anyString());
    }

    @Test
    void testCancelOrderSuccess() {
        order.setOrderItems(new ArrayList<>());
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        orderService.cancelOrder(1L);

        assertEquals(OrderStatus.CANCELLED, order.getOrderStatus());
        verify(orderRepository, times(1)).save(order);
        verify(notificationService, times(1)).createNotification(eq(1L), anyString(), anyString());
    }
}
