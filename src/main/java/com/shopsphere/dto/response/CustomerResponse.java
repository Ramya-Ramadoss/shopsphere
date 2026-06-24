package com.shopsphere.dto.response;

import com.shopsphere.enums.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerResponse {

    private Long id;

    private String fullName;

    private String email;

    private String phone;

    private String address;

    private String city;

    private String state;

    private String pincode;

    private String country;

    private Boolean enabled;

    private Role role;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}