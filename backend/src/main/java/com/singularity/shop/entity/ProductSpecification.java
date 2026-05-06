package com.singularity.shop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_specifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductSpecification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "spec_name", nullable = false)
    private String name;

    @Column(name = "spec_value", nullable = false, columnDefinition = "TEXT")
    private String value;

    @Column(name = "sort_order")
    private int sortOrder;
}
