package com.shopsphere.serviceImpl;

import com.shopsphere.dto.response.InvoiceResponse;
import com.shopsphere.entity.Invoice;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.OrderItem;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.mapper.InvoiceMapper;
import com.shopsphere.repository.InvoiceRepository;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final InvoiceMapper invoiceMapper;

    @Override
    public InvoiceResponse getInvoiceByOrderId(Long orderId) {
        Invoice invoice = invoiceRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for order ID " + orderId));
        return invoiceMapper.toResponse(invoice);
    }

    @Override
    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID " + id));
        return invoiceMapper.toResponse(invoice);
    }

    @Override
    @Transactional
    public InvoiceResponse generateInvoice(Long orderId) {
        Optional<Invoice> existing = invoiceRepository.findByOrderId(orderId);
        if (existing.isPresent()) {
            return invoiceMapper.toResponse(existing.get());
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID " + orderId));

        BigDecimal subtotal = order.getTotalAmount();
        BigDecimal taxes = subtotal.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal shipping = subtotal.compareTo(new BigDecimal("2000.00")) > 0 ? BigDecimal.ZERO : new BigDecimal("100.00");
        BigDecimal grandTotal = subtotal.add(taxes).add(shipping).setScale(2, RoundingMode.HALF_UP);

        String invoiceNumber = "INV-" + orderId + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        boolean paid = false;
        if (order.getPayment() != null && "SUCCESS".equalsIgnoreCase(order.getPayment().getPaymentStatus())) {
            paid = true;
        }

        Invoice invoice = Invoice.builder()
                .order(order)
                .invoiceNumber(invoiceNumber)
                .taxes(taxes)
                .shipping(shipping)
                .totalAmount(grandTotal)
                .paid(paid)
                .generatedDate(LocalDateTime.now())
                .build();

        Invoice saved = invoiceRepository.save(invoice);
        
        order.setInvoice(saved);
        orderRepository.save(order);

        return invoiceMapper.toResponse(saved);
    }

    @Override
    public byte[] downloadInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID " + id));

        Order order = invoice.getOrder();
        StringBuilder sb = new StringBuilder();
        sb.append("==================================================\n");
        sb.append("                 SHOPSPHERE INVOICE               \n");
        sb.append("==================================================\n");
        sb.append("Invoice Number : ").append(invoice.getInvoiceNumber()).append("\n");
        sb.append("Generated Date : ").append(invoice.getGeneratedDate()).append("\n");
        sb.append("Payment Status : ").append(invoice.getPaid() ? "PAID" : "PENDING/UNPAID").append("\n");
        if (order != null) {
            sb.append("Order ID       : ").append(order.getId()).append("\n");
            sb.append("Order Status   : ").append(order.getOrderStatus()).append("\n");
            if (order.getCustomer() != null) {
                sb.append("Customer Name  : ").append(order.getCustomer().getFullName()).append("\n");
                sb.append("Customer Email : ").append(order.getCustomer().getEmail()).append("\n");
            }
            sb.append("--------------------------------------------------\n");
            sb.append(String.format("%-25s %-5s %-10s %-10s\n", "Product", "Qty", "Price", "Subtotal"));
            sb.append("--------------------------------------------------\n");
            if (order.getOrderItems() != null) {
                for (OrderItem item : order.getOrderItems()) {
                    String prodName = item.getProduct() != null ? item.getProduct().getProductName() : "Unknown Product";
                    if (prodName.length() > 24) {
                        prodName = prodName.substring(0, 21) + "...";
                    }
                    sb.append(String.format("%-25s %-5d %-10.2f %-10.2f\n", 
                            prodName, item.getQuantity(), item.getUnitPrice(), item.getSubtotal()));
                }
            }
            sb.append("--------------------------------------------------\n");
            sb.append(String.format("%-32s: %10.2f\n", "Order Subtotal", order.getTotalAmount()));
            sb.append(String.format("%-32s: %10.2f\n", "Taxes (GST 18%)", invoice.getTaxes()));
            sb.append(String.format("%-32s: %10.2f\n", "Shipping Fee", invoice.getShipping()));
            sb.append("--------------------------------------------------\n");
            sb.append(String.format("%-32s: %10.2f\n", "Grand Total", invoice.getTotalAmount()));
        }
        sb.append("==================================================\n");
        sb.append("            Thank you for shopping with us!       \n");
        sb.append("==================================================\n");

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }
}