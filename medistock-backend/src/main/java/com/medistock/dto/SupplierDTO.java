package com.medistock.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class SupplierDTO {
    private Long id;

    @NotBlank(message = "Supplier name is required")
    private String supplierName;

    private String contactPerson;

    @Email(message = "Invalid email format")
    private String email;

    @Pattern(regexp = "^[+]?[0-9\\s-]{7,20}$", message = "Invalid phone number format")
    private String phone;

    private String address;
    private String city;
    private String state;
    private String country;
    private String status;
    private LocalDateTime createdAt;

    public SupplierDTO() {}

    public SupplierDTO(Long id, String supplierName, String contactPerson, String email, String phone, String address, String city, String state, String country, String status, LocalDateTime createdAt) {
        this.id = id;
        this.supplierName = supplierName;
        this.contactPerson = contactPerson;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.city = city;
        this.state = state;
        this.country = country;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static SupplierDTOBuilder builder() { return new SupplierDTOBuilder(); }

    public static class SupplierDTOBuilder {
        private Long id;
        private String supplierName;
        private String contactPerson;
        private String email;
        private String phone;
        private String address;
        private String city;
        private String state;
        private String country;
        private String status;
        private LocalDateTime createdAt;

        public SupplierDTOBuilder id(Long id) { this.id = id; return this; }
        public SupplierDTOBuilder supplierName(String supplierName) { this.supplierName = supplierName; return this; }
        public SupplierDTOBuilder contactPerson(String contactPerson) { this.contactPerson = contactPerson; return this; }
        public SupplierDTOBuilder email(String email) { this.email = email; return this; }
        public SupplierDTOBuilder phone(String phone) { this.phone = phone; return this; }
        public SupplierDTOBuilder address(String address) { this.address = address; return this; }
        public SupplierDTOBuilder city(String city) { this.city = city; return this; }
        public SupplierDTOBuilder state(String state) { this.state = state; return this; }
        public SupplierDTOBuilder country(String country) { this.country = country; return this; }
        public SupplierDTOBuilder status(String status) { this.status = status; return this; }
        public SupplierDTOBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public SupplierDTO build() {
            return new SupplierDTO(id, supplierName, contactPerson, email, phone, address, city, state, country, status, createdAt);
        }
    }
}
