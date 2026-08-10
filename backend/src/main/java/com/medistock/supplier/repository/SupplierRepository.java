package com.medistock.supplier.repository;

import com.medistock.supplier.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findBySupplierCode(String supplierCode);
    Optional<Supplier> findByEmailIgnoreCase(String email);
    Boolean existsBySupplierCode(String supplierCode);
    List<Supplier> findBySupplierNameContainingIgnoreCase(String name);

    @Query("select case when count(s) > 0 then true else false end " +
            "from Supplier s join s.medicines m " +
            "where s.id = :supplierId and m.id = :medicineId and s.active = true")
    boolean existsApprovedMedicineRelationship(@Param("supplierId") Long supplierId,
                                               @Param("medicineId") Long medicineId);
}
