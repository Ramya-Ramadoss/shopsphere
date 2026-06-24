package com.shopsphere.service;

import com.shopsphere.dto.response.AdminDashboardResponse;
import com.shopsphere.dto.response.CustomerDashboardResponse;

public interface DashboardService {

    CustomerDashboardResponse getCustomerDashboard(Long customerId);

    AdminDashboardResponse getAdminDashboard();
}
