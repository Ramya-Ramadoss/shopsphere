package com.shopsphere.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

@Entity
@Table(name = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory extends BaseEntity {

    @Min(0)
    private Integer quantity;

    @Min(0)
    private Integer reservedQuantity;

    @Builder.Default
    private Boolean inStock = true;

    @OneToOne
    @JoinColumn(name = "product_id")
    private Product product;
}