package com.medistock.medistock_backend.repository;

import com.medistock.medistock_backend.entity.ERole;
import com.medistock.medistock_backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);
}
