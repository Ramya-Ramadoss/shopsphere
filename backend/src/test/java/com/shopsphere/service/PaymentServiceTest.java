package com.shopsphere.service;

import com.shopsphere.dto.request.PaymentRequest;
import com.shopsphere.dto.response.PaymentResponse;
import com.shopsphere.entity.*;
import com.shopsphere.enums.Role;
import com.shopsphere.mapper.PaymentMapper;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.PaymentRepository;
import com.shopsphere.serviceImpl.PaymentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentMapper paymentMapper;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private Order order;
    private Payment payment;

    @BeforeEach
    void setUp() {
        Customer customer = Customer.builder()
                .fullName("Jane Doe")
                .email("jane@test.com")
                .role(Role.CUSTOMER)
                .build();
        customer.setId(10L);

        order = new Order();
        order.setId(5L);
        order.setCustomer(customer);
        order.setTotalAmount(new BigDecimal("1500.00"));

        payment = Payment.builder()
                .order(order)
                .amount(new BigDecimal("1500.00"))
                .paymentMethod("UPI")
                .paymentStatus("SUCCESS")
                .transactionId("TXN-123456")
                .build();
    }

    @Test
    void testProcessPaymentSuccess() {
        PaymentRequest request = PaymentRequest.builder()
                .orderId(5L)
                .amount(new BigDecimal("1500.00"))
                .paymentMethod("UPI")
                .build();

        PaymentResponse mockResponse = PaymentResponse.builder()
                .id(1L)
                .amount(new BigDecimal("1500.00"))
                .paymentMethod("UPI")
                .paymentStatus("SUCCESS")
                .transactionId("TXN-123456")
                .build();

        when(orderRepository.findById(5L)).thenReturn(Optional.of(order));
        when(paymentMapper.toEntity(any(PaymentRequest.class))).thenReturn(payment);
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);
        when(paymentMapper.toResponse(any(Payment.class))).thenReturn(mockResponse);

        PaymentResponse response = paymentService.processPayment(request);

        assertNotNull(response);
        assertEquals("SUCCESS", response.getPaymentStatus());
        assertEquals("TXN-123456", response.getTransactionId());
        verify(orderRepository, times(1)).save(order);
        verify(notificationService, times(2)).createNotification(eq(10L), anyString(), anyString());
    }
}
