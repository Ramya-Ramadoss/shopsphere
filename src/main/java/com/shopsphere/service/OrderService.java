package com.shopsphere.service;

import com.shopsphere.dto.request.OrderRequest;
import com.shopsphere.dto.response.OrderResponse;

import java.util.List;

public interface OrderService {

    OrderResponse placeOrder(OrderRequest request);

    OrderResponse getOrderById(Long id);

    List<OrderResponse> getOrdersByCustomer(Long customerId);

    void cancelOrder(Long id);

    List<OrderResponse> getAllOrders();

    OrderResponse updateOrderStatus(Long orderId, String status);
}