package com.shopsphere.controller;

import com.shopsphere.dto.response.NotificationResponse;
import com.shopsphere.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByCustomer(@PathVariable Long customerId) {
        List<NotificationResponse> notifications = notificationService.getNotificationsByCustomer(customerId);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/read/{id}")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/unread-count/{customerId}")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long customerId) {
        long count = notificationService.getUnreadCount(customerId);
        return ResponseEntity.ok(count);
    }
}
