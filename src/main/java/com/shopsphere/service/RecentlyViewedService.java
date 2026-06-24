package com.shopsphere.service;

import com.shopsphere.dto.response.RecentlyViewedResponse;

import java.util.List;

public interface RecentlyViewedService {

    List<RecentlyViewedResponse> getRecentlyViewedProducts(Long customerId);

    void clearHistory(Long customerId);

    RecentlyViewedResponse addRecentlyViewed(Long customerId, Long productId);
}