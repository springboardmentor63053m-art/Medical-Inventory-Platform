package com.medistock.medistockbackend.service;

import com.medistock.medistockbackend.entity.Role;
import java.util.List;

public interface RoleService {
    List<Role> findAll();
    Role findById(Long id);
    Role save(Role entity);
    void deleteById(Long id);
}
