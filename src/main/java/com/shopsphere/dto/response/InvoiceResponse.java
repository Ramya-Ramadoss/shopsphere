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
public class InvoiceResponse {

    private Long id;
    private String invoiceNumber;
    private Long orderId;
    private LocalDateTime orderDate;
    private String customerName;
    private String customerEmail;
    private List<OrderItemResponse> items;
    private BigDecimal taxes;
    private BigDecimal shipping;
    private BigDecimal grandTotal;
    private String paymentStatus;
    private String paymentMethod;
    private Boolean paid;
    private LocalDateTime generatedDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}