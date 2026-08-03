package com.medistock.medistockbackend.service;

import com.medistock.medistockbackend.entity.User;
import java.util.List;

public interface UserService {
    List<User> findAll();
    User findById(Long id);
    User save(User entity);
    void deleteById(Long id);
}
