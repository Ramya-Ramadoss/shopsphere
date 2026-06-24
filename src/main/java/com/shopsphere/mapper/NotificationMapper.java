package com.shopsphere.mapper;

import com.shopsphere.dto.response.NotificationResponse;
import com.shopsphere.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationResponse toResponse(Notification notification) {

        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .sentAt(notification.getSentAt())
                .build();
    }
}