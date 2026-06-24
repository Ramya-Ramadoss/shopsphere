package com.shopsphere.service;

import com.shopsphere.dto.request.ReviewRequest;
import com.shopsphere.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {

    ReviewResponse addReview(ReviewRequest request);

    List<ReviewResponse> getReviewsByProduct(Long productId);

    void deleteReview(Long id);

    ReviewResponse updateReview(Long id, ReviewRequest request);
}