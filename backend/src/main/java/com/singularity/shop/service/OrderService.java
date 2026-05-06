package com.singularity.shop.service;

import com.singularity.shop.client.PaymentServiceClient;
import com.singularity.shop.dto.OrderDto;
import com.singularity.shop.entity.*;
import com.singularity.shop.exception.ResourceNotFoundException;
import com.singularity.shop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductService productService;
    private final PaymentServiceClient paymentServiceClient;

    @Transactional
    public OrderDto.CreateResponse createOrder(OrderDto.CreateRequest request) {
        boolean isGuest = request.getCustomerId() == null;

        Customer customer = null;
        if (!isGuest) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        }

        Order order = Order.builder()
                .customerId(request.getCustomerId())
                .guestEmail(isGuest ? request.getGuestEmail() : null)
                .guestName(isGuest ? request.getGuestName() : null)
                .shippingAddress(request.getShippingAddress())
                .currency("RON")
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderDto.ItemRequest itemReq : request.getItems()) {
            Product product = productService.getProductEntity(itemReq.getProductId());
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(lineTotal);
            order.getItems().add(OrderItem.builder()
                    .order(order).productId(product.getId())
                    .quantity(itemReq.getQuantity()).unitPrice(product.getPrice())
                    .build());
        }

        BigDecimal total = subtotal.setScale(2, RoundingMode.HALF_UP);
        order.setTotalAmount(total);
        order = orderRepository.save(order);

        // Obține UUID-ul clientului din payment service
        UUID paymentCustomerId = resolvePaymentCustomerId(customer, request);

        // Suma în bani (RON * 100), fără zecimale
        long amountInBani = total.multiply(BigDecimal.valueOf(100)).longValue();

        PaymentServiceClient.PaymentIntentResponse paymentIntent = paymentServiceClient.createPaymentIntent(
                PaymentServiceClient.PaymentIntentRequest.builder()
                        .amount(amountInBani)
                        .currency("RON")
                        .customerId(paymentCustomerId)
                        .description("Order #" + order.getId())
                        .appSource("singularity-shop")
                        .build()
        );

        order.setPaymentIntentId(paymentIntent.getPaymentIntentId());
        orderRepository.save(order);

        return OrderDto.CreateResponse.builder()
                .orderId(order.getId())
                .clientSecret(paymentIntent.getClientSecret())
                .totalAmount(total)
                .currency("RON")
                .build();
    }

    private UUID resolvePaymentCustomerId(Customer customer, OrderDto.CreateRequest request) {
        if (customer != null && customer.getExternalPaymentId() != null) {
            return UUID.fromString(customer.getExternalPaymentId());
        }

        // Creează client în payment service (user fără externalPaymentId sau guest)
        String email = customer != null ? customer.getEmail() : request.getGuestEmail();
        String name  = customer != null ? customer.getName()  : request.getGuestName();
        PaymentServiceClient.ExternalCustomerResponse ext =
                paymentServiceClient.createExternalCustomer(email, name);

        if (customer != null && ext != null) {
            customer.setExternalPaymentId(ext.getCustomerId().toString());
            customerRepository.save(customer);
        }

        return ext != null ? ext.getCustomerId() : null;
    }

    public OrderDto.Response getOrder(Long orderId) {
        return toResponse(orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId)));
    }

    public List<OrderDto.Response> getCustomerOrders(Long customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public OrderDto.Response confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        PaymentServiceClient.PaymentConfirmResponse confirmResponse = paymentServiceClient.confirmPayment(
                PaymentServiceClient.PaymentConfirmRequest.builder()
                        .paymentIntentId(order.getPaymentIntentId())
                        .build()
        );

        order.setStatus("CONFIRMED");
        order.setTransactionId(confirmResponse.getTransactionId());
        return toResponse(orderRepository.save(order));
    }

    public OrderDto.Response toResponsePublic(Order o) { return toResponse(o); }

    private OrderDto.Response toResponse(Order o) {
        List<OrderDto.ItemResponse> items = o.getItems().stream().map(item -> {
            String productName = null;
            String productCode = null;
            String productImageUrl = null;
            try {
                var product = productService.getProductEntity(item.getProductId());
                productName = product.getName();
                productCode = product.getProductCode();
                productImageUrl = product.getImageUrl();
            } catch (Exception ignored) {}
            return OrderDto.ItemResponse.builder()
                    .id(item.getId()).productId(item.getProductId())
                    .productCode(productCode).productName(productName)
                    .productImageUrl(productImageUrl)
                    .quantity(item.getQuantity()).unitPrice(item.getUnitPrice())
                    .build();
        }).toList();

        String customerEmail = null;
        String customerName = null;
        if (o.getCustomerId() != null) {
            var customer = customerRepository.findById(o.getCustomerId()).orElse(null);
            if (customer != null) {
                customerEmail = customer.getEmail();
                customerName = customer.getName();
            }
        }

        return OrderDto.Response.builder()
                .id(o.getId()).customerId(o.getCustomerId())
                .customerEmail(customerEmail).customerName(customerName)
                .guestEmail(o.getGuestEmail()).guestName(o.getGuestName())
                .status(o.getStatus()).totalAmount(o.getTotalAmount())
                .currency(o.getCurrency()).paymentIntentId(o.getPaymentIntentId())
                .transactionId(o.getTransactionId()).shippingAddress(o.getShippingAddress())
                .createdAt(o.getCreatedAt()).items(items)
                .build();
    }
}
