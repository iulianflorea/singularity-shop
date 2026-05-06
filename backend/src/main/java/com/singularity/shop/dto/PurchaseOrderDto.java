package com.singularity.shop.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class PurchaseOrderDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ItemRequest {
        @NotNull
        private Long productId;
        @NotNull @Min(1)
        private Integer quantity;
        @NotNull @DecimalMin("0.01")
        private BigDecimal unitPurchasePrice;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        private LocalDate orderDate;
        private String notes;
        @NotEmpty
        private List<ItemRequest> items;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPurchasePrice;
        private BigDecimal lineTotal;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private LocalDateTime createdAt;
        private LocalDate orderDate;
        private String notes;
        private BigDecimal totalAmount;
        private List<ItemResponse> items;
    }
}
