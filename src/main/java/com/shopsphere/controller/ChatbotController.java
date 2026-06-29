package com.shopsphere.controller;

import com.shopsphere.dto.request.ChatbotRequest;
import com.shopsphere.dto.response.ChatbotResponse;
import com.shopsphere.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/message")
    public ResponseEntity<ChatbotResponse> getChatbotResponse(@RequestBody ChatbotRequest request) {
        ChatbotResponse response = chatbotService.getResponse(request);
        return ResponseEntity.ok(response);
    }
}
