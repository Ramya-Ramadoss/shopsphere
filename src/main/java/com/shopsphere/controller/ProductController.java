package com.shopsphere.controller;

import com.shopsphere.dto.request.ProductRequest;
import com.shopsphere.dto.response.ProductResponse;
import com.shopsphere.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductRequest request) {

        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {

        List<ProductResponse> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {

        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {

        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {

        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> searchProducts(@RequestParam String query) {

        List<ProductResponse> results = productService.searchProducts(query);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/filter")
    public ResponseEntity<org.springframework.data.domain.Page<ProductResponse>> getProductsFiltered(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) Boolean available,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,asc") String[] sort
    ) {
        List<org.springframework.data.domain.Sort.Order> orders = new java.util.ArrayList<>();
        if (sort.length > 0 && sort[0].contains(",")) {
            for (String sortOrder : sort) {
                String[] _sort = sortOrder.split(",");
                orders.add(new org.springframework.data.domain.Sort.Order(
                        org.springframework.data.domain.Sort.Direction.fromString(_sort[1]), _sort[0]));
            }
        } else if (sort.length == 2) {
            orders.add(new org.springframework.data.domain.Sort.Order(
                    org.springframework.data.domain.Sort.Direction.fromString(sort[1]), sort[0]));
        } else {
            orders.add(new org.springframework.data.domain.Sort.Order(
                    org.springframework.data.domain.Sort.Direction.ASC, "id"));
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                page, size, org.springframework.data.domain.Sort.by(orders));

        org.springframework.data.domain.Page<ProductResponse> products = productService.getProductsPaginatedAndFiltered(
                name, categoryId, brand, minPrice, maxPrice, available, pageable);

        return ResponseEntity.ok(products);
    }
}
