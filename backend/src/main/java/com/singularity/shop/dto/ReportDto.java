package com.singularity.shop.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ReportDto {

    @Getter @AllArgsConstructor @Builder
    public static class SoldProduct {
        private Long productId;
        private String productName;
        private Integer totalQuantity;
        private BigDecimal grossRevenue;
    }

    @Getter @AllArgsConstructor @Builder
    public static class Response {
        private LocalDate from;
        private LocalDate to;
        private long orderCount;
        private BigDecimal grossRevenue;
        private BigDecimal tvaAmount;
        private BigDecimal revenueWithoutTva;
        private BigDecimal stripeFees;
        private BigDecimal netRevenue;
        private BigDecimal purchaseCosts;
        private BigDecimal netProfit;
        private BigDecimal tvaRate;
        private List<SoldProduct> soldProducts;
        private List<PurchaseOrderDto.Response> purchaseOrders;
    }
}
