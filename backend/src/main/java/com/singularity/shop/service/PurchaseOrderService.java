package com.singularity.shop.service;

import com.singularity.shop.dto.PurchaseOrderDto;
import com.singularity.shop.entity.Product;
import com.singularity.shop.entity.PurchaseOrder;
import com.singularity.shop.entity.PurchaseOrderItem;
import com.singularity.shop.exception.ResourceNotFoundException;
import com.singularity.shop.repository.ProductRepository;
import com.singularity.shop.repository.PurchaseOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ProductRepository productRepository;

    public List<PurchaseOrderDto.Response> getAll() {
        return purchaseOrderRepository.findAllByOrderByOrderDateDescCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    public PurchaseOrderDto.Response create(PurchaseOrderDto.Request req) {
        PurchaseOrder po = PurchaseOrder.builder()
                .notes(req.getNotes())
                .orderDate(req.getOrderDate() != null ? req.getOrderDate() : java.time.LocalDate.now())
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (PurchaseOrderDto.ItemRequest itemReq : req.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));
            BigDecimal lineTotal = itemReq.getUnitPurchasePrice()
                    .multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            total = total.add(lineTotal);
            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(po)
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(itemReq.getQuantity())
                    .unitPurchasePrice(itemReq.getUnitPurchasePrice())
                    .build();
            po.getItems().add(item);
        }

        po.setTotalAmount(total);
        PurchaseOrder saved = purchaseOrderRepository.save(po);

        // Update stock for each product
        for (PurchaseOrderItem item : saved.getItems()) {
            productRepository.findById(item.getProductId()).ifPresent(product -> {
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            });
        }

        return toResponse(saved);
    }

    public void delete(Long id) {
        purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found: " + id));
        purchaseOrderRepository.deleteById(id);
    }

    public PurchaseOrderDto.Response toResponse(PurchaseOrder po) {
        List<PurchaseOrderDto.ItemResponse> items = po.getItems().stream()
                .map(i -> PurchaseOrderDto.ItemResponse.builder()
                        .id(i.getId())
                        .productId(i.getProductId())
                        .productName(i.getProductName())
                        .quantity(i.getQuantity())
                        .unitPurchasePrice(i.getUnitPurchasePrice())
                        .lineTotal(i.getUnitPurchasePrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                        .build())
                .toList();
        return PurchaseOrderDto.Response.builder()
                .id(po.getId())
                .createdAt(po.getCreatedAt())
                .orderDate(po.getOrderDate())
                .notes(po.getNotes())
                .totalAmount(po.getTotalAmount())
                .items(items)
                .build();
    }
}
