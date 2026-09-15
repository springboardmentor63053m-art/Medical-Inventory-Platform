package com.medistock.repository;

import com.medistock.model.Role;
import com.medistock.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsBySupplierId(Long supplierId);

    /** Used to enforce "cannot deactivate/demote the last remaining Admin" (requirement 23). */
    long countByRole(Role role);
}
