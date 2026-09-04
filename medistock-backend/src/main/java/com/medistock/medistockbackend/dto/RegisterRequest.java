package com.medistock.medistockbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RegisterRequest {

    @NotBlank
    private String username;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    private String phone;

    private String role;


    // ==========================
    // CONSTRUCTOR
    // ==========================

    public RegisterRequest() {
    }


    // ==========================
    // GETTERS
    // ==========================

    public String getUsername() {
        return this.username;
    }

    public String getEmail() {
        return this.email;
    }

    public String getPassword() {
        return this.password;
    }

    public String getPhone() {
        return this.phone;
    }

    public String getRole() {
        return this.role;
    }


    // ==========================
    // SETTERS
    // ==========================

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setRole(String role) {
        this.role = role;
    }


    // ==========================
    // EQUALS
    // ==========================

    @Override
    public boolean equals(Object o) {

        if (this == o) {
            return true;
        }

        if (!(o instanceof RegisterRequest)) {
            return false;
        }

        RegisterRequest other = (RegisterRequest) o;

        if (username == null
                ? other.username != null
                : !username.equals(other.username)) {
            return false;
        }

        if (email == null
                ? other.email != null
                : !email.equals(other.email)) {
            return false;
        }

        if (password == null
                ? other.password != null
                : !password.equals(other.password)) {
            return false;
        }

        if (phone == null
                ? other.phone != null
                : !phone.equals(other.phone)) {
            return false;
        }

        return role == null
                ? other.role == null
                : role.equals(other.role);
    }


    // ==========================
    // HASH CODE
    // ==========================

    @Override
    public int hashCode() {

        final int PRIME = 59;

        int result = 1;

        result = result * PRIME
                + (username == null ? 43 : username.hashCode());

        result = result * PRIME
                + (email == null ? 43 : email.hashCode());

        result = result * PRIME
                + (password == null ? 43 : password.hashCode());

        result = result * PRIME
                + (phone == null ? 43 : phone.hashCode());

        result = result * PRIME
                + (role == null ? 43 : role.hashCode());

        return result;
    }


    // ==========================
    // TO STRING
    // ==========================

    @Override
    public String toString() {

        return "RegisterRequest(" +
                "username=" + username +
                ", email=" + email +
                ", password=" + password +
                ", phone=" + phone +
                ", role=" + role +
                ")";
    }
}