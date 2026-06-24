package com.shopsphere.security;

import com.shopsphere.entity.Admin;
import com.shopsphere.entity.Customer;
import com.shopsphere.repository.AdminRepository;
import com.shopsphere.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final CustomerRepository customerRepository;
    private final AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // First try to find in Admin table
        Optional<Admin> adminOpt = adminRepository.findByEmail(username);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            return new CustomUserDetails(
                    admin.getId(),
                    admin.getEmail(),
                    admin.getPassword(),
                    admin.getRole(),
                    admin.getFullName()
            );
        }

        // If not found in Admin, try Customer table
        Optional<Customer> customerOpt = customerRepository.findByEmail(username);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            return new CustomUserDetails(
                    customer.getId(),
                    customer.getEmail(),
                    customer.getPassword(),
                    customer.getRole(),
                    customer.getFullName()
            );
        }

        throw new UsernameNotFoundException("User not found with email: " + username);
    }
}
