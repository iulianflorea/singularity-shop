package com.singularity.shop.controller;

import com.singularity.shop.dto.CartDto;
import com.singularity.shop.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/calculate")
    public ResponseEntity<CartDto.CalculateResponse> calculate(@Valid @RequestBody CartDto.CalculateRequest request) {
        return ResponseEntity.ok(cartService.calculate(request));
    }
}
