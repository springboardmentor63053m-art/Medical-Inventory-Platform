package com.medistock.category.repository;

import com.medistock.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
    Boolean existsByName(String name);

    @Query(
        value = "SELECT DISTINCT c.* FROM categories c JOIN medicines m ON m.category_id = c.id JOIN supplier_medicines sm ON sm.medicine_id = m.id WHERE sm.supplier_id = :supplierId ORDER BY c.name ASC",
        nativeQuery = true
    )
    List<Category> findCategoriesBySupplierId(@Param("supplierId") Long supplierId);
}
