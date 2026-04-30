package com.singularity.shop.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DiscountDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        @NotBlank
        private String code;
        @NotBlank
        private String type;
        @NotNull @DecimalMin("0.01")
        private BigDecimal value;
        private BigDecimal minOrderAmount;
        private Integer maxUses;
        @Builder.Default
        private Boolean active = true;
        private LocalDateTime validFrom;
        private LocalDateTime validTo;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String code;
        private String type;
        private BigDecimal value;
        private BigDecimal minOrderAmount;
        private Integer maxUses;
        private Integer usedCount;
        private Boolean active;
        private LocalDateTime validFrom;
        private LocalDateTime validTo;
        private LocalDateTime createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ApplyRequest {
        @NotBlank
        private String code;
        @NotNull
        private BigDecimal orderAmount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ApplyResponse {
        private String code;
        private BigDecimal discount;
        private BigDecimal finalAmount;
    }
}
