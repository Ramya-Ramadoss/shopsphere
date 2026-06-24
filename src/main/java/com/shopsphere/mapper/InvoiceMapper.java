package com.shopsphere.mapper;

import com.shopsphere.dto.response.InvoiceResponse;
import com.shopsphere.dto.response.OrderItemResponse;
import com.shopsphere.entity.Invoice;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.OrderItem;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class InvoiceMapper {

    public InvoiceResponse toResponse(Invoice invoice) {
        Order order = invoice.getOrder();
        
        List<OrderItemResponse> itemResponses = null;
        String customerName = null;
        String customerEmail = null;
        String paymentStatus = "PENDING";
        String paymentMethod = "N/A";
        java.time.LocalDateTime orderDate = null;
        
        if (order != null) {
            orderDate = order.getOrderDate();
            if (order.getCustomer() != null) {
                customerName = order.getCustomer().getFullName();
                customerEmail = order.getCustomer().getEmail();
            }
            if (order.getOrderItems() != null) {
                itemResponses = order.getOrderItems().stream()
                        .map(this::toItemResponse)
                        .collect(Collectors.toList());
            }
            if (order.getPayment() != null) {
                paymentStatus = order.getPayment().getPaymentStatus();
                paymentMethod = order.getPayment().getPaymentMethod();
            }
        }

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .orderId(order != null ? order.getId() : null)
                .orderDate(orderDate)
                .customerName(customerName)
                .customerEmail(customerEmail)
                .items(itemResponses)
                .taxes(invoice.getTaxes())
                .shipping(invoice.getShipping())
                .grandTotal(invoice.getTotalAmount())
                .paymentStatus(paymentStatus)
                .paymentMethod(paymentMethod)
                .paid(invoice.getPaid())
                .generatedDate(invoice.getGeneratedDate())
                .createdAt(invoice.getCreatedAt())
                .updatedAt(invoice.getUpdatedAt())
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
}