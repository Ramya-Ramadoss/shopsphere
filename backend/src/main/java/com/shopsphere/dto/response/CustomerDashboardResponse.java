package com.shopsphere.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDashboardResponse {

    private List<OrderResponse> recentOrders;

    private long wishlistCount;

    private long cartCount;

    private List<RecentlyViewedResponse> recentlyViewed;

    private List<OrderResponse> activeOrders;
}
