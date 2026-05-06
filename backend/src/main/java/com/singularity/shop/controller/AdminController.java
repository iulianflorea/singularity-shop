package com.singularity.shop.controller;

import com.singularity.shop.dto.OrderDto;
import com.singularity.shop.dto.ProductDto;
import com.singularity.shop.dto.ReportDto;
import com.singularity.shop.repository.*;
import com.singularity.shop.service.OrderService;
import com.singularity.shop.service.ProductService;
import com.singularity.shop.service.PurchaseOrderService;
import com.singularity.shop.service.SettingService;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final OrderService orderService;
    private final ProductService productService;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderService purchaseOrderService;
    private final OrderItemRepository orderItemRepository;
    private final SettingService settingService;

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

    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getSettings() {
        return ResponseEntity.ok(Map.of("tvaRate", settingService.getTvaRate()));
    }

    @PutMapping("/settings")
    public ResponseEntity<Map<String, Object>> updateSettings(@RequestBody Map<String, Object> body) {
        if (body.containsKey("tvaRate")) {
            settingService.setTvaRate(new BigDecimal(body.get("tvaRate").toString()));
        }
        return ResponseEntity.ok(Map.of("tvaRate", settingService.getTvaRate()));
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductDto.Response>> getAllProducts() {
        return ResponseEntity.ok(
                productRepository.findAll().stream()
                        .map(productService::toPublicResponse)
                        .toList()
        );
    }

    @GetMapping("/report")
    public ResponseEntity<ReportDto.Response> getReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        LocalDateTime fromDt = from.atStartOfDay();
        LocalDateTime toDt = to.atTime(LocalTime.MAX);

        BigDecimal grossRevenue = orderRepository.sumConfirmedRevenueInRange(fromDt, toDt);
        long orderCount = orderRepository.countConfirmedInRange(fromDt, toDt);
        BigDecimal tvaRate = settingService.getTvaRate();

        // TVA breakdown: price is TVA-inclusive, so tvaAmount = gross * tvaRate / (100 + tvaRate)
        BigDecimal tvaAmount = grossRevenue
                .multiply(tvaRate)
                .divide(new BigDecimal("100").add(tvaRate), 2, RoundingMode.HALF_UP);
        BigDecimal revenueWithoutTva = grossRevenue.subtract(tvaAmount).setScale(2, RoundingMode.HALF_UP);

        BigDecimal stripeFees = grossRevenue.multiply(new BigDecimal("0.014"))
                .add(BigDecimal.valueOf(orderCount))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal netRevenue = grossRevenue.subtract(stripeFees).setScale(2, RoundingMode.HALF_UP);

        BigDecimal purchaseCosts = purchaseOrderRepository.sumTotalInRange(from, to);
        BigDecimal netProfit = netRevenue.subtract(purchaseCosts).setScale(2, RoundingMode.HALF_UP);

        List<Object[]> rawSold = orderItemRepository.findSoldProductsInRange(fromDt, toDt);
        List<ReportDto.SoldProduct> soldProducts = rawSold.stream()
                .map(row -> ReportDto.SoldProduct.builder()
                        .productId(((Number) row[0]).longValue())
                        .productName((String) row[1])
                        .totalQuantity(((Number) row[2]).intValue())
                        .grossRevenue(new BigDecimal(row[3].toString()).setScale(2, RoundingMode.HALF_UP))
                        .build())
                .toList();

        List<com.singularity.shop.dto.PurchaseOrderDto.Response> purchaseOrders =
                purchaseOrderRepository.findByOrderDateBetweenOrderByOrderDateDescCreatedAtDesc(from, to)
                        .stream().map(purchaseOrderService::toResponse).toList();

        return ResponseEntity.ok(ReportDto.Response.builder()
                .from(from).to(to)
                .orderCount(orderCount)
                .grossRevenue(grossRevenue)
                .tvaAmount(tvaAmount)
                .revenueWithoutTva(revenueWithoutTva)
                .stripeFees(stripeFees)
                .netRevenue(netRevenue)
                .purchaseCosts(purchaseCosts)
                .netProfit(netProfit)
                .tvaRate(tvaRate)
                .soldProducts(soldProducts)
                .purchaseOrders(purchaseOrders)
                .build());
    }

    @Getter @AllArgsConstructor
    public static class StatsResponse {
        private long totalOrders;
        private long totalCustomers;
        private long totalProducts;
        private BigDecimal revenue;
    }
}
