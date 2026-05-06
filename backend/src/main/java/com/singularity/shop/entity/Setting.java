package com.singularity.shop.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Setting {

    @Id
    @Column(name = "setting_key")
    private String key;

    @Column(nullable = false)
    private String value;
}
