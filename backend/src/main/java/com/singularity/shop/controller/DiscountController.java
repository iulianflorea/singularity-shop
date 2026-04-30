package com.singularity.shop.controller;

import com.singularity.shop.dto.DiscountDto;
import com.singularity.shop.service.DiscountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService discountService;

    @GetMapping
    public ResponseEntity<List<DiscountDto.Response>> getAll() {
        return ResponseEntity.ok(discountService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiscountDto.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(discountService.getById(id));
    }

    @PostMapping
    public ResponseEntity<DiscountDto.Response> create(@Valid @RequestBody DiscountDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(discountService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiscountDto.Response> update(@PathVariable Long id,
                                                        @Valid @RequestBody DiscountDto.Request request) {
        return ResponseEntity.ok(discountService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        discountService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/apply")
    public ResponseEntity<DiscountDto.ApplyResponse> apply(@Valid @RequestBody DiscountDto.ApplyRequest request) {
        return ResponseEntity.ok(discountService.apply(request));
    }
}
