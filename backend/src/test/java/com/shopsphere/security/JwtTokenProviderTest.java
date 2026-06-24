package com.shopsphere.security;

import com.shopsphere.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

public class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private CustomUserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        // Set the private fields using ReflectionTestUtils (from spring-test)
        ReflectionTestUtils.setField(jwtTokenProvider, "secret", "9a67471ec6391621d4be883f0d03d3c87e8b3e8c56fa91176b6d5b0a3c20df89");
        ReflectionTestUtils.setField(jwtTokenProvider, "expiration", 3600000L); // 1 hour

        userDetails = new CustomUserDetails(
                1L,
                "test@shopsphere.com",
                "encodedPassword",
                Role.CUSTOMER,
                "Test User"
        );
    }

    @Test
    void testGenerateAndValidateToken() {
        String token = jwtTokenProvider.generateToken(userDetails);
        assertNotNull(token);

        assertTrue(jwtTokenProvider.validateToken(token, userDetails));
        assertEquals("test@shopsphere.com", jwtTokenProvider.getUsernameFromToken(token));
    }

    @Test
    void testExtractClaims() {
        String token = jwtTokenProvider.generateToken(userDetails);
        assertNotNull(token);

        Long userId = jwtTokenProvider.getClaimFromToken(token, claims -> claims.get("userId", Long.class));
        String role = jwtTokenProvider.getClaimFromToken(token, claims -> claims.get("role", String.class));
        String fullName = jwtTokenProvider.getClaimFromToken(token, claims -> claims.get("fullName", String.class));

        assertEquals(1L, userId);
        assertEquals("CUSTOMER", role);
        assertEquals("Test User", fullName);
    }

    @Test
    void testValidateTokenWithDifferentUserFails() {
        String token = jwtTokenProvider.generateToken(userDetails);
        assertNotNull(token);

        CustomUserDetails differentUser = new CustomUserDetails(
                2L,
                "other@shopsphere.com",
                "password",
                Role.CUSTOMER,
                "Other User"
        );

        assertFalse(jwtTokenProvider.validateToken(token, differentUser));
    }
}
