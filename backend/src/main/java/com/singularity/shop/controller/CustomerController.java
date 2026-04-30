package com.singularity.shop.controller;

import com.singularity.shop.dto.CustomerDto;
import com.singularity.shop.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping("/register")
    public ResponseEntity<CustomerDto.AuthResponse> register(@Valid @RequestBody CustomerDto.RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<CustomerDto.AuthResponse> login(@Valid @RequestBody CustomerDto.LoginRequest request) {
        return ResponseEntity.ok(customerService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<CustomerDto.Response> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(customerService.getByEmail(userDetails.getUsername()));
    }
}
