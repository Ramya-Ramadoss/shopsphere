package com.shopsphere.serviceImpl;

import com.shopsphere.dto.request.CustomerRequest;
import com.shopsphere.dto.response.CustomerResponse;
import com.shopsphere.entity.Customer;
import com.shopsphere.exception.DuplicateResourceException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.CustomerMapper;
import com.shopsphere.repository.CustomerRepository;
import com.shopsphere.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.shopsphere.security.JwtTokenProvider jwtTokenProvider;

    @Override
    public CustomerResponse createCustomer(CustomerRequest request) {

        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }

        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone number already exists");
        }

        Customer customer = customerMapper.toEntity(request);
        customer.setPassword(passwordEncoder.encode(request.getPassword()));

        return customerMapper.toResponse(customerRepository.save(customer));
    }

    @Override
    public CustomerResponse getCustomerById(Long id) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer not found"));

        return customerMapper.toResponse(customer);
    }

    @Override
    public List<CustomerResponse> getAllCustomers() {

        return customerRepository.findAll()
                .stream()
                .map(customerMapper::toResponse)
                .toList();
    }

    @Override
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer not found"));

        customerMapper.updateEntity(request, customer);
        if (request.getPassword() != null && !request.getPassword().isBlank() && !request.getPassword().equals("dummyPassword123!")) {
            customer.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return customerMapper.toResponse(customerRepository.save(customer));
    }

    @Override
    public void deleteCustomer(Long id) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer not found"));

        customerRepository.delete(customer);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public com.shopsphere.dto.response.AuthResponse loginOrRegisterGoogle(com.shopsphere.dto.request.GoogleLoginRequest request) {
        java.util.Optional<Customer> existingByGoogleId = customerRepository.findByGoogleId(request.getGoogleId());
        Customer customer;
        
        if (existingByGoogleId.isPresent()) {
            customer = existingByGoogleId.get();
        } else {
            java.util.Optional<Customer> existingByEmail = customerRepository.findByEmail(request.getEmail());
            if (existingByEmail.isPresent()) {
                customer = existingByEmail.get();
                customer.setGoogleId(request.getGoogleId());
                if (request.getProfileImage() != null) {
                    customer.setProfileImage(request.getProfileImage());
                }
                customer = customerRepository.save(customer);
            } else {
                customer = new Customer();
                customer.setFullName(request.getName());
                customer.setEmail(request.getEmail());
                customer.setGoogleId(request.getGoogleId());
                customer.setProfileImage(request.getProfileImage());
                
                customer.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
                
                String dummyPhone;
                do {
                    dummyPhone = "9" + String.format("%09d", new java.util.Random().nextInt(1000000000));
                } while (customerRepository.existsByPhone(dummyPhone));
                customer.setPhone(dummyPhone);
                customer.setEnabled(true);
                customer.setRole(com.shopsphere.enums.Role.CUSTOMER);
                customer.setCountry("India");
                customer.setCity("Unknown");
                customer.setState("Unknown");
                
                customer = customerRepository.save(customer);
                
                com.shopsphere.entity.Cart cart = new com.shopsphere.entity.Cart();
                cart.setCustomer(customer);
                cart.setActive(true);
                customer.setCart(cart);
                
                com.shopsphere.entity.Wishlist wishlist = new com.shopsphere.entity.Wishlist();
                wishlist.setCustomer(customer);
                wishlist.setActive(true);
                customer.setWishlist(wishlist);
                
                customer = customerRepository.save(customer);
            }
        }
        
        com.shopsphere.security.CustomUserDetails userDetails = new com.shopsphere.security.CustomUserDetails(
                customer.getId(),
                customer.getEmail(),
                customer.getPassword(),
                customer.getRole(),
                customer.getFullName()
        );
        
        String token = jwtTokenProvider.generateToken(userDetails);
        
        return com.shopsphere.dto.response.AuthResponse.builder()
                .token(token)
                .id(customer.getId())
                .email(customer.getEmail())
                .fullName(customer.getFullName())
                .role(customer.getRole().name())
                .build();
    }
}