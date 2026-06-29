package com.shopsphere.controller;

import com.shopsphere.dto.request.LoginRequest;
import com.shopsphere.dto.response.AuthResponse;
import com.shopsphere.security.CustomUserDetails;
import com.shopsphere.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final com.shopsphere.service.CustomerService customerService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Authentication attempt for email: {}", request.getEmail());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        log.info("User {} successfully authenticated with role {}", userDetails.getEmail(), userDetails.getRole());
        
        // Verify role alignment
        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            if (!userDetails.getRole().name().equalsIgnoreCase(request.getRole().trim())) {
                throw new com.shopsphere.exception.BadRequestException("Access Denied: Unauthorized role for this login portal.");
            }
        }

        String token = jwtTokenProvider.generateToken(userDetails);

        AuthResponse response = AuthResponse.builder()
                .token(token)
                .id(userDetails.getId())
                .email(userDetails.getEmail())
                .fullName(userDetails.getFullName())
                .role(userDetails.getRole().name())
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody com.shopsphere.dto.request.GoogleLoginRequest request) {
        log.info("Google OAuth login request for email: {}", request.getEmail());
        AuthResponse response = customerService.loginOrRegisterGoogle(request);
        return ResponseEntity.ok(response);
    }
}
