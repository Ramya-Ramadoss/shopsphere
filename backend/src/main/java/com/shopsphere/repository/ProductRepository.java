package com.shopsphere.repository;

import com.shopsphere.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Product> {

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByCategoryIdAndDeletedFalse(Long categoryId);

    List<Product> findByProductNameContainingIgnoreCase(String productName);

    List<Product> findByProductNameContainingIgnoreCaseAndDeletedFalse(String productName);

    boolean existsBySku(String sku);

    List<Product> findByDeletedTrue();

    List<Product> findByDeletedFalse();

    List<Product> findByDeletedTrueAndDeletedAtBefore(java.time.LocalDateTime dateTime);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Product p WHERE p.deleted = false AND p.reviewVerified = false AND (SELECT COUNT(r) FROM Review r WHERE r.product = p) <= 2")
    List<Product> findProductsAwaitingReviewVerification();
}