package com.productmanagement.service;

import com.productmanagement.dto.PageResponse;
import com.productmanagement.entity.Product;
import com.productmanagement.exception.ResourceNotFoundException;
import com.productmanagement.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class ProductServiceTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
    }

    @Test
    void createProduct_savesAndReturnsProduct() {
        Product product = createProduct("Test", "Electronics", new BigDecimal("100"), 5);
        Product saved = productService.createProduct(product);
        assertNotNull(saved.getId());
        assertEquals("Test", saved.getName());
    }

    @Test
    void getProductByIdOrThrow_whenExists_returnsProduct() {
        Product p = productRepository.save(createProduct("Item", "Books", new BigDecimal("20"), 10));
        Product found = productService.getProductByIdOrThrow(p.getId());
        assertEquals(p.getId(), found.getId());
    }

    @Test
    void getProductByIdOrThrow_whenNotExists_throwsResourceNotFoundException() {
        assertThrows(ResourceNotFoundException.class, () ->
                productService.getProductByIdOrThrow(9999L));
    }

    @Test
    void getAllProducts_withPagination_returnsPageResponse() {
        productRepository.save(createProduct("A", "Cat1", new BigDecimal("1"), 1));
        productRepository.save(createProduct("B", "Cat1", new BigDecimal("2"), 2));
        PageResponse<Product> page = productService.getAllProducts(
                0, 1,
                "id", "asc",
                null, null,
                null, null,
                null,
                true,
                false);
        assertEquals(1, page.content().size());
        assertEquals(2, page.totalElements());
        assertEquals(2, page.totalPages());
    }

    private Product createProduct(String name, String category, BigDecimal price, int stock) {
        Product p = new Product();
        p.setName(name);
        p.setCategory(category);
        p.setPrice(price);
        p.setStockQuantity(stock);
        return p;
    }
}
