package com.shopsphere.util;

import com.shopsphere.entity.Product;
import com.shopsphere.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductCleanupScheduler {

    private final ProductRepository productRepository;

    // Runs every day at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void deleteExpiredProductsFromTrash() {
        log.info("Running scheduled product trash cleanup job...");
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        List<Product> expiredProducts = productRepository.findByDeletedTrueAndDeletedAtBefore(cutoff);
        
        if (!expiredProducts.isEmpty()) {
            log.info("Found {} expired products in trash. Deleting permanently.", expiredProducts.size());
            productRepository.deleteAll(expiredProducts);
        } else {
            log.info("No expired products found in trash to delete.");
        }
    }
}
