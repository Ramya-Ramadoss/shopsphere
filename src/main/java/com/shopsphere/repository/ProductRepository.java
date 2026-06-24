package com.shopsphere.repository;

import com.shopsphere.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Product> {

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByProductNameContainingIgnoreCase(String productName);

    boolean existsBySku(String sku);
}