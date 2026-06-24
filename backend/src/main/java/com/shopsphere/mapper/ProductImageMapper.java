package com.shopsphere.mapper;

import com.shopsphere.dto.response.ProductImageResponse;
import com.shopsphere.entity.ProductImage;
import org.springframework.stereotype.Component;

@Component
public class ProductImageMapper {

    public ProductImageResponse toResponse(ProductImage image) {

        return ProductImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .altText(image.getAltText())
                .primaryImage(image.getPrimaryImage())
                .build();
    }
}