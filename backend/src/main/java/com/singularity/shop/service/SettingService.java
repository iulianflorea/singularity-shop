package com.singularity.shop.service;

import com.singularity.shop.entity.Setting;
import com.singularity.shop.repository.SettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class SettingService {

    private static final String KEY_TVA = "TVA_RATE";
    private static final BigDecimal DEFAULT_TVA = new BigDecimal("19");

    private final SettingRepository settingRepository;

    public BigDecimal getTvaRate() {
        return settingRepository.findById(KEY_TVA)
                .map(s -> new BigDecimal(s.getValue()))
                .orElse(DEFAULT_TVA);
    }

    public BigDecimal setTvaRate(BigDecimal rate) {
        Setting s = settingRepository.findById(KEY_TVA).orElse(new Setting(KEY_TVA, "19"));
        s.setValue(rate.stripTrailingZeros().toPlainString());
        settingRepository.save(s);
        return rate;
    }

    public void initDefaults() {
        if (!settingRepository.existsById(KEY_TVA)) {
            settingRepository.save(new Setting(KEY_TVA, DEFAULT_TVA.toPlainString()));
        }
    }
}
