package com.singularity.shop.controller;

import com.singularity.shop.dto.OrderDto;
import com.singularity.shop.repository.*;
import com.singularity.shop.service.OrderService;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final OrderService orderService;

    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats() {
        long totalOrders = orderRepository.count();
        long totalCustomers = customerRepository.count();
        long totalProducts = productRepository.count();
        BigDecimal revenue = orderRepository.sumConfirmedRevenue();

        return ResponseEntity.ok(new StatsResponse(totalOrders, totalCustomers, totalProducts, revenue));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderDto.Response>> getAllOrders() {
        return ResponseEntity.ok(
                orderRepository.findAllByOrderByCreatedAtDesc()
                        .stream().map(orderService::toResponsePublic).toList()
        );
    }

    @Getter @AllArgsConstructor
    public static class StatsResponse {
        private long totalOrders;
        private long totalCustomers;
        private long totalProducts;
        private BigDecimal revenue;
    }
}
