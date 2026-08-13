package com.medistock.medistock_backend.repository;

import com.medistock.medistock_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    boolean existsByRoles_Name(com.medistock.medistock_backend.entity.ERole roleName);

    @Query("SELECT COUNT(u) FROM User u WHERE NOT EXISTS (SELECT r FROM u.roles r WHERE r.name = com.medistock.medistock_backend.entity.ERole.ROLE_SUPPLIER)")
    long countNormalUsers();

    @Query("SELECT u FROM User u WHERE NOT EXISTS (SELECT r FROM u.roles r WHERE r.name = com.medistock.medistock_backend.entity.ERole.ROLE_SUPPLIER)")
    List<User> findAllNormalUsers();
}
