package com.singularity.shop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_description_images")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductDescriptionImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "sort_order")
    private int sortOrder;
}
