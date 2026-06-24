package com.shopsphere.mapper;

import com.shopsphere.dto.request.CustomerRequest;
import com.shopsphere.dto.response.CustomerResponse;
import com.shopsphere.entity.Customer;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    public Customer toEntity(CustomerRequest request) {

        Customer customer = new Customer();

        customer.setFullName(request.getFullName());
        customer.setEmail(request.getEmail());
        customer.setPassword(request.getPassword());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setState(request.getState());
        customer.setPincode(request.getPincode());
        customer.setCountry(request.getCountry());

        return customer;
    }

    public CustomerResponse toResponse(Customer customer) {

        return CustomerResponse.builder()
                .id(customer.getId())
                .fullName(customer.getFullName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .city(customer.getCity())
                .state(customer.getState())
                .pincode(customer.getPincode())
                .country(customer.getCountry())
                .enabled(customer.getEnabled())
                .role(customer.getRole())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }

    public void updateEntity(CustomerRequest request, Customer customer) {

        customer.setFullName(request.getFullName());
        customer.setEmail(request.getEmail());
        customer.setPassword(request.getPassword());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setState(request.getState());
        customer.setPincode(request.getPincode());
        customer.setCountry(request.getCountry());
    }
}