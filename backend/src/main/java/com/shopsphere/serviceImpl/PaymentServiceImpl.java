package com.shopsphere.serviceImpl;

import com.shopsphere.dto.request.PaymentRequest;
import com.shopsphere.dto.response.PaymentResponse;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.Payment;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.mapper.PaymentMapper;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.PaymentRepository;
import com.shopsphere.service.PaymentService;
import com.shopsphere.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentMapper paymentMapper;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        log.info("Initiating payment processing for order ID: {}, amount: {}, method: {}", 
                request.getOrderId(), request.getAmount(), request.getPaymentMethod());
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getPayment() != null && "SUCCESS".equalsIgnoreCase(order.getPayment().getPaymentStatus())) {
            throw new BadRequestException("Order is already paid");
        }

        String rawMethod = request.getPaymentMethod();
        if (rawMethod == null || rawMethod.trim().isEmpty()) {
            throw new BadRequestException("Payment method is required");
        }

        String method = rawMethod.trim().toUpperCase();
        if (!method.equals("UPI") && !method.equals("CREDIT_CARD") && 
            !method.equals("DEBIT_CARD") && !method.equals("NET_BANKING") && 
            !method.equals("CASH_ON_DELIVERY") && !method.equals("COD")) {
            throw new BadRequestException("Unsupported payment method: " + rawMethod);
        }

        if (method.equals("COD")) {
            method = "CASH_ON_DELIVERY";
        }

        Payment payment = paymentMapper.toEntity(request);
        payment.setOrder(order);
        payment.setPaymentMethod(method);
        payment.setPaymentDate(LocalDateTime.now());
        
        // Generate Transaction ID automatically
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 13).toUpperCase();
        payment.setTransactionId(transactionId);

        // Determine Payment Status
        String status;
        if (method.equals("CASH_ON_DELIVERY")) {
            status = "PENDING";
            order.setOrderStatus(com.shopsphere.enums.OrderStatus.CONFIRMED);
        } else if (request.getAmount() == null || request.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            status = "FAILED";
            order.setOrderStatus(com.shopsphere.enums.OrderStatus.PENDING);
        } else {
            status = "SUCCESS";
            order.setOrderStatus(com.shopsphere.enums.OrderStatus.CONFIRMED);
        }
        
        payment.setPaymentStatus(status);
        Payment savedPayment = paymentRepository.save(payment);
        
        order.setPayment(savedPayment);
        orderRepository.save(order);

        // Trigger Notifications
        Long customerId = order.getCustomer().getId();
        if ("SUCCESS".equals(status)) {
            notificationService.createNotification(customerId, "Payment Success", 
                    "Your payment of " + payment.getAmount() + " for order #" + order.getId() + " was successful. Transaction ID: " + transactionId);
            notificationService.createNotification(customerId, "Order Confirmed", 
                    "Your order #" + order.getId() + " has been confirmed and is being processed.");
        } else if ("FAILED".equals(status)) {
            notificationService.createNotification(customerId, "Payment Failed", 
                    "Your payment of " + payment.getAmount() + " for order #" + order.getId() + " failed.");
        } else {
            notificationService.createNotification(customerId, "Order Placed", 
                    "Your order #" + order.getId() + " is placed successfully with Cash on Delivery option.");
        }

        return paymentMapper.toResponse(savedPayment);
    }

    @Override
    public PaymentResponse getPayment(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order ID " + orderId));
        return paymentMapper.toResponse(payment);
    }
}