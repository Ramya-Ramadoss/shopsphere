package com.shopsphere.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "product_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage extends BaseEntity {

    @NotBlank
    @Column(nullable = false)
    private String imageUrl;

    private String altText;

    @Builder.Default
    private Boolean primaryImage = false;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
}