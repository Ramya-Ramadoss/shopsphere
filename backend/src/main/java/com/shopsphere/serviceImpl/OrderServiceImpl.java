package com.shopsphere.serviceImpl;

import com.shopsphere.dto.request.OrderRequest;
import com.shopsphere.dto.response.OrderResponse;
import com.shopsphere.entity.*;
import com.shopsphere.enums.OrderStatus;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.mapper.OrderMapper;
import com.shopsphere.repository.CustomerRepository;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.CartItemRepository;
import com.shopsphere.service.OrderService;
import com.shopsphere.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderMapper orderMapper;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public OrderResponse placeOrder(OrderRequest request) {
        log.info("Processing order placement for customer ID: {}", request.getCustomerId());
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Cart cart = customer.getCart();
        if (cart == null || cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Order order = new Order();
        order.setCustomer(customer);
        order.setOrderDate(LocalDateTime.now());
        order.setOrderStatus(OrderStatus.PENDING);

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();
            if (product == null) continue;

            Inventory inventory = product.getInventory();
            if (inventory == null || inventory.getQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getProductName());
            }

            // Deduct inventory
            int oldStock = inventory.getQuantity();
            int newStock = oldStock - cartItem.getQuantity();
            inventory.setQuantity(newStock);
            inventory.setInStock(newStock > 0);

            // Add low stock alert if needed
            if (newStock < 10) {
                notificationService.createNotification(customer.getId(), "Low Stock Alert",
                        "Product " + product.getProductName() + " is running low on stock. Current quantity: " + newStock);
            }

            BigDecimal unitPrice = product.getPrice();
            BigDecimal subtotal = unitPrice.multiply(new BigDecimal(cartItem.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build();

            orderItems.add(orderItem);
            total = total.add(subtotal);
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(total);

        Order savedOrder = orderRepository.save(order);

        // Clear cart
        cartItemRepository.deleteAll(cart.getCartItems());
        cart.getCartItems().clear();

        // Trigger Notification
        notificationService.createNotification(customer.getId(), "Order Placed",
                "Your order #" + savedOrder.getId() + " has been placed successfully. Total amount: " + total);

        return orderMapper.toResponse(savedOrder);
    }

    @Override
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return orderMapper.toResponse(order);
    }

    @Override
    public List<OrderResponse> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId)
                .stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void cancelOrder(Long id) {
        log.info("Request received to cancel order ID: {}", id);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already cancelled");
        }
        if (order.getOrderStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Delivered orders cannot be cancelled");
        }

        // Revert inventory
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            if (product != null && product.getInventory() != null) {
                Inventory inv = product.getInventory();
                inv.setQuantity(inv.getQuantity() + item.getQuantity());
                inv.setInStock(true);
            }
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        notificationService.createNotification(order.getCustomer().getId(), "Order Cancelled",
                "Your order #" + order.getId() + " has been cancelled.");
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String status) {
        log.info("Request received to update status of order ID: {} to {}", orderId, status);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        OrderStatus oldStatus = order.getOrderStatus();
        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid order status: " + status);
        }

        if (oldStatus == newStatus) {
            return orderMapper.toResponse(order);
        }

        if (oldStatus == OrderStatus.CANCELLED || oldStatus == OrderStatus.DELIVERED) {
            throw new BadRequestException("Cannot update status of a " + oldStatus + " order");
        }

        // If transitioning to CANCELLED, revert inventory
        if (newStatus == OrderStatus.CANCELLED) {
            for (OrderItem item : order.getOrderItems()) {
                Product product = item.getProduct();
                if (product != null && product.getInventory() != null) {
                    Inventory inv = product.getInventory();
                    inv.setQuantity(inv.getQuantity() + item.getQuantity());
                    inv.setInStock(true);
                }
            }
        }

        order.setOrderStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        // Trigger Notifications
        Long customerId = order.getCustomer().getId();
        if (newStatus == OrderStatus.DELIVERED) {
            notificationService.createNotification(customerId, "Order Delivered",
                    "Your order #" + order.getId() + " has been delivered. Thank you for shopping with us!");
        } else if (newStatus == OrderStatus.CANCELLED) {
            notificationService.createNotification(customerId, "Order Cancelled",
                    "Your order #" + order.getId() + " has been cancelled.");
        } else {
            notificationService.createNotification(customerId, "Order Status Updated",
                    "Your order #" + order.getId() + " status has been updated to " + newStatus);
        }

        return orderMapper.toResponse(savedOrder);
    }
}