package com.medistock.authentication.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;

    @Builder.Default
    private String type = "Bearer";

    private Long id;

    private String employeeId;

    private String email;

    private String firstName;

    private String lastName;

    private List<String> roles;
}
