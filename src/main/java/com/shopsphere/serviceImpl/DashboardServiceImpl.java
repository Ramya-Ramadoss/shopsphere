package com.shopsphere.serviceImpl;

import com.shopsphere.dto.response.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
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
        // 1. Grid Statistics
        BigDecimal totalRevenue = orderRepository.findAll().stream()
                .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal deliveryChargesCollected = orderRepository.findAll().stream()
                .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED)
                .map(o -> o.getDeliveryCharge() != null ? o.getDeliveryCharge() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = orderRepository.count();
        long totalCustomers = customerRepository.count();
        long totalProducts = productRepository.findByDeletedFalse().size();
        long activeProducts = productRepository.findByDeletedFalse().stream().filter(p -> p.getActive() != null && p.getActive()).count();
        long premiumProducts = productRepository.findByDeletedFalse().stream().filter(p -> p.getPremium() != null && p.getPremium()).count();

        java.time.LocalDateTime startOfToday = java.time.LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        long ordersToday = orderRepository.findAll().stream()
                .filter(o -> o.getOrderDate() != null && o.getOrderDate().isAfter(startOfToday))
                .count();

        long pendingOrders = orderRepository.countByOrderStatus(OrderStatus.PENDING);
        long deliveredOrders = orderRepository.countByOrderStatus(OrderStatus.DELIVERED);
        long cancelledOrders = orderRepository.countByOrderStatus(OrderStatus.CANCELLED);

        java.time.LocalDateTime startOfSevenDaysAgo = java.time.LocalDateTime.now().minusDays(7);
        long newCustomers = customerRepository.findAll().stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(startOfSevenDaysAgo))
                .count();

        long lowStockProducts = inventoryRepository.countByQuantityLessThan(10);
        long outOfStockProducts = inventoryRepository.findAll().stream()
                .filter(i -> i.getQuantity() <= 0 && i.getProduct() != null && !i.getProduct().getDeleted())
                .count();

        long pendingApprovalProducts = productRepository.findByDeletedFalse().stream()
                .filter(p -> p.getApproved() != null && !p.getApproved())
                .count();

        long trashProductsCount = productRepository.findByDeletedTrue().size();
        long lowReviewProductsCount = productRepository.findProductsAwaitingReviewVerification().size();

        // Calculate Most/Least Ordered and Top Category
        List<OrderItem> allOrderItems = orderItemRepository.findAll();
        Map<Product, Integer> productQuantities = allOrderItems.stream()
                .filter(oi -> oi.getProduct() != null && oi.getOrder() != null && oi.getOrder().getOrderStatus() != OrderStatus.CANCELLED)
                .collect(Collectors.groupingBy(OrderItem::getProduct, Collectors.summingInt(OrderItem::getQuantity)));

        String mostOrderedProduct = "None";
        String leastOrderedProduct = "None";
        if (!productQuantities.isEmpty()) {
            mostOrderedProduct = productQuantities.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(e -> e.getKey().getProductName())
                    .orElse("None");
            leastOrderedProduct = productQuantities.entrySet().stream()
                    .min(Map.Entry.comparingByValue())
                    .map(e -> e.getKey().getProductName())
                    .orElse("None");
        }

        Map<String, Integer> categoryQuantities = allOrderItems.stream()
                .filter(oi -> oi.getProduct() != null && oi.getProduct().getCategory() != null && oi.getOrder() != null && oi.getOrder().getOrderStatus() != OrderStatus.CANCELLED)
                .collect(Collectors.groupingBy(oi -> oi.getProduct().getCategory().getName(), Collectors.summingInt(OrderItem::getQuantity)));

        String topCategory = "None";
        if (!categoryQuantities.isEmpty()) {
            topCategory = categoryQuantities.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("None");
        }

        // 2. Charts Data
        List<Map<String, Object>> dailyOrdersChart = new ArrayList<>();
        java.time.format.DateTimeFormatter dayFormatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDateTime day = java.time.LocalDateTime.now().minusDays(i);
            String dayStr = day.format(dayFormatter);
            long count = orderRepository.findAll().stream()
                    .filter(o -> o.getOrderDate() != null && o.getOrderDate().format(dayFormatter).equals(dayStr))
                    .count();
            Map<String, Object> point = new HashMap<>();
            point.put("date", dayStr);
            point.put("orders", count);
            dailyOrdersChart.add(point);
        }

        List<Map<String, Object>> monthlyOrdersChart = new ArrayList<>();
        java.time.format.DateTimeFormatter monthFormatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM");
        for (int i = 5; i >= 0; i--) {
            java.time.LocalDateTime month = java.time.LocalDateTime.now().minusMonths(i);
            String monthStr = month.format(monthFormatter);
            long count = orderRepository.findAll().stream()
                    .filter(o -> o.getOrderDate() != null && o.getOrderDate().format(monthFormatter).equals(monthStr))
                    .count();
            Map<String, Object> point = new HashMap<>();
            point.put("month", monthStr);
            point.put("orders", count);
            monthlyOrdersChart.add(point);
        }

        List<Map<String, Object>> categoryDistributionChart = new ArrayList<>();
        Map<String, Long> categoryCount = productRepository.findByDeletedFalse().stream()
                .filter(p -> p.getCategory() != null)
                .collect(Collectors.groupingBy(p -> p.getCategory().getName(), Collectors.counting()));
        categoryCount.forEach((name, count) -> {
            Map<String, Object> point = new HashMap<>();
            point.put("category", name);
            point.put("value", count);
            categoryDistributionChart.add(point);
        });

        List<Map<String, Object>> productSalesChart = new ArrayList<>();
        productQuantities.entrySet().stream()
                .sorted(Map.Entry.<Product, Integer>comparingByValue().reversed())
                .limit(5)
                .forEach(entry -> {
                    Map<String, Object> point = new HashMap<>();
                    point.put("name", entry.getKey().getProductName());
                    point.put("sales", entry.getValue());
                    productSalesChart.add(point);
                });

        List<Map<String, Object>> customerGrowthChart = new ArrayList<>();
        long cumulative = customerRepository.findAll().stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isBefore(java.time.LocalDateTime.now().minusDays(6)))
                .count();
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDateTime day = java.time.LocalDateTime.now().minusDays(i);
            String dayStr = day.format(dayFormatter);
            long signups = customerRepository.findAll().stream()
                    .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().format(dayFormatter).equals(dayStr))
                    .count();
            cumulative += signups;
            Map<String, Object> point = new HashMap<>();
            point.put("date", dayStr);
            point.put("customers", cumulative);
            customerGrowthChart.add(point);
        }

        List<Map<String, Object>> revenueTrendChart = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDateTime day = java.time.LocalDateTime.now().minusDays(i);
            String dayStr = day.format(dayFormatter);
            BigDecimal dailyRev = orderRepository.findAll().stream()
                    .filter(o -> o.getOrderStatus() != OrderStatus.CANCELLED)
                    .filter(o -> o.getOrderDate() != null && o.getOrderDate().format(dayFormatter).equals(dayStr))
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            Map<String, Object> point = new HashMap<>();
            point.put("date", dayStr);
            point.put("revenue", dailyRev);
            revenueTrendChart.add(point);
        }

        // 3. Lists (top selling products based on OrderItem sales)
        List<Object[]> topSellingData = orderItemRepository.findTopSellingProducts(PageRequest.of(0, 5));
        List<ProductResponse> topSellingProducts = topSellingData.stream()
                .map(data -> {
                    Long productId = (Long) data[0];
                    Product product = productRepository.findById(productId).orElse(null);
                    return product != null ? productMapper.toResponse(product) : null;
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());

        List<OrderResponse> recentOrders = orderRepository.findTop10ByOrderByOrderDateDesc()
                .stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());

        return AdminDashboardResponse.builder()
                .totalRevenue(totalRevenue)
                .deliveryChargesCollected(deliveryChargesCollected)
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .premiumProducts(premiumProducts)
                .ordersToday(ordersToday)
                .pendingOrders(pendingOrders)
                .deliveredOrders(deliveredOrders)
                .cancelledOrders(cancelledOrders)
                .newCustomers(newCustomers)
                .lowStockProducts(lowStockProducts)
                .outOfStockProducts(outOfStockProducts)
                .pendingApprovalProducts(pendingApprovalProducts)
                .trashProductsCount(trashProductsCount)
                .lowReviewProductsCount(lowReviewProductsCount)
                .mostOrderedProduct(mostOrderedProduct)
                .leastOrderedProduct(leastOrderedProduct)
                .topCategory(topCategory)
                .dailyOrdersChart(dailyOrdersChart)
                .monthlyOrdersChart(monthlyOrdersChart)
                .categoryDistributionChart(categoryDistributionChart)
                .productSalesChart(productSalesChart)
                .customerGrowthChart(customerGrowthChart)
                .revenueTrendChart(revenueTrendChart)
                .topSellingProducts(topSellingProducts)
                .recentOrders(recentOrders)
                .build();
    }
}
