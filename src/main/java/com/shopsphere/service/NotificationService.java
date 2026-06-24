package com.shopsphere.service;

import com.shopsphere.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {

    List<NotificationResponse> getNotificationsByCustomer(Long customerId);

    void markAsRead(Long notificationId);

    void deleteNotification(Long notificationId);

    long getUnreadCount(Long customerId);

    void createNotification(Long customerId, String title, String message);
}