package com.shopsphere.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {

    // 1. Grid Statistics
    private long totalProducts;
    private long activeProducts;
    private long premiumProducts;
    
    private long totalOrders;
    private long ordersToday;
    private long pendingOrders;
    private long deliveredOrders;
    private long cancelledOrders;
    
    private long totalCustomers;
    private long newCustomers;
    
    private BigDecimal totalRevenue;
    private BigDecimal deliveryChargesCollected;
    
    private String mostOrderedProduct;
    private String leastOrderedProduct;
    private String topCategory;
    
    private long lowStockProducts;
    private long outOfStockProducts;
    private long pendingApprovalProducts;
    private long trashProductsCount;
    private long lowReviewProductsCount;

    // 2. Charts Data
    private List<Map<String, Object>> dailyOrdersChart;
    private List<Map<String, Object>> monthlyOrdersChart;
    private List<Map<String, Object>> categoryDistributionChart;
    private List<Map<String, Object>> productSalesChart;
    private List<Map<String, Object>> customerGrowthChart;
    private List<Map<String, Object>> revenueTrendChart;

    // 3. Lists
    private List<ProductResponse> topSellingProducts;
    private List<OrderResponse> recentOrders;
}
