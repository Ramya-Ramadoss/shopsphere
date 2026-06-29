package com.shopsphere.service;

import com.shopsphere.entity.Order;

public interface EmailService {
    void sendOrderConfirmationEmail(Order order);
}
