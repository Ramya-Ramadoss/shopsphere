package com.shopsphere.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {

    private BigDecimal totalRevenue;

    private long totalOrders;

    private long totalCustomers;

    private long totalProducts;

    private long pendingOrders;

    private long deliveredOrders;

    private long cancelledOrders;

    private long lowStockProducts;

    private List<ProductResponse> topSellingProducts;

    private List<OrderResponse> recentOrders;
}
