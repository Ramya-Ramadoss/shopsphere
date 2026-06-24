package com.shopsphere.repository;

import com.shopsphere.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByCustomerId(Long customerId);

    long countByCustomerIdAndIsReadFalse(Long customerId);

}