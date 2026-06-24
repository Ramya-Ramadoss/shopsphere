package com.shopsphere.repository;

import com.shopsphere.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import com.shopsphere.enums.OrderStatus;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerId(Long customerId);

    List<Order> findTop5ByCustomerIdOrderByOrderDateDesc(Long customerId);

    List<Order> findByCustomerIdAndOrderStatusNotIn(Long customerId, List<OrderStatus> statuses);

    List<Order> findTop10ByOrderByOrderDateDesc();

    long countByOrderStatus(OrderStatus orderStatus);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.orderStatus <> com.shopsphere.enums.OrderStatus.CANCELLED")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT o.customer, COUNT(o), SUM(o.totalAmount) FROM Order o WHERE o.orderStatus <> com.shopsphere.enums.OrderStatus.CANCELLED GROUP BY o.customer ORDER BY SUM(o.totalAmount) DESC")
    List<Object[]> getTopCustomersData(org.springframework.data.domain.Pageable pageable);

}