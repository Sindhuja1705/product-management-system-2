package com.productmanagement.service;

import com.productmanagement.entity.Product;
import com.productmanagement.entity.ProductRating;
import com.productmanagement.exception.ResourceNotFoundException;
import com.productmanagement.repository.ProductRatingRepository;
import com.productmanagement.repository.ProductRepository;
import org.springframework.stereotype.Service;

@Service
public class ProductRatingService {

    private final ProductRatingRepository ratingRepository;
    private final ProductRepository productRepository;

    public ProductRatingService(ProductRatingRepository ratingRepository, ProductRepository productRepository) {
        this.ratingRepository = ratingRepository;
        this.productRepository = productRepository;
    }

    public ProductRating rate(Long productId, Long userId, Integer rating) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        ProductRating pr = ratingRepository.findByProductIdAndUserId(productId, userId)
                .orElse(new ProductRating());
        pr.setProduct(product);
        pr.setUserId(userId);
        pr.setRating(rating);
        return ratingRepository.save(pr);
    }

    public Double getAverageRating(Long productId) {
        return ratingRepository.getAverageRatingByProductId(productId);
    }

    public long getRatingCount(Long productId) {
        return ratingRepository.countByProductId(productId);
    }
}
