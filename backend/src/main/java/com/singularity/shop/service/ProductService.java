package com.singularity.shop.service;

import com.singularity.shop.dto.ProductDto;
import com.singularity.shop.entity.Product;
import com.singularity.shop.entity.ProductDescriptionImage;
import com.singularity.shop.entity.ProductSpecification;
import com.singularity.shop.exception.ResourceNotFoundException;
import com.singularity.shop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;



@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Page<ProductDto.Response> getProducts(int page, int size, String search, String category, String productType) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.findFiltered(productType, category, search, pageable).map(this::toResponse);
    }

    public Page<ProductDto.Response> getProducts(int page, int size, String search, String category) {
        return getProducts(page, size, search, category, null);
    }

    public List<String> getAvailableCategories(String productType) {
        return productRepository.findDistinctCategories(productType);
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

    @Transactional
    public ProductDto.Response createProduct(ProductDto.Request request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock() != null ? request.getStock() : 0)
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .productCode(request.getProductCode())
                .purchasePrice(request.getPurchasePrice())
                .productType(request.getProductType() != null ? request.getProductType() : "PHYSICAL")
                .active(request.getActive())
                .build();

        applySpecs(product, request);
        applyDescriptionImages(product, request);

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductDto.Response updateProduct(Long id, ProductDto.Request request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        if (request.getStock() != null) product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setImageUrl(request.getImageUrl());
        product.setProductCode(request.getProductCode());
        product.setPurchasePrice(request.getPurchasePrice());
        if (request.getProductType() != null) product.setProductType(request.getProductType());
        product.setActive(request.getActive());

        product.getSpecifications().clear();
        product.getDescriptionImages().clear();
        applySpecs(product, request);
        applyDescriptionImages(product, request);

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

    private void applySpecs(Product product, ProductDto.Request request) {
        if (request.getSpecifications() == null) return;
        for (int i = 0; i < request.getSpecifications().size(); i++) {
            var s = request.getSpecifications().get(i);
            if (s.getName() == null || s.getName().isBlank()) continue;
            product.getSpecifications().add(ProductSpecification.builder()
                    .product(product).name(s.getName()).value(s.getValue() != null ? s.getValue() : "")
                    .sortOrder(i).build());
        }
    }

    private void applyDescriptionImages(Product product, ProductDto.Request request) {
        if (request.getDescriptionImages() == null) return;
        for (int i = 0; i < request.getDescriptionImages().size(); i++) {
            String url = request.getDescriptionImages().get(i);
            if (url == null || url.isBlank()) continue;
            product.getDescriptionImages().add(ProductDescriptionImage.builder()
                    .product(product).imageUrl(url).sortOrder(i).build());
        }
    }

    private ProductDto.Response toResponse(Product p) {
        List<ProductDto.SpecResponse> specs = p.getSpecifications().stream()
                .map(s -> ProductDto.SpecResponse.builder()
                        .id(s.getId()).name(s.getName()).value(s.getValue()).sortOrder(s.getSortOrder()).build())
                .toList();

        List<String> descImages = p.getDescriptionImages().stream()
                .map(ProductDescriptionImage::getImageUrl).toList();

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
                .productType(p.getProductType())
                .active(p.getActive())
                .createdAt(p.getCreatedAt())
                .specifications(specs)
                .descriptionImages(descImages)
                .build();
    }
}
