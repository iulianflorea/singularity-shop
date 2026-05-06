package com.singularity.shop.controller;

import com.singularity.shop.dto.PurchaseOrderDto;
import com.singularity.shop.service.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping
    public ResponseEntity<List<PurchaseOrderDto.Response>> getAll() {
        return ResponseEntity.ok(purchaseOrderService.getAll());
    }

    @PostMapping
    public ResponseEntity<PurchaseOrderDto.Response> create(@Valid @RequestBody PurchaseOrderDto.Request req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(purchaseOrderService.create(req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        purchaseOrderService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
