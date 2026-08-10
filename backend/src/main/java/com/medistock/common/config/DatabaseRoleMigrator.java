package com.medistock.common.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class DatabaseRoleMigrator implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("=================== DATABASE ROLE MIGRATION & INSPECTION ===================");

        // 1. Inspect initial roles table
        log.info("--- 1. Inspecting current roles table ---");
        List<Map<String, Object>> roles = jdbcTemplate.queryForList("SELECT id, name, description FROM roles ORDER BY id");
        for (Map<String, Object> r : roles) {
            log.info("Role ID: {}, Name: {}, Description: {}", r.get("id"), r.get("name"), r.get("description"));
        }

        // 2. Inspect foreign key references to roles
        log.info("--- 2. Inspecting foreign key tables referencing roles.id ---");
        List<Map<String, Object>> fkRefs = jdbcTemplate.queryForList(
                "SELECT tc.table_name, kcu.column_name " +
                "FROM information_schema.table_constraints AS tc " +
                "JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name " +
                "JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name " +
                "WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name='roles'"
        );
        for (Map<String, Object> fk : fkRefs) {
            log.info("Table referencing roles.id: {}.{}", fk.get("table_name"), fk.get("column_name"));
        }

        // 3. Identify users assigned to STAFF
        log.info("--- 3. Identifying users currently assigned to STAFF ---");
        List<Map<String, Object>> staffUsers = jdbcTemplate.queryForList(
                "SELECT u.id, u.email, u.first_name, u.last_name, r.name AS role_name " +
                "FROM users u " +
                "JOIN user_roles ur ON u.id = ur.user_id " +
                "JOIN roles r ON ur.role_id = r.id " +
                "WHERE r.name = 'STAFF'"
        );
        log.info("Found {} users assigned to STAFF:", staffUsers.size());
        for (Map<String, Object> u : staffUsers) {
            log.info("User ID: {}, Email: {}, Name: {} {}", u.get("id"), u.get("email"), u.get("first_name"), u.get("last_name"));
        }

        // 4. Identify users assigned to SYSTEM_ADMINISTRATOR
        log.info("--- 4. Identifying users currently assigned to SYSTEM_ADMINISTRATOR ---");
        List<Map<String, Object>> sysAdminUsers = jdbcTemplate.queryForList(
                "SELECT u.id, u.email, u.first_name, u.last_name, r.name AS role_name " +
                "FROM users u " +
                "JOIN user_roles ur ON u.id = ur.user_id " +
                "JOIN roles r ON ur.role_id = r.id " +
                "WHERE r.name = 'SYSTEM_ADMINISTRATOR'"
        );
        log.info("Found {} users assigned to SYSTEM_ADMINISTRATOR:", sysAdminUsers.size());
        for (Map<String, Object> u : sysAdminUsers) {
            log.info("User ID: {}, Email: {}, Name: {} {}", u.get("id"), u.get("email"), u.get("first_name"), u.get("last_name"));
        }

        // 5. Ensure SUPPLIER and STAFF roles exist
        log.info("--- 5. Ensuring SUPPLIER and STAFF roles exist in roles table ---");
        jdbcTemplate.execute(
                "INSERT INTO roles (name, description) VALUES ('SUPPLIER', 'Supplier Partner Role') " +
                "ON CONFLICT (name) DO NOTHING;"
        );
        jdbcTemplate.execute(
                "INSERT INTO roles (name, description) VALUES ('STAFF', 'Operational Inventory Staff') " +
                "ON CONFLICT (name) DO NOTHING;"
        );

        // 6. Ensure staff accounts are assigned to STAFF role
        log.info("--- 6. Ensuring staff accounts are assigned to STAFF role ---");
        jdbcTemplate.update(
                "INSERT INTO user_roles (user_id, role_id) " +
                "SELECT u.id, (SELECT id FROM roles WHERE name = 'STAFF') " +
                "FROM users u WHERE LOWER(u.email) IN ('staff@medistock.com', 'staff.member@medistock.com', 'staff.test@medistock.com') " +
                "ON CONFLICT DO NOTHING;"
        );
        jdbcTemplate.update(
                "DELETE FROM user_roles WHERE role_id = (SELECT id FROM roles WHERE name = 'PHARMACIST') " +
                "AND user_id IN (SELECT id FROM users WHERE LOWER(email) IN ('staff@medistock.com', 'staff.member@medistock.com', 'staff.test@medistock.com'));"
        );

        // 7. Migrate SYSTEM_ADMINISTRATOR users to ADMIN
        log.info("--- 7. Migrating SYSTEM_ADMINISTRATOR users to ADMIN ---");
        int sysAdminMigrated = jdbcTemplate.update(
                "INSERT INTO user_roles (user_id, role_id) " +
                "SELECT ur.user_id, (SELECT id FROM roles WHERE name = 'ADMIN') " +
                "FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE r.name = 'SYSTEM_ADMINISTRATOR' " +
                "ON CONFLICT DO NOTHING;"
        );
        log.info("Migrated user_roles entries from SYSTEM_ADMINISTRATOR to ADMIN count: {}", sysAdminMigrated);

        jdbcTemplate.update("DELETE FROM user_roles WHERE role_id IN (SELECT id FROM roles WHERE name = 'SYSTEM_ADMINISTRATOR')");

        // 8. Safely delete obsolete SYSTEM_ADMINISTRATOR from roles table
        log.info("--- 8. Removing obsolete SYSTEM_ADMINISTRATOR from roles table ---");
        int rolesDeleted = jdbcTemplate.update("DELETE FROM roles WHERE name = 'SYSTEM_ADMINISTRATOR'");
        log.info("Deleted {} obsolete roles from roles table", rolesDeleted);

        // 9. VERIFICATION QUERY 1: SELECT id, name, description FROM roles ORDER BY id;
        log.info("--- 9. VERIFICATION: Running SELECT id, name, description FROM roles ORDER BY id ---");
        List<Map<String, Object>> finalRoles = jdbcTemplate.queryForList("SELECT id, name, description FROM roles ORDER BY id");
        log.info("FINAL ROLES IN DATABASE (Count: {}):", finalRoles.size());
        for (Map<String, Object> r : finalRoles) {
            log.info("  Role ID: {}, Name: {}, Description: {}", r.get("id"), r.get("name"), r.get("description"));
        }

        // 10. VERIFICATION QUERY 2: User Role Mappings
        log.info("--- 10. VERIFICATION: Querying user_roles table to verify 4 roles ---");
        List<Map<String, Object>> userRoleCounts = jdbcTemplate.queryForList(
                "SELECT r.name AS role_name, COUNT(ur.user_id) AS user_count " +
                "FROM roles r LEFT JOIN user_roles ur ON r.id = ur.role_id " +
                "GROUP BY r.id, r.name ORDER BY r.id"
        );
        for (Map<String, Object> urc : userRoleCounts) {
            log.info("  Role: {}, Assigned Users: {}", urc.get("role_name"), urc.get("user_count"));
        }

        // 11. STANDARDIZE ALL EMPLOYEE IDs IN USERS TABLE BASED ON CURRENT ROLE
        log.info("--- 11. Standardizing employee_id values in users table ---");
        String[] targetRoles = new String[]{"ADMIN", "STAFF", "PHARMACIST", "USER", "SUPPLIER"};
        String[] rolePrefixes = new String[]{"ADM", "STF", "PHA", "USR", "SUP"};

        jdbcTemplate.update("UPDATE users SET employee_id = NULL");

        for (int i = 0; i < targetRoles.length; i++) {
            String roleName = targetRoles[i];
            String prefix = rolePrefixes[i];

            List<Map<String, Object>> roleUsers = jdbcTemplate.queryForList(
                    "SELECT DISTINCT u.id, u.first_name, u.last_name, u.email " +
                    "FROM users u " +
                    "JOIN user_roles ur ON u.id = ur.user_id " +
                    "JOIN roles r ON ur.role_id = r.id " +
                    "WHERE r.name = ? " +
                    "ORDER BY u.id ASC",
                    roleName
            );

            int seq = 1;
            for (Map<String, Object> u : roleUsers) {
                Long userId = ((Number) u.get("id")).longValue();
                String newEmpId = String.format("%s%03d", prefix, seq++);
                jdbcTemplate.update("UPDATE users SET employee_id = ? WHERE id = ?", newEmpId, userId);
                log.info("Set User ID {} ({}, Role: {}) employee_id = {}", userId, u.get("email"), roleName, newEmpId);
            }
        }

        log.info("=================== DATABASE ROLE & EMPLOYEE ID MIGRATION COMPLETE ===================");
    }
}
