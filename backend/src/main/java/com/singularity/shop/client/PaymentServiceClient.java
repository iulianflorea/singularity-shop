package com.singularity.shop.client;

import com.singularity.shop.exception.PaymentException;
import lombok.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class PaymentServiceClient {

    private final RestTemplate restTemplate;

    @Value("${payment.service.url}")
    private String paymentServiceUrl;

    @Value("${payment.service.api-key}")
    private String apiKey;

    private static final String APP_SOURCE = "singularity-shop";

    public PaymentIntentResponse createPaymentIntent(PaymentIntentRequest request) {
        try {
            ResponseEntity<PaymentIntentResponse> response = restTemplate.exchange(
                    paymentServiceUrl + "/api/v1/payments/intent",
                    HttpMethod.POST,
                    new HttpEntity<>(request, buildHeaders()),
                    PaymentIntentResponse.class
            );
            return response.getBody();
        } catch (RestClientException e) {
            throw new PaymentException("Failed to create payment intent: " + e.getMessage());
        }
    }

    public PaymentConfirmResponse confirmPayment(PaymentConfirmRequest request) {
        try {
            ResponseEntity<PaymentConfirmResponse> response = restTemplate.exchange(
                    paymentServiceUrl + "/api/v1/payments/confirm",
                    HttpMethod.POST,
                    new HttpEntity<>(request, buildHeaders()),
                    PaymentConfirmResponse.class
            );
            return response.getBody();
        } catch (RestClientException e) {
            throw new PaymentException("Failed to confirm payment: " + e.getMessage());
        }
    }

    public ExternalCustomerResponse createExternalCustomer(String email, String name) {
        try {
            ExternalCustomerRequest req = new ExternalCustomerRequest(email, name, APP_SOURCE);
            ResponseEntity<ExternalCustomerResponse> response = restTemplate.exchange(
                    paymentServiceUrl + "/api/v1/customers",
                    HttpMethod.POST,
                    new HttpEntity<>(req, buildHeaders()),
                    ExternalCustomerResponse.class
            );
            return response.getBody();
        } catch (RestClientException e) {
            throw new PaymentException("Failed to create customer in payment service: " + e.getMessage());
        }
    }

    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Internal-Api-Key", apiKey);
        return headers;
    }

    // --- Request / Response DTOs ---

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PaymentIntentRequest {
        private Long amount;       // în bani (RON * 100)
        private String currency;
        private UUID customerId;   // UUID din payment service
        private String description;
        private String appSource;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class PaymentIntentResponse {
        private String clientSecret;
        private String paymentIntentId;
        private UUID transactionId;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PaymentConfirmRequest {
        private String paymentIntentId;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class PaymentConfirmResponse {
        private String transactionId;
        private String status;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ExternalCustomerRequest {
        private String email;
        private String name;
        private String appSource;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ExternalCustomerResponse {
        private UUID customerId;
        private String externalId;
        private String email;
        private String name;
    }
}
