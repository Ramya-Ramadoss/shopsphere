package com.shopsphere.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;

    @Builder.Default
    private LocalDateTime generatedDate = LocalDateTime.now();

    @Builder.Default
    private Boolean paid = false;

    @Column(precision = 10, scale = 2)
    private java.math.BigDecimal taxes;

    @Column(precision = 10, scale = 2)
    private java.math.BigDecimal shipping;

    @Column(precision = 10, scale = 2)
    private java.math.BigDecimal totalAmount;
}