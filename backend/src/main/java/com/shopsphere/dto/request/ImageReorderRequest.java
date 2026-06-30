package com.shopsphere.dto.request;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageReorderRequest {
    private List<Long> imageIds;
}
