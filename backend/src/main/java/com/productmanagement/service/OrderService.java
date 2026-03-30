package com.productmanagement.service;

import com.productmanagement.dto.CreateOrderRequest;
import com.productmanagement.entity.*;
import com.productmanagement.exception.InsufficientStockException;
import com.productmanagement.exception.ResourceNotFoundException;
import com.productmanagement.repository.OrderRepository;
import com.productmanagement.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Order placeOrder(Long userId, CreateOrderRequest request) {
        Order order = new Order();
        order.setUserId(userId);
        order.setStatus(OrderStatus.PENDING);
        BigDecimal total = BigDecimal.ZERO;

        for (CreateOrderRequest.OrderItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemReq.productId()));
            if (!product.getActive()) {
                throw new InsufficientStockException("Product '" + product.getName() + "' is not available");
            }
            if (product.getStockQuantity() == 0) {
                throw new InsufficientStockException("Product '" + product.getName() + "' is out of stock");
            }
            if (itemReq.quantity() <= 0) {
                throw new InsufficientStockException("Quantity must be positive for product '" + product.getName() + "'");
            }
            if (product.getStockQuantity() < itemReq.quantity()) {
                throw new InsufficientStockException(
                        "Insufficient stock for '" + product.getName() + "'. Available: " + product.getStockQuantity());
            }

            BigDecimal unitPrice = product.getDiscountedPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.quantity()));
            total = total.add(lineTotal);

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(itemReq.quantity());
            item.setUnitPrice(unitPrice);
            item.setLineTotal(lineTotal);
            order.getItems().add(item);

            product.setStockQuantity(product.getStockQuantity() - itemReq.quantity());
            productRepository.save(product);
        }

        order.setTotalAmount(total);
        order.setStatus(OrderStatus.CONFIRMED);
        return orderRepository.save(order);
    }

    public Page<Order> getOrdersByUser(Long userId, int page, int size) {
        return orderRepository.findByUserId(userId, PageRequest.of(page, size));
    }

    public Order getOrderById(Long id, Long userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        if (!order.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Order", "id", id);
        }
        return order;
    }

    public Page<Order> getAllOrders(int page, int size) {
        return orderRepository.findAll(PageRequest.of(page, size));
    }

    public Order updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
