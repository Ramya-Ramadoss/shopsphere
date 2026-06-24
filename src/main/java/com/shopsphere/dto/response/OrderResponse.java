package com.shopsphere.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private Long id;

    private Long customerId;

    private LocalDateTime orderDate;

    private BigDecimal totalAmount;

    private String orderStatus;

    private List<OrderItemResponse> orderItems;

    private PaymentResponse payment;

    private InvoiceResponse invoice;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}