package com.shopsphere.serviceImpl;

import com.shopsphere.dto.response.NotificationResponse;
import com.shopsphere.entity.Customer;
import com.shopsphere.entity.Notification;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.NotificationMapper;
import com.shopsphere.repository.CustomerRepository;
import com.shopsphere.repository.NotificationRepository;
import com.shopsphere.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final CustomerRepository customerRepository;
    private final NotificationMapper notificationMapper;

    @Override
    public List<NotificationResponse> getNotificationsByCustomer(Long customerId) {
        return notificationRepository.findByCustomerId(customerId)
                .stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    @Override
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void deleteNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Notification not found"));
        notificationRepository.delete(notification);
    }

    @Override
    public long getUnreadCount(Long customerId) {
        return notificationRepository.countByCustomerIdAndIsReadFalse(customerId);
    }

    @Override
    public void createNotification(Long customerId, String title, String message) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer not found"));
        Notification notification = Notification.builder()
                .customer(customer)
                .title(title)
                .message(message)
                .isRead(false)
                .sentAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);
    }
}