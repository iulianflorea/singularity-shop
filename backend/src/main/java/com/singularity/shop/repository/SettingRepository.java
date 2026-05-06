package com.singularity.shop.repository;

import com.singularity.shop.entity.Setting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SettingRepository extends JpaRepository<Setting, String> {}
