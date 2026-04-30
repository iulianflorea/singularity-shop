package com.singularity.shop.service;

import com.singularity.shop.dto.CartDto;
import com.singularity.shop.entity.Product;
import com.singularity.shop.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.19");
    private static final String CURRENCY = "RON";

    private final ProductService productService;

    public CartDto.CalculateResponse calculate(CartDto.CalculateRequest request) {
        List<CartDto.ItemDetail> itemDetails = request.getItems().stream().map(item -> {
            Product product = productService.getProductEntity(item.getProductId());
            if (!product.getActive()) {
                throw new BadRequestException("Product is not available: " + product.getName());
            }
            if (product.getStock() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for: " + product.getName());
            }
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            return CartDto.ItemDetail.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .imageUrl(product.getImageUrl())
                    .quantity(item.getQuantity())
                    .unitPrice(product.getPrice())
                    .lineTotal(lineTotal)
                    .build();
        }).toList();

        BigDecimal subtotal = itemDetails.stream()
                .map(CartDto.ItemDetail::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax).setScale(2, RoundingMode.HALF_UP);

        return CartDto.CalculateResponse.builder()
                .subtotal(subtotal.setScale(2, RoundingMode.HALF_UP))
                .tax(tax)
                .total(total)
                .currency(CURRENCY)
                .items(itemDetails)
                .build();
    }
}
