package com.medistock.dto;

import com.medistock.model.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChangeUserRoleRequest {
    @NotNull
    private Role role;
}
