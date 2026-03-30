package com.productmanagement.controller;

import com.productmanagement.entity.ProductRating;
import com.productmanagement.service.ProductRatingService;
import com.productmanagement.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Product Ratings", description = "Rate products")
public class ProductRatingController {

    private final ProductRatingService ratingService;
    private final com.productmanagement.repository.UserRepository userRepository;

    public ProductRatingController(ProductRatingService ratingService,
                                  com.productmanagement.repository.UserRepository userRepository) {
        this.ratingService = ratingService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{productId}/rate")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Rate a product (1-5)")
    public ResponseEntity<ProductRating> rate(
            @PathVariable Long productId,
            @RequestParam Integer rating) {
        Long userId = SecurityUtil.getCurrentUserId(userRepository);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (rating == null || rating < 1 || rating > 5) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(ratingService.rate(productId, userId, rating));
    }

    @GetMapping("/{productId}/rating")
    @Operation(summary = "Get product rating summary")
    public ResponseEntity<Map<String, Object>> getRating(@PathVariable Long productId) {
        Double avg = ratingService.getAverageRating(productId);
        long count = ratingService.getRatingCount(productId);
        return ResponseEntity.ok(Map.of(
                "averageRating", avg != null ? Math.round(avg * 10.0) / 10.0 : 0,
                "ratingCount", count
        ));
    }
}
