package com.shopsphere.mapper;

import com.shopsphere.dto.request.InventoryRequest;
import com.shopsphere.dto.response.InventoryResponse;
import com.shopsphere.entity.Inventory;
import org.springframework.stereotype.Component;

@Component
public class InventoryMapper {

    public Inventory toEntity(InventoryRequest request) {

        Inventory inventory = new Inventory();

        inventory.setQuantity(request.getQuantity());
        inventory.setReservedQuantity(request.getReservedQuantity());

        return inventory;
    }

    public InventoryResponse toResponse(Inventory inventory) {

        return InventoryResponse.builder()
                .id(inventory.getId())
                .productId(inventory.getProduct().getId())
                .productName(inventory.getProduct().getProductName())
                .quantity(inventory.getQuantity())
                .reservedQuantity(inventory.getReservedQuantity())
                .inStock(inventory.getInStock())
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }

    public void updateEntity(InventoryRequest request, Inventory inventory) {

        inventory.setQuantity(request.getQuantity());
        inventory.setReservedQuantity(request.getReservedQuantity());
    }
}