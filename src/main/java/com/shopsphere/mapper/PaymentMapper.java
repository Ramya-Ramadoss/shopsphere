package com.shopsphere.mapper;

import com.shopsphere.dto.request.PaymentRequest;
import com.shopsphere.dto.response.PaymentResponse;
import com.shopsphere.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public Payment toEntity(PaymentRequest request) {

        Payment payment = new Payment();

        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());

        return payment;
    }

    public PaymentResponse toResponse(Payment payment) {

        return PaymentResponse.builder()
                .id(payment.getId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .transactionId(payment.getTransactionId())
                .paymentDate(payment.getPaymentDate())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }

    public void updateEntity(PaymentRequest request, Payment payment) {

        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
    }
}