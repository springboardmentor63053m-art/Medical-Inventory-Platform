package com.medistock.dto;

public class UserUpdateRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private String status;
    private Long roleId;

    public UserUpdateRequest() {}

    public UserUpdateRequest(String firstName, String lastName, String phone, String status, Long roleId) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.status = status;
        this.roleId = roleId;
    }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
}
