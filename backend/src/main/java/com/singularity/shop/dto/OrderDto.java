package com.singularity.shop.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ItemRequest {
        @NotNull
        private Long productId;
        @NotNull @Min(1)
        private Integer quantity;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateRequest {
        private Long customerId;

        @Email
        private String guestEmail;
        private String guestName;

        @NotEmpty
        private List<ItemRequest> items;
        @NotBlank
        private String shippingAddress;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateResponse {
        private Long orderId;
        private String clientSecret;
        private BigDecimal totalAmount;
        private String currency;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ItemResponse {
        private Long id;
        private Long productId;
        private String productCode;
        private String productName;
        private String productImageUrl;
        private Integer quantity;
        private BigDecimal unitPrice;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private Long customerId;
        private String customerEmail;
        private String customerName;
        private String guestEmail;
        private String guestName;
        private String status;
        private BigDecimal totalAmount;
        private String currency;
        private String paymentIntentId;
        private String transactionId;
        private String shippingAddress;
        private LocalDateTime createdAt;
        private List<ItemResponse> items;
    }
}
