package com.medistock.user.repository;

import com.medistock.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByEmployeeId(String employeeId);
    Optional<User> findByEmailOrEmployeeId(String email, String employeeId);
    Boolean existsByEmail(String email);
    Boolean existsByEmployeeId(String employeeId);
}
