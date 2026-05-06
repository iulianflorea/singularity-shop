package com.singularity.shop.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        @NotBlank
        private String name;
        private String description;
        @NotNull @DecimalMin("0.01")
        private BigDecimal price;
        @NotNull @Min(0)
        private Integer stock;
        @NotBlank
        private String category;
        private String imageUrl;
        private String productCode;
        private BigDecimal purchasePrice;
        @Builder.Default
        private Boolean active = true;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private Integer stock;
        private String category;
        private String imageUrl;
        private Boolean active;
        private String productCode;
        private BigDecimal purchasePrice;
        private LocalDateTime createdAt;
    }
}
