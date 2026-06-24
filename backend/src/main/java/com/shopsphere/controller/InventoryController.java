package com.shopsphere.controller;

import com.shopsphere.dto.request.InventoryRequest;
import com.shopsphere.dto.response.InventoryResponse;
import com.shopsphere.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryResponse>> getAllInventory() {

        List<InventoryResponse> inventory = inventoryService.getAllInventory();
        return ResponseEntity.ok(inventory);
    }

    @PutMapping("/update")
    public ResponseEntity<InventoryResponse> updateInventory(
            @Valid @RequestBody InventoryRequest request) {

        InventoryResponse response = inventoryService.updateInventory(request.getProductId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryResponse>> getLowStock() {

        List<InventoryResponse> lowStock = inventoryService.getLowStockInventory();
        return ResponseEntity.ok(lowStock);
    }
}
