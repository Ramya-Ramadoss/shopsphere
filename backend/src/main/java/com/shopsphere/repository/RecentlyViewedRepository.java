package com.shopsphere.repository;

import com.shopsphere.entity.RecentlyViewed;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecentlyViewedRepository extends JpaRepository<RecentlyViewed, Long> {

    List<RecentlyViewed> findByCustomerId(Long customerId);

}