package com.shopsphere.serviceImpl;

import com.shopsphere.dto.request.ReviewRequest;
import com.shopsphere.dto.response.ReviewResponse;
import com.shopsphere.entity.Customer;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.Review;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.ReviewMapper;
import com.shopsphere.repository.CustomerRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.ReviewRepository;
import com.shopsphere.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final ReviewMapper reviewMapper;

    @Override
    public ReviewResponse addReview(ReviewRequest request) {

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Product not found"));

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer not found"));

        Review review = reviewMapper.toEntity(request);

        review.setProduct(product);
        review.setCustomer(customer);

        Review savedReview = reviewRepository.save(review);

        return reviewMapper.toResponse(savedReview);
    }

    @Override
    public List<ReviewResponse> getReviewsByProduct(Long productId) {

        return reviewRepository.findByProductId(productId)
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    @Override
    public void deleteReview(Long id) {

        Review review = reviewRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Review not found"));

        reviewRepository.delete(review);
    }

    @Override
    public ReviewResponse updateReview(Long id, ReviewRequest request) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        reviewMapper.updateEntity(request, review);
        return reviewMapper.toResponse(reviewRepository.save(review));
    }
}