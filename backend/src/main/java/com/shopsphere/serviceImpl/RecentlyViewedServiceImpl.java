package com.shopsphere.serviceImpl;

import com.shopsphere.dto.response.RecentlyViewedResponse;
import com.shopsphere.entity.Customer;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.RecentlyViewed;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.RecentlyViewedMapper;
import com.shopsphere.repository.CustomerRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.RecentlyViewedRepository;
import com.shopsphere.service.RecentlyViewedService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecentlyViewedServiceImpl implements RecentlyViewedService {

    private final RecentlyViewedRepository recentlyViewedRepository;
    private final RecentlyViewedMapper recentlyViewedMapper;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    @Override
    public List<RecentlyViewedResponse> getRecentlyViewedProducts(Long customerId) {

        return recentlyViewedRepository.findByCustomerId(customerId)
                .stream()
                .map(recentlyViewedMapper::toResponse)
                .toList();
    }

    @Override
    public void clearHistory(Long customerId) {

        List<RecentlyViewed> history =
                recentlyViewedRepository.findByCustomerId(customerId);

        recentlyViewedRepository.deleteAll(history);
    }

    @Override
    public RecentlyViewedResponse addRecentlyViewed(Long customerId, Long productId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        RecentlyViewed recentlyViewed = recentlyViewedRepository.findByCustomerId(customerId).stream()
                .filter(rv -> rv.getProduct().getId().equals(productId))
                .findFirst()
                .orElse(null);

        if (recentlyViewed != null) {
            recentlyViewed.setViewedAt(LocalDateTime.now());
        } else {
            recentlyViewed = RecentlyViewed.builder()
                    .customer(customer)
                    .product(product)
                    .viewedAt(LocalDateTime.now())
                    .build();
        }

        return recentlyViewedMapper.toResponse(recentlyViewedRepository.save(recentlyViewed));
    }
}