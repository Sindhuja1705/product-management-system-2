package com.productmanagement.dto;

import com.productmanagement.entity.Product;

import java.math.BigDecimal;
import java.time.Instant;

public record ProductResponse(
        Long id, String name, String category, BigDecimal price, BigDecimal discountedPrice,
        Integer stockQuantity, String description, String imageUrl, BigDecimal discountPercentage,
        Boolean active, Instant createdAt, Instant updatedAt, Double averageRating, Long ratingCount
) {
    public static ProductResponse from(Product p, Double avgRating, Long ratingCount) {
        return new ProductResponse(
                p.getId(), p.getName(), p.getCategory(), p.getPrice(), p.getDiscountedPrice(),
                p.getStockQuantity(), p.getDescription(), p.getImageUrl(), p.getDiscountPercentage(),
                p.getActive(), p.getCreatedAt(), p.getUpdatedAt(),
                avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : null,
                ratingCount != null ? ratingCount : 0L
        );
    }
}
