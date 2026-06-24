package com.shopsphere.serviceImpl;

import com.shopsphere.dto.request.ProductRequest;
import com.shopsphere.dto.response.ProductResponse;
import com.shopsphere.entity.Admin;
import com.shopsphere.entity.Category;
import com.shopsphere.entity.Inventory;
import com.shopsphere.entity.Product;
import com.shopsphere.exception.DuplicateResourceException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.ProductMapper;
import com.shopsphere.repository.AdminRepository;
import com.shopsphere.repository.CategoryRepository;
import com.shopsphere.repository.InventoryRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.ProductImageRepository;
import com.shopsphere.entity.ProductImage;
import com.shopsphere.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final AdminRepository adminRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductMapper productMapper;
    private final ProductImageRepository productImageRepository;

    @Override
    public ProductResponse createProduct(ProductRequest request) {

        if(productRepository.existsBySku(request.getSku())){
            throw new DuplicateResourceException("SKU already exists");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));

        Admin admin = adminRepository.findById(request.getAdminId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Admin not found"));

        Product product = productMapper.toEntity(request);

        product.setCategory(category);
        product.setAdmin(admin);

        Product savedProduct = productRepository.save(product);

        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            ProductImage productImage = ProductImage.builder()
                    .product(savedProduct)
                    .imageUrl(request.getImageUrl())
                    .altText(request.getProductName())
                    .primaryImage(true)
                    .build();
            productImageRepository.save(productImage);
            savedProduct.getImages().add(productImage);
        }

        Inventory inventory = Inventory.builder()
                .product(savedProduct)
                .quantity(request.getQuantity())
                .reservedQuantity(0)
                .inStock(request.getQuantity() > 0)
                .build();

        inventoryRepository.save(inventory);

        savedProduct.setInventory(inventory);

        return productMapper.toResponse(savedProduct);
    }

    @Override
    public ProductResponse getProductById(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found"));

        return productMapper.toResponse(product);
    }

    @Override
    public List<ProductResponse> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    public List<ProductResponse> getProductsByCategory(Long categoryId) {

        return productRepository.findByCategoryId(categoryId)
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductRequest request) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found"));

        productMapper.updateEntity(request, product);

        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            ProductImage primaryImage = product.getImages().stream()
                    .filter(ProductImage::getPrimaryImage)
                    .findFirst()
                    .orElse(null);
            if (primaryImage != null) {
                primaryImage.setImageUrl(request.getImageUrl());
                productImageRepository.save(primaryImage);
            } else {
                ProductImage newImage = ProductImage.builder()
                        .product(product)
                        .imageUrl(request.getImageUrl())
                        .altText(request.getProductName())
                        .primaryImage(true)
                        .build();
                productImageRepository.save(newImage);
                product.getImages().add(newImage);
            }
        }

        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    public void deleteProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found"));

        productRepository.delete(product);
    }

    @Override
    public List<ProductResponse> searchProducts(String name) {
        return productRepository.findByProductNameContainingIgnoreCase(name)
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    public org.springframework.data.domain.Page<ProductResponse> getProductsPaginatedAndFiltered(
            String name,
            Long categoryId,
            String brand,
            java.math.BigDecimal minPrice,
            java.math.BigDecimal maxPrice,
            Boolean available,
            org.springframework.data.domain.Pageable pageable
    ) {
        org.springframework.data.jpa.domain.Specification<Product> spec = (root, query, cb) -> cb.conjunction();

        if (name != null && !name.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("productName")), "%" + name.trim().toLowerCase() + "%"));
        }

        if (categoryId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId));
        }

        if (brand != null && !brand.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("brand")), "%" + brand.trim().toLowerCase() + "%"));
        }

        if (minPrice != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice));
        }

        if (maxPrice != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice));
        }

        if (available != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("inventory").get("inStock"), available));
        }

        return productRepository.findAll(spec, pageable)
                .map(productMapper::toResponse);
    }
}