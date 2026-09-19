package com.medistock.service;

import com.medistock.dto.PageResponse;
import com.medistock.dto.UserDTO;
import com.medistock.dto.UserUpdateRequest;
import org.springframework.data.domain.Pageable;

public interface UserService {
    PageResponse<UserDTO> getAllUsers(String search, Pageable pageable);
    UserDTO getUserById(Long id);
    UserDTO getUserByEmail(String email);
    UserDTO updateUser(Long id, UserUpdateRequest request);
    void deleteUser(Long id);
}
