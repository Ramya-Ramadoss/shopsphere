package com.shopsphere.serviceImpl;

import com.shopsphere.dto.request.ProductRequest;
import com.shopsphere.dto.response.ProductResponse;
import com.shopsphere.entity.Admin;
import com.shopsphere.entity.Category;
import com.shopsphere.entity.Inventory;
import com.shopsphere.entity.Product;
import com.shopsphere.exception.DuplicateResourceException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.exception.BadRequestException;
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
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

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

        // Create initial inventory
        Inventory inventory = Inventory.builder()
                .product(savedProduct)
                .quantity(request.getQuantity())
                .inStock(request.getQuantity() > 0)
                .build();
        inventoryRepository.save(inventory);

        // Create initial image
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            ProductImage image = ProductImage.builder()
                    .product(savedProduct)
                    .imageUrl(request.getImageUrl())
                    .altText(request.getProductName())
                    .primaryImage(true)
                    .sortOrder(0)
                    .build();
            productImageRepository.save(image);
            
            if (savedProduct.getImages() == null) {
                savedProduct.setImages(new java.util.ArrayList<>());
            }
            savedProduct.getImages().add(image);
        }

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
        return productRepository.findByDeletedFalse()
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryIdAndDeletedFalse(categoryId)
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
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
                        .sortOrder(0)
                        .build();
                productImageRepository.save(newImage);
                product.getImages().add(newImage);
            }
        }

        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteProduct(Long id, String password) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new BadRequestException("Invalid admin password. Deletion cancelled.");
        }

        product.setDeleted(true);
        product.setDeletedAt(java.time.LocalDateTime.now());
        productRepository.save(product);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public ProductResponse restoreProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        if (product.getDeleted() != null && product.getDeleted()) {
            product.setDeleted(false);
            product.setDeletedAt(null);
            productRepository.save(product);
        }
        return productMapper.toResponse(product);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void permanentDeleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        productRepository.delete(product);
    }

    @Override
    public List<ProductResponse> getTrashProducts() {
        return productRepository.findByDeletedTrue().stream()
                .map(productMapper::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<ProductResponse> getProductsAwaitingReviewVerification() {
        return productRepository.findProductsAwaitingReviewVerification().stream()
                .map(productMapper::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public ProductResponse verifyProductReviews(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setReviewVerified(true);
        Product saved = productRepository.save(product);
        return productMapper.toResponse(saved);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public com.shopsphere.dto.response.ProductImageResponse addProductImage(Long id, com.shopsphere.dto.request.ProductImageRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        if (request.getPrimaryImage() != null && request.getPrimaryImage()) {
            if (product.getImages() != null) {
                for (ProductImage img : product.getImages()) {
                    if (img.getPrimaryImage()) {
                        img.setPrimaryImage(false);
                        productImageRepository.save(img);
                    }
                }
            }
        }

        int nextSortOrder = 0;
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            nextSortOrder = product.getImages().stream()
                    .mapToInt(img -> img.getSortOrder() != null ? img.getSortOrder() : 0)
                    .max().orElse(0) + 1;
        }

        ProductImage newImage = ProductImage.builder()
                .product(product)
                .imageUrl(request.getImageUrl())
                .altText(request.getAltText() != null ? request.getAltText() : product.getProductName())
                .primaryImage(request.getPrimaryImage() != null ? request.getPrimaryImage() : false)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : nextSortOrder)
                .build();

        ProductImage saved = productImageRepository.save(newImage);
        
        if (product.getImages() == null) {
            product.setImages(new java.util.ArrayList<>());
        }
        product.getImages().add(saved);
        
        return com.shopsphere.dto.response.ProductImageResponse.builder()
                .id(saved.getId())
                .imageUrl(saved.getImageUrl())
                .altText(saved.getAltText())
                .primaryImage(saved.getPrimaryImage())
                .sortOrder(saved.getSortOrder())
                .build();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteProductImage(Long id, Long imageId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Product image not found"));
        
        if (!image.getProduct().getId().equals(product.getId())) {
            throw new BadRequestException("Image does not belong to this product");
        }

        boolean wasPrimary = image.getPrimaryImage();
        product.getImages().remove(image);
        productImageRepository.delete(image);

        if (wasPrimary && !product.getImages().isEmpty()) {
            ProductImage nextPrimary = product.getImages().get(0);
            nextPrimary.setPrimaryImage(true);
            productImageRepository.save(nextPrimary);
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public List<com.shopsphere.dto.response.ProductImageResponse> reorderProductImages(Long id, com.shopsphere.dto.request.ImageReorderRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        List<Long> orderList = request.getImageIds();
        if (orderList == null || orderList.isEmpty()) {
            throw new BadRequestException("Image IDs list cannot be empty");
        }

        List<ProductImage> productImages = product.getImages();
        for (int i = 0; i < orderList.size(); i++) {
            Long imgId = orderList.get(i);
            int finalI = i;
            productImages.stream()
                    .filter(img -> img.getId().equals(imgId))
                    .findFirst()
                    .ifPresent(img -> {
                        img.setSortOrder(finalI);
                        productImageRepository.save(img);
                    });
        }

        return productImages.stream()
                .sorted(java.util.Comparator.comparing(img -> img.getSortOrder() != null ? img.getSortOrder() : 0))
                .map(img -> com.shopsphere.dto.response.ProductImageResponse.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .altText(img.getAltText())
                        .primaryImage(img.getPrimaryImage())
                        .sortOrder(img.getSortOrder())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public com.shopsphere.dto.response.ProductImageResponse setProductCoverImage(Long id, Long imageId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        ProductImage targetImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Product image not found"));

        if (!targetImage.getProduct().getId().equals(product.getId())) {
            throw new BadRequestException("Image does not belong to this product");
        }

        if (product.getImages() != null) {
            for (ProductImage img : product.getImages()) {
                boolean isTarget = img.getId().equals(imageId);
                if (img.getPrimaryImage() != isTarget) {
                    img.setPrimaryImage(isTarget);
                    productImageRepository.save(img);
                }
            }
        }

        return com.shopsphere.dto.response.ProductImageResponse.builder()
                .id(targetImage.getId())
                .imageUrl(targetImage.getImageUrl())
                .altText(targetImage.getAltText())
                .primaryImage(true)
                .sortOrder(targetImage.getSortOrder())
                .build();
    }

    @Override
    public List<ProductResponse> searchProducts(String name) {
        return productRepository.findByProductNameContainingIgnoreCaseAndDeletedFalse(name)
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

        // Hide soft deleted products
        spec = spec.and((root, query, cb) -> cb.equal(root.get("deleted"), false));

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