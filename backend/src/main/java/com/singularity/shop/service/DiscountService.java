package com.singularity.shop.service;

import com.singularity.shop.dto.DiscountDto;
import com.singularity.shop.entity.Discount;
import com.singularity.shop.exception.BadRequestException;
import com.singularity.shop.exception.ResourceNotFoundException;
import com.singularity.shop.repository.DiscountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscountService {

    private final DiscountRepository discountRepository;

    public List<DiscountDto.Response> getAll() {
        return discountRepository.findAll().stream().map(this::toResponse).toList();
    }

    public DiscountDto.Response getById(Long id) {
        return toResponse(discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found")));
    }

    @Transactional
    public DiscountDto.Response create(DiscountDto.Request request) {
        if (discountRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new BadRequestException("Codul de discount există deja");
        }
        Discount discount = Discount.builder()
                .code(request.getCode().toUpperCase())
                .type(request.getType())
                .value(request.getValue())
                .minOrderAmount(request.getMinOrderAmount())
                .maxUses(request.getMaxUses())
                .active(request.getActive())
                .validFrom(request.getValidFrom())
                .validTo(request.getValidTo())
                .build();
        return toResponse(discountRepository.save(discount));
    }

    @Transactional
    public DiscountDto.Response update(Long id, DiscountDto.Request request) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found"));
        discount.setCode(request.getCode().toUpperCase());
        discount.setType(request.getType());
        discount.setValue(request.getValue());
        discount.setMinOrderAmount(request.getMinOrderAmount());
        discount.setMaxUses(request.getMaxUses());
        discount.setActive(request.getActive());
        discount.setValidFrom(request.getValidFrom());
        discount.setValidTo(request.getValidTo());
        return toResponse(discountRepository.save(discount));
    }

    @Transactional
    public void delete(Long id) {
        discountRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Discount not found"));
        discountRepository.deleteById(id);
    }

    @Transactional
    public DiscountDto.ApplyResponse apply(DiscountDto.ApplyRequest request) {
        Discount discount = discountRepository.findByCodeIgnoreCase(request.getCode())
                .orElseThrow(() -> new BadRequestException("Cod de discount invalid"));

        if (!discount.getActive()) throw new BadRequestException("Codul de discount nu este activ");

        LocalDateTime now = LocalDateTime.now();
        if (discount.getValidFrom() != null && now.isBefore(discount.getValidFrom()))
            throw new BadRequestException("Codul de discount nu este încă valabil");
        if (discount.getValidTo() != null && now.isAfter(discount.getValidTo()))
            throw new BadRequestException("Codul de discount a expirat");
        if (discount.getMaxUses() != null && discount.getUsedCount() >= discount.getMaxUses())
            throw new BadRequestException("Codul de discount a atins limita de utilizări");
        if (discount.getMinOrderAmount() != null && request.getOrderAmount().compareTo(discount.getMinOrderAmount()) < 0)
            throw new BadRequestException("Suma minimă pentru acest cod este " + discount.getMinOrderAmount() + " RON");

        BigDecimal discountAmount;
        if ("PERCENTAGE".equals(discount.getType())) {
            discountAmount = request.getOrderAmount()
                    .multiply(discount.getValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discountAmount = discount.getValue().min(request.getOrderAmount());
        }

        BigDecimal finalAmount = request.getOrderAmount().subtract(discountAmount).max(BigDecimal.ZERO);

        discount.setUsedCount(discount.getUsedCount() + 1);
        discountRepository.save(discount);

        return DiscountDto.ApplyResponse.builder()
                .code(discount.getCode())
                .discount(discountAmount)
                .finalAmount(finalAmount)
                .build();
    }

    private DiscountDto.Response toResponse(Discount d) {
        return DiscountDto.Response.builder()
                .id(d.getId())
                .code(d.getCode())
                .type(d.getType())
                .value(d.getValue())
                .minOrderAmount(d.getMinOrderAmount())
                .maxUses(d.getMaxUses())
                .usedCount(d.getUsedCount())
                .active(d.getActive())
                .validFrom(d.getValidFrom())
                .validTo(d.getValidTo())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
