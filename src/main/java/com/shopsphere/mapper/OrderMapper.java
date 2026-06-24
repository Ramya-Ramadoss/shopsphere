package com.shopsphere.mapper;

import com.shopsphere.dto.request.OrderRequest;
import com.shopsphere.dto.response.OrderItemResponse;
import com.shopsphere.dto.response.OrderResponse;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.OrderItem;
import com.shopsphere.enums.OrderStatus;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public Order toEntity(OrderRequest request) {
        Order order = new Order();
        if (request.getOrderStatus() != null) {
            try {
                order.setOrderStatus(OrderStatus.valueOf(request.getOrderStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                order.setOrderStatus(OrderStatus.PENDING);
            }
        } else {
            order.setOrderStatus(OrderStatus.PENDING);
        }
        return order;
    }

    public OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = Collections.emptyList();
        if (order.getOrderItems() != null) {
            itemResponses = order.getOrderItems().stream()
                    .map(this::toItemResponse)
                    .collect(Collectors.toList());
        }

        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomer().getId())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .orderStatus(order.getOrderStatus().name())
                .orderItems(itemResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProduct() != null ? item.getProduct().getProductName() : null)
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .build();
    }

    public void updateEntity(OrderRequest request, Order order) {
        if (request.getOrderStatus() != null) {
            try {
                order.setOrderStatus(OrderStatus.valueOf(request.getOrderStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Keep existing status if invalid
            }
        }
    }
}