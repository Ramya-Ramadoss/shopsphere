package com.shopsphere.config;

import com.shopsphere.entity.Product;
import com.shopsphere.entity.ProductImage;
import com.shopsphere.entity.Inventory;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.ProductImageRepository;
import com.shopsphere.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Running database self-healing and seeder...");

        List<Product> products = productRepository.findAll();
        log.info("Found {} products in the database.", products.size());

        for (Product product : products) {
            boolean updated = false;

            // 1. Ensure approved is true so they show up in Active Catalog
            if (product.getApproved() == null || !product.getApproved()) {
                product.setApproved(true);
                updated = true;
                log.info("Set product approved = true for product SKU: {}", product.getSku());
            }

            // 2. Ensure deleted is false
            if (product.getDeleted() == null) {
                product.setDeleted(false);
                updated = true;
            }

            // 3. Ensure active is true
            if (product.getActive() == null) {
                product.setActive(true);
                updated = true;
            }

            if (updated) {
                productRepository.save(product);
            }

            // 4. Ensure inventory exists
            if (product.getInventory() == null) {
                Inventory inventory = Inventory.builder()
                        .product(product)
                        .quantity(50)
                        .reservedQuantity(0)
                        .inStock(true)
                        .build();
                inventoryRepository.save(inventory);
                log.info("Seeded default inventory for product SKU: {}", product.getSku());
            }

            // 5. Ensure at least 4 images exist for every product (3-4 requested)
            List<ProductImage> images = productImageRepository.findByProductId(product.getId());
            int currentCount = images != null ? images.size() : 0;
            if (currentCount < 4) {
                log.info("Product SKU: {} has {} images. Adding remaining mock images to reach 4...", product.getSku(), currentCount);
                
                boolean hasPrimary = false;
                if (images != null) {
                    for (ProductImage img : images) {
                        if (img.getPrimaryImage() != null && img.getPrimaryImage()) {
                            hasPrimary = true;
                            break;
                        }
                    }
                }

                for (int i = currentCount + 1; i <= 4; i++) {
                    boolean isPrimary = (i == 1 && !hasPrimary);
                    String suffix = "_" + i + ".jpg";
                    String skuLower = product.getSku().toLowerCase();
                    
                    String imageUrl = "images/products/" + skuLower + suffix;
                    
                    ProductImage newImg = ProductImage.builder()
                            .product(product)
                            .imageUrl(imageUrl)
                            .altText(product.getProductName() + " View " + i)
                            .primaryImage(isPrimary)
                            .sortOrder(i - 1)
                            .build();
                    productImageRepository.save(newImg);
                }
            }
        }

        log.info("Database self-healing and seeding completed.");
    }
}
