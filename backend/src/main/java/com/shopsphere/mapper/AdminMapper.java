package com.shopsphere.mapper;

import com.shopsphere.dto.request.AdminRequest;
import com.shopsphere.dto.response.AdminResponse;
import com.shopsphere.entity.Admin;
import org.springframework.stereotype.Component;

@Component
public class AdminMapper {

    public Admin toEntity(AdminRequest request) {

        Admin admin = new Admin();

        admin.setFullName(request.getFullName());
        admin.setEmail(request.getEmail());
        admin.setPassword(request.getPassword());

        return admin;
    }

    public AdminResponse toResponse(Admin admin) {

        return AdminResponse.builder()
                .id(admin.getId())
                .fullName(admin.getFullName())
                .email(admin.getEmail())
                .role(admin.getRole())
                .createdAt(admin.getCreatedAt())
                .updatedAt(admin.getUpdatedAt())
                .build();
    }

    public void updateEntity(AdminRequest request, Admin admin) {

        admin.setFullName(request.getFullName());
        admin.setEmail(request.getEmail());
        admin.setPassword(request.getPassword());
    }
}