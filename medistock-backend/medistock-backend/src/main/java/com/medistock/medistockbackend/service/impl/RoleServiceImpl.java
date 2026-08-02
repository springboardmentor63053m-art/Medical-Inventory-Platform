package com.medistock.medistockbackend.service.impl;

import com.medistock.medistockbackend.entity.Role;
import com.medistock.medistockbackend.repository.RoleRepository;
import com.medistock.medistockbackend.service.RoleService;
import com.medistock.medistockbackend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository repository;

    @Override
    public List<Role> findAll() { return repository.findAll(); }

    @Override
    public Role findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + id));
    }

    @Override
    public Role save(Role entity) { return repository.save(entity); }

    @Override
    public void deleteById(Long id) { repository.deleteById(id); }
}
