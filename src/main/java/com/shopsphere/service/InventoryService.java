package com.shopsphere.service;

import com.shopsphere.dto.request.InventoryRequest;
import com.shopsphere.dto.response.InventoryResponse;

import java.util.List;

public interface InventoryService {

    InventoryResponse updateInventory(Long productId, InventoryRequest request);

    InventoryResponse getInventoryByProduct(Long productId);

    List<InventoryResponse> getAllInventory();

    List<InventoryResponse> getLowStockInventory();
}