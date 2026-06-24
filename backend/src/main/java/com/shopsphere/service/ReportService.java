package com.shopsphere.service;

import java.util.Map;

public interface ReportService {

    Map<String, Object> getRevenueReport();

    Map<String, Object> getSalesReport();

    Map<String, Object> getInventoryReport();

    Map<String, Object> getCategorySalesReport();

    Map<String, Object> getMonthlyOrdersReport();

    Map<String, Object> getCustomerStatistics();

    Map<String, Object> getTopSellingProducts();

    Map<String, Object> getTopCustomers();
}
