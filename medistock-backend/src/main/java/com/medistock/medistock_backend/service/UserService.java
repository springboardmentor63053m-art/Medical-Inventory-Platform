package com.medistock.medistock_backend.service;

import com.medistock.medistock_backend.dto.UserDto;
import com.medistock.medistock_backend.dto.UserRequest;

import java.util.List;

public interface UserService {
    List<UserDto> getAllUsers();
    UserDto getUserById(Long id);
    UserDto createUser(UserRequest userRequest);
    UserDto updateUser(Long id, UserRequest userRequest);
    void deleteUser(Long id);
}
