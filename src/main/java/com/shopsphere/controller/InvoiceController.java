package com.shopsphere.controller;

import com.shopsphere.dto.response.InvoiceResponse;
import com.shopsphere.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping("/generate/{orderId}")
    public ResponseEntity<InvoiceResponse> generateInvoice(@PathVariable Long orderId) {
        InvoiceResponse response = invoiceService.generateInvoice(orderId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<InvoiceResponse> getInvoiceByOrderId(@PathVariable Long orderId) {
        InvoiceResponse response = invoiceService.getInvoiceByOrderId(orderId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable Long id) {
        InvoiceResponse response = invoiceService.getInvoiceById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) {
        byte[] pdfData = invoiceService.downloadInvoice(id);
        InvoiceResponse response = invoiceService.getInvoiceById(id);
        String fileName = "invoice_" + response.getInvoiceNumber() + ".txt";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(pdfData);
    }
}
