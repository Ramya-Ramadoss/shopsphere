package com.shopsphere.service;

import com.shopsphere.dto.request.ChatbotRequest;
import com.shopsphere.dto.response.ChatbotResponse;

public interface ChatbotService {
    ChatbotResponse getResponse(ChatbotRequest request);
}
