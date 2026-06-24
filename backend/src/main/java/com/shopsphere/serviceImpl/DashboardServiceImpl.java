package com.shopsphere.serviceImpl;

import com.shopsphere.dto.response.*;
import com.shopsphere.entity.*;
import com.shopsphere.enums.OrderStatus;
import com.shopsphere.repository.*;
import com.shopsphere.mapper.*;
import com.shopsphere.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderItemRepository orderItemRepository;
    private final WishlistRepository wishlistRepository;
    private final CartRepository cartRepository;
    private final RecentlyViewedRepository recentlyViewedRepository;

    private final OrderMapper orderMapper;
    private final ProductMapper productMapper;
    private final RecentlyViewedMapper recentlyViewedMapper;

    @Override
    public CustomerDashboardResponse getCustomerDashboard(Long customerId) {
        // 1. Recent Orders (top 5)
        List<OrderResponse> recentOrders = orderRepository.findTop5ByCustomerIdOrderByOrderDateDesc(customerId)
                .stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());

        // 2. Wishlist Count
        long wishlistCount = wishlistRepository.findByCustomerId(customerId)
                .map(w -> w.getWishlistItems() != null ? (long) w.getWishlistItems().size() : 0L)
                .orElse(0L);

        // 3. Cart Count (sum of quantity of all cart items)
        long cartCount = cartRepository.findByCustomerId(customerId)
                .map(c -> c.getCartItems() != null ? c.getCartItems().stream().mapToLong(CartItem::getQuantity).sum() : 0L)
                .orElse(0L);

        // 4. Recently Viewed (limit to 5)
        List<RecentlyViewedResponse> recentlyViewed = recentlyViewedRepository.findByCustomerId(customerId)
                .stream()
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .limit(5)
                .map(recentlyViewedMapper::toResponse)
                .collect(Collectors.toList());

        // 5. Active Orders (not Delivered or Cancelled)
        List<OrderStatus> nonActiveStatuses = List.of(OrderStatus.DELIVERED, OrderStatus.CANCELLED);
        List<OrderResponse> activeOrders = orderRepository.findByCustomerIdAndOrderStatusNotIn(customerId, nonActiveStatuses)
                .stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());

        return CustomerDashboardResponse.builder()
                .recentOrders(recentOrders)
                .wishlistCount(wishlistCount)
                .cartCount(cartCount)
                .recentlyViewed(recentlyViewed)
                .activeOrders(activeOrders)
                .build();
    }

    @Override
    public AdminDashboardResponse getAdminDashboard() {
        // 1. Total Revenue (sum of non-cancelled order totals)
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();

        // 2. Total Orders
        long totalOrders = orderRepository.count();

        // 3. Total Customers
        long totalCustomers = customerRepository.count();

        // 4. Total Products
        long totalProducts = productRepository.count();

        // 5. Order Status Counts
        long pendingOrders = orderRepository.countByOrderStatus(OrderStatus.PENDING);
        long deliveredOrders = orderRepository.countByOrderStatus(OrderStatus.DELIVERED);
        long cancelledOrders = orderRepository.countByOrderStatus(OrderStatus.CANCELLED);

        // 6. Low Stock Products (stock < 10)
        long lowStockProducts = inventoryRepository.countByQuantityLessThan(10);

        // 7. Top Selling Products (top 5 based on OrderItem sales)
        List<Object[]> topSellingData = orderItemRepository.findTopSellingProducts(PageRequest.of(0, 5));
        List<ProductResponse> topSellingProducts = topSellingData.stream()
                .map(data -> {
                    Product product = (Product) data[0];
                    return productMapper.toResponse(product);
                })
                .collect(Collectors.toList());

        // 8. Recent Orders (top 10)
        List<OrderResponse> recentOrders = orderRepository.findTop10ByOrderByOrderDateDesc()
                .stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());

        return AdminDashboardResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .totalProducts(totalProducts)
                .pendingOrders(pendingOrders)
                .deliveredOrders(deliveredOrders)
                .cancelledOrders(cancelledOrders)
                .lowStockProducts(lowStockProducts)
                .topSellingProducts(topSellingProducts)
                .recentOrders(recentOrders)
                .build();
    }
}
