package com.shopsphere.controller;

import com.shopsphere.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueReport() {
        Map<String, Object> response = reportService.getRevenueReport();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sales")
    public ResponseEntity<Map<String, Object>> getSalesReport() {
        Map<String, Object> response = reportService.getSalesReport();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/inventory")
    public ResponseEntity<Map<String, Object>> getInventoryReport() {
        Map<String, Object> response = reportService.getInventoryReport();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/category-sales")
    public ResponseEntity<Map<String, Object>> getCategorySalesReport() {
        Map<String, Object> response = reportService.getCategorySalesReport();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/monthly-orders")
    public ResponseEntity<Map<String, Object>> getMonthlyOrdersReport() {
        Map<String, Object> response = reportService.getMonthlyOrdersReport();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/customer-stats")
    public ResponseEntity<Map<String, Object>> getCustomerStatistics() {
        Map<String, Object> response = reportService.getCustomerStatistics();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/top-selling")
    public ResponseEntity<Map<String, Object>> getTopSellingProducts() {
        Map<String, Object> response = reportService.getTopSellingProducts();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/top-customers")
    public ResponseEntity<Map<String, Object>> getTopCustomers() {
        Map<String, Object> response = reportService.getTopCustomers();
        return ResponseEntity.ok(response);
    }
}
