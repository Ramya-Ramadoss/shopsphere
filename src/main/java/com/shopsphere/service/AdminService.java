package com.shopsphere.service;

import com.shopsphere.dto.request.AdminRequest;
import com.shopsphere.dto.response.AdminResponse;

import java.util.List;

public interface AdminService {

    AdminResponse createAdmin(AdminRequest request);

    AdminResponse getAdminById(Long id);

    List<AdminResponse> getAllAdmins();

    AdminResponse updateAdmin(Long id, AdminRequest request);

    void deleteAdmin(Long id);
}