package com.shopsphere.serviceImpl;

import com.shopsphere.dto.request.AdminRequest;
import com.shopsphere.dto.response.AdminResponse;
import com.shopsphere.entity.Admin;
import com.shopsphere.exception.DuplicateResourceException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.AdminMapper;
import com.shopsphere.repository.AdminRepository;
import com.shopsphere.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final AdminMapper adminMapper;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    public AdminResponse createAdmin(AdminRequest request) {

        if (adminRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }

        Admin admin = adminMapper.toEntity(request);
        admin.setRole(com.shopsphere.enums.Role.ADMIN);
        admin.setPassword(passwordEncoder.encode(request.getPassword()));

        return adminMapper.toResponse(adminRepository.save(admin));
    }

    @Override
    public AdminResponse getAdminById(Long id) {

        Admin admin = adminRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Admin not found"));

        return adminMapper.toResponse(admin);
    }

    @Override
    public List<AdminResponse> getAllAdmins() {

        return adminRepository.findAll()
                .stream()
                .map(adminMapper::toResponse)
                .toList();
    }

    @Override
    public AdminResponse updateAdmin(Long id, AdminRequest request) {

        Admin admin = adminRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Admin not found"));

        adminMapper.updateEntity(request, admin);
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            admin.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return adminMapper.toResponse(adminRepository.save(admin));
    }

    @Override
    public void deleteAdmin(Long id) {

        Admin admin = adminRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Admin not found"));

        adminRepository.delete(admin);
    }
}