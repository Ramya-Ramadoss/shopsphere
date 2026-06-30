package com.shopsphere.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatbotResponse {
    private String reply;
    private List<ProductResponse> products;
    private List<OrderResponse> orders;
    private List<String> suggestions;
}
