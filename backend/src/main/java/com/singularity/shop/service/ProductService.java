package com.singularity.shop.service;

import com.singularity.shop.dto.ProductDto;
import com.singularity.shop.entity.Product;
import com.singularity.shop.exception.ResourceNotFoundException;
import com.singularity.shop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Page<ProductDto.Response> getProducts(int page, int size, String search, String category) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> products;

        if (category != null && search != null) {
            products = productRepository.findByCategoryAndSearchAndActiveTrue(category, search, pageable);
        } else if (search != null) {
            products = productRepository.findBySearchAndActiveTrue(search, pageable);
        } else if (category != null) {
            products = productRepository.findByCategoryAndSearchAndActiveTrue(category, null, pageable);
        } else {
            products = productRepository.findByActiveTrue(pageable);
        }

        return products.map(this::toResponse);
    }

    public ProductDto.Response getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        return toResponse(product);
    }

    public List<ProductDto.Response> getByCategory(String category) {
        return productRepository.findByCategoryAndActiveTrue(category)
                .stream().map(this::toResponse).toList();
    }

    public ProductDto.Response createProduct(ProductDto.Request request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .productCode(request.getProductCode())
                .purchasePrice(request.getPurchasePrice())
                .active(request.getActive())
                .build();
        return toResponse(productRepository.save(product));
    }

    public ProductDto.Response updateProduct(Long id, ProductDto.Request request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setImageUrl(request.getImageUrl());
        product.setProductCode(request.getProductCode());
        product.setPurchasePrice(request.getPurchasePrice());
        product.setActive(request.getActive());
        return toResponse(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        product.setActive(false);
        productRepository.save(product);
    }

    public Product getProductEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    public ProductDto.Response toPublicResponse(Product p) { return toResponse(p); }

    private ProductDto.Response toResponse(Product p) {
        return ProductDto.Response.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .stock(p.getStock())
                .category(p.getCategory())
                .imageUrl(p.getImageUrl())
                .productCode(p.getProductCode())
                .purchasePrice(p.getPurchasePrice())
                .active(p.getActive())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
