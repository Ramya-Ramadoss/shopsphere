package com.shopsphere.serviceImpl;

import com.shopsphere.dto.request.InventoryRequest;
import com.shopsphere.dto.response.InventoryResponse;
import java.util.List;
import com.shopsphere.entity.Inventory;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.InventoryMapper;
import com.shopsphere.repository.InventoryRepository;
import com.shopsphere.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryMapper inventoryMapper;

    @Override
    public InventoryResponse updateInventory(Long productId, InventoryRequest request) {

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Inventory not found"));

        inventory.setQuantity(request.getQuantity());
        inventory.setReservedQuantity(request.getReservedQuantity());
        inventory.setInStock(request.getQuantity() > 0);

        return inventoryMapper.toResponse(inventoryRepository.save(inventory));
    }

    @Override
    public InventoryResponse getInventoryByProduct(Long productId) {

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Inventory not found"));

        return inventoryMapper.toResponse(inventory);
    }

    @Override
    public List<InventoryResponse> getAllInventory() {
        return inventoryRepository.findAll().stream()
                .map(inventoryMapper::toResponse)
                .toList();
    }

    @Override
    public List<InventoryResponse> getLowStockInventory() {
        return inventoryRepository.findAll().stream()
                .filter(inventory -> inventory.getQuantity() < 10)
                .map(inventoryMapper::toResponse)
                .toList();
    }
}