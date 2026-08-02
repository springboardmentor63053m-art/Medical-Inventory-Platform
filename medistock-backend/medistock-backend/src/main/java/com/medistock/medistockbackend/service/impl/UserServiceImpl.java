package com.medistock.medistockbackend.service.impl;

import com.medistock.medistockbackend.entity.User;
import com.medistock.medistockbackend.repository.UserRepository;
import com.medistock.medistockbackend.service.UserService;
import com.medistock.medistockbackend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository repository;

    @Override
    public List<User> findAll() { return repository.findAll(); }

    @Override
    public User findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Override
    public User save(User entity) { return repository.save(entity); }

    @Override
    public void deleteById(Long id) { repository.deleteById(id); }
}
