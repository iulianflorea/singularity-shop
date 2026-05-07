package com.singularity.shop.config;

import com.singularity.shop.entity.Customer;
import com.singularity.shop.repository.CustomerRepository;
import com.singularity.shop.service.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final SettingService settingService;

    @Override
    public void run(ApplicationArguments args) {
        if (customerRepository.findByEmail("admin@singularity-cloud.com").isEmpty()) {
            customerRepository.save(Customer.builder()
                    .email("admin@singularity-cloud.com")
                    .name("Admin")
                    .passwordHash(passwordEncoder.encode("rgbiuli1"))
                    .role("ADMIN")
                    .build());
        }
        settingService.initDefaults();
    }
}
