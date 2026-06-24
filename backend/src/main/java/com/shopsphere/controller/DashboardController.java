package com.shopsphere.controller;

import com.shopsphere.dto.response.AdminDashboardResponse;
import com.shopsphere.dto.response.CustomerDashboardResponse;
import com.shopsphere.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<CustomerDashboardResponse> getCustomerDashboard(@PathVariable Long customerId) {
        CustomerDashboardResponse response = dashboardService.getCustomerDashboard(customerId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        AdminDashboardResponse response = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(response);
    }
}
