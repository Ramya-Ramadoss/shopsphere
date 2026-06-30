package com.shopsphere.serviceImpl;

import com.shopsphere.entity.*;
import com.shopsphere.enums.OrderStatus;
import com.shopsphere.repository.*;
import com.shopsphere.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public Map<String, Object> getRevenueReport() {
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        long totalOrders = orderRepository.count();

        BigDecimal codTotal = BigDecimal.ZERO;
        BigDecimal onlineTotal = BigDecimal.ZERO;

        List<Order> orders = orderRepository.findAll();
        for (Order o : orders) {
            if (o.getOrderStatus() == OrderStatus.CANCELLED) continue;
            Payment p = o.getPayment();
            if (p != null) {
                if ("CASH_ON_DELIVERY".equalsIgnoreCase(p.getPaymentMethod()) || "COD".equalsIgnoreCase(p.getPaymentMethod())) {
                    codTotal = codTotal.add(o.getTotalAmount());
                } else if ("SUCCESS".equalsIgnoreCase(p.getPaymentStatus())) {
                    onlineTotal = onlineTotal.add(o.getTotalAmount());
                }
            }
        }

        BigDecimal aov = BigDecimal.ZERO;
        if (totalOrders > 0) {
            aov = totalRevenue.divide(new BigDecimal(totalOrders), 2, RoundingMode.HALF_UP);
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("totalRevenue", totalRevenue);
        report.put("totalOrdersCount", totalOrders);
        report.put("codRevenue", codTotal);
        report.put("onlineRevenue", onlineTotal);
        report.put("averageOrderValue", aov);

        return report;
    }

    @Override
    public Map<String, Object> getSalesReport() {
        List<Order> orders = orderRepository.findAll();
        long totalOrders = orders.size();
        long totalItemsSold = 0;
        BigDecimal totalSalesAmount = BigDecimal.ZERO;

        for (Order o : orders) {
            if (o.getOrderStatus() == OrderStatus.CANCELLED) continue;
            totalSalesAmount = totalSalesAmount.add(o.getTotalAmount());
            if (o.getOrderItems() != null) {
                totalItemsSold += o.getOrderItems().stream().mapToLong(OrderItem::getQuantity).sum();
            }
        }

        double avgItemsPerOrder = 0;
        if (totalOrders > 0) {
            avgItemsPerOrder = (double) totalItemsSold / totalOrders;
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("totalOrders", totalOrders);
        report.put("totalItemsSold", totalItemsSold);
        report.put("totalSalesAmount", totalSalesAmount);
        report.put("averageItemsPerOrder", Math.round(avgItemsPerOrder * 100.0) / 100.0);

        return report;
    }

    @Override
    public Map<String, Object> getInventoryReport() {
        long totalProducts = productRepository.count();
        long lowStockCount = inventoryRepository.countByQuantityLessThan(10);

        BigDecimal totalStockValue = BigDecimal.ZERO;
        List<Inventory> inventories = inventoryRepository.findAll();
        for (Inventory inv : inventories) {
            Product p = inv.getProduct();
            if (p != null) {
                BigDecimal value = p.getPrice().multiply(new BigDecimal(inv.getQuantity()));
                totalStockValue = totalStockValue.add(value);
            }
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("totalProductCatalogCount", totalProducts);
        report.put("lowStockCount", lowStockCount);
        report.put("totalInventoryAssetValue", totalStockValue);

        return report;
    }

    @Override
    public Map<String, Object> getCategorySalesReport() {
        List<Object[]> categorySalesData = orderItemRepository.getCategorySalesData();
        List<Map<String, Object>> categoryList = new ArrayList<>();

        for (Object[] row : categorySalesData) {
            Map<String, Object> categoryMap = new LinkedHashMap<>();
            categoryMap.put("categoryName", row[0]);
            categoryMap.put("unitsSold", row[1]);
            categoryMap.put("revenueGenerated", row[2]);
            categoryList.add(categoryMap);
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("categorySalesBreakdown", categoryList);
        return report;
    }

    @Override
    public Map<String, Object> getMonthlyOrdersReport() {
        List<Order> orders = orderRepository.findAll();
        Map<String, Long> monthlyCounts = new TreeMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        for (Order o : orders) {
            String month = o.getOrderDate().format(formatter);
            monthlyCounts.put(month, monthlyCounts.getOrDefault(month, 0L) + 1L);
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("monthlyOrdersBreakdown", monthlyCounts);
        return report;
    }

    @Override
    public Map<String, Object> getCustomerStatistics() {
        long totalCustomers = customerRepository.count();
        long totalOrders = orderRepository.count();
        
        double avgOrdersPerCustomer = 0;
        if (totalCustomers > 0) {
            avgOrdersPerCustomer = (double) totalOrders / totalCustomers;
        }

        List<Object[]> topCustData = orderRepository.getTopCustomersData(PageRequest.of(0, 1));
        String topCustomerName = "N/A";
        BigDecimal topCustomerSpend = BigDecimal.ZERO;
        
        if (!topCustData.isEmpty()) {
            Customer c = (Customer) topCustData.get(0)[0];
            topCustomerName = c.getFullName();
            topCustomerSpend = (BigDecimal) topCustData.get(0)[2];
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("totalCustomersCount", totalCustomers);
        report.put("averageOrdersPerCustomer", Math.round(avgOrdersPerCustomer * 100.0) / 100.0);
        report.put("topCustomerName", topCustomerName);
        report.put("topCustomerTotalSpending", topCustomerSpend);

        return report;
    }

    @Override
    public Map<String, Object> getTopSellingProducts() {
        List<Object[]> topSellingData = orderItemRepository.findTopSellingProducts(PageRequest.of(0, 5));
        List<Map<String, Object>> productList = new ArrayList<>();

        for (Object[] row : topSellingData) {
            Long productId = (Long) row[0];
            Long totalSold = (Long) row[1];
            Product p = productRepository.findById(productId).orElse(null);
            if (p != null) {
                Map<String, Object> pMap = new java.util.LinkedHashMap<>();
                pMap.put("productId", p.getId());
                pMap.put("productName", p.getProductName());
                pMap.put("brand", p.getBrand());
                pMap.put("price", p.getPrice());
                pMap.put("totalUnitsSold", totalSold);
                productList.add(pMap);
            }
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("topSellingProducts", productList);
        return report;
    }

    @Override
    public Map<String, Object> getTopCustomers() {
        List<Object[]> topCustData = orderRepository.getTopCustomersData(PageRequest.of(0, 5));
        List<Map<String, Object>> customerList = new ArrayList<>();

        for (Object[] row : topCustData) {
            Customer c = (Customer) row[0];
            Long orderCount = (Long) row[1];
            BigDecimal spent = (BigDecimal) row[2];

            Map<String, Object> cMap = new LinkedHashMap<>();
            cMap.put("customerId", c.getId());
            cMap.put("customerName", c.getFullName());
            cMap.put("customerEmail", c.getEmail());
            cMap.put("totalOrdersCount", orderCount);
            cMap.put("totalAmountSpent", spent);
            customerList.add(cMap);
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("topCustomers", customerList);
        return report;
    }
}
