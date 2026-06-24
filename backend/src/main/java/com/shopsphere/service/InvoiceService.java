package com.shopsphere.service;

import com.shopsphere.dto.response.InvoiceResponse;

public interface InvoiceService {

    InvoiceResponse getInvoiceByOrderId(Long orderId);

    InvoiceResponse getInvoiceById(Long id);

    InvoiceResponse generateInvoice(Long orderId);

    byte[] downloadInvoice(Long id);
}