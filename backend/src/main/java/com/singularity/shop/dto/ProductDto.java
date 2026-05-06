package com.singularity.shop.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ProductDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SpecRequest {
        private String name;
        private String value;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SpecResponse {
        private Long id;
        private String name;
        private String value;
        private int sortOrder;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        @NotBlank
        private String name;
        private String description;
        @NotNull @DecimalMin("0.01")
        private BigDecimal price;
        private Integer stock;
        @NotBlank
        private String category;
        private String imageUrl;
        private String productCode;
        private BigDecimal purchasePrice;
        @Builder.Default
        private String productType = "PHYSICAL";
        @Builder.Default
        private Boolean active = true;
        private List<SpecRequest> specifications;
        private List<String> descriptionImages;
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
        private String productType;
        private LocalDateTime createdAt;
        private List<SpecResponse> specifications;
        private List<String> descriptionImages;
    }
}
