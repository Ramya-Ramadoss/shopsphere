package com.shopsphere.mapper;

import com.shopsphere.dto.request.ReviewRequest;
import com.shopsphere.dto.response.ReviewResponse;
import com.shopsphere.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public Review toEntity(ReviewRequest request) {

        Review review = new Review();

        review.setRating(request.getRating());
        review.setReviewText(request.getReviewText());

        return review;
    }

    public ReviewResponse toResponse(Review review) {

        return ReviewResponse.builder()
                .id(review.getId())
                .customerName(review.getCustomer().getFullName())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getProductName())
                .rating(review.getRating())
                .reviewText(review.getReviewText())
                .approved(review.getApproved())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

    public void updateEntity(ReviewRequest request, Review review) {

        review.setRating(request.getRating());
        review.setReviewText(request.getReviewText());
    }
}