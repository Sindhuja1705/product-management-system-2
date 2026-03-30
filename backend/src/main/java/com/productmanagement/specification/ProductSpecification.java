package com.productmanagement.specification;

import com.productmanagement.entity.Product;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

import java.util.ArrayList;
import java.util.List;

public final class ProductSpecification {

    private static final int LOW_STOCK_THRESHOLD = 10;

    private ProductSpecification() {}

    /**
     * @param stockFilter "in_stock" | "out_of_stock" | "low_stock" | null
     */
    public static Specification<Product> withFilters(String category, String search, Double minPrice, Double maxPrice,
                                                     String stockFilter, Boolean isActive) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (category != null && !category.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("category")), "%" + category.toLowerCase() + "%"));
            }
            if (search != null && !search.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"));
            }
            if (minPrice != null && minPrice >= 0) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null && maxPrice >= 0) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            if (stockFilter != null && !stockFilter.isBlank()) {
                switch (stockFilter.toLowerCase()) {
                    case "in_stock" -> predicates.add(cb.greaterThan(root.get("stockQuantity"), 0));
                    case "out_of_stock" -> predicates.add(cb.equal(root.get("stockQuantity"), 0));
                    case "low_stock" -> predicates.add(cb.and(
                            cb.greaterThan(root.get("stockQuantity"), 0),
                            cb.lessThanOrEqualTo(root.get("stockQuantity"), LOW_STOCK_THRESHOLD)));
                    default -> {}
                }
            }
            if (isActive != null) {
                predicates.add(cb.equal(root.get("active"), isActive));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
