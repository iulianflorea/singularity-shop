package com.singularity.shop.service;

import com.singularity.shop.client.PaymentServiceClient;
import com.singularity.shop.dto.CustomerDto;
import com.singularity.shop.entity.Customer;
import com.singularity.shop.exception.BadRequestException;
import com.singularity.shop.exception.ResourceNotFoundException;
import com.singularity.shop.repository.CustomerRepository;
import com.singularity.shop.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final PaymentServiceClient paymentServiceClient;

    @Transactional
    public CustomerDto.AuthResponse register(CustomerDto.RegisterRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        String externalPaymentId = null;
        try {
            PaymentServiceClient.ExternalCustomerResponse externalCustomer =
                    paymentServiceClient.createExternalCustomer(request.getEmail(), request.getName());
            if (externalCustomer != null) {
                externalPaymentId = externalCustomer.getCustomerId().toString();
            }
        } catch (Exception ignored) {}

        Customer customer = Customer.builder()
                .email(request.getEmail())
                .name(request.getName())
                .address(request.getAddress())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .externalPaymentId(externalPaymentId)
                .build();

        customer = customerRepository.save(customer);
        String token = jwtUtil.generateToken(customer.getEmail(), customer.getId());

        return CustomerDto.AuthResponse.builder()
                .token(token)
                .customer(toResponse(customer))
                .build();
    }

    public CustomerDto.AuthResponse login(CustomerDto.LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            throw new BadRequestException("Invalid email or password");
        }

        Customer customer = customerRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        String token = jwtUtil.generateToken(customer.getEmail(), customer.getId());

        return CustomerDto.AuthResponse.builder()
                .token(token)
                .customer(toResponse(customer))
                .build();
    }

    public CustomerDto.Response getByEmail(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return toResponse(customer);
    }

    private CustomerDto.Response toResponse(Customer c) {
        return CustomerDto.Response.builder()
                .id(c.getId())
                .email(c.getEmail())
                .name(c.getName())
                .address(c.getAddress())
                .role(c.getRole())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
