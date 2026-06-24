package com.shopsphere.controller;

import com.shopsphere.dto.request.RecentlyViewedRequest;
import com.shopsphere.dto.response.RecentlyViewedResponse;
import com.shopsphere.service.RecentlyViewedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recently-viewed")
@RequiredArgsConstructor
public class RecentlyViewedController {

    private final RecentlyViewedService recentlyViewedService;

    @PostMapping
    public ResponseEntity<RecentlyViewedResponse> addRecentlyViewed(
            @Valid @RequestBody RecentlyViewedRequest request) {

        RecentlyViewedResponse response = recentlyViewedService.addRecentlyViewed(
                request.getCustomerId(),
                request.getProductId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<List<RecentlyViewedResponse>> getRecentlyViewed(
            @PathVariable Long customerId) {

        List<RecentlyViewedResponse> history = recentlyViewedService.getRecentlyViewedProducts(customerId);
        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/{customerId}")
    public ResponseEntity<Void> clearHistory(@PathVariable Long customerId) {

        recentlyViewedService.clearHistory(customerId);
        return ResponseEntity.noContent().build();
    }
}
