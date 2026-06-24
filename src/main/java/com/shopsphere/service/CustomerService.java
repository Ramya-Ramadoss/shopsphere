package com.shopsphere.service;

import com.shopsphere.dto.request.CustomerRequest;
import com.shopsphere.dto.response.CustomerResponse;

import java.util.List;

public interface CustomerService {

    CustomerResponse createCustomer(CustomerRequest request);

    CustomerResponse getCustomerById(Long id);

    List<CustomerResponse> getAllCustomers();

    CustomerResponse updateCustomer(Long id, CustomerRequest request);

    void deleteCustomer(Long id);
}