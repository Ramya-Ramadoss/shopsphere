package com.shopsphere.service;

import com.shopsphere.dto.request.PaymentRequest;
import com.shopsphere.dto.response.PaymentResponse;

public interface PaymentService {

    PaymentResponse processPayment(PaymentRequest request);

    PaymentResponse getPayment(Long orderId);
}