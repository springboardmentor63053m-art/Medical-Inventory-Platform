package com.medistock.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Master list of medicine categories (Tablet, Syrup, Injection, ...).
 * Medicine.category stays a plain String for now (no FK / schema
 * migration) — this table exists so the Medicine form can offer a
 * consistent, admin-managed list instead of free text, which previously
 * let "Tablet" / "tablet" / "Tablets" all exist as different values.
 */
@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    /** Suggested reorder level for medicines newly added under this category; purely advisory. */
    private Integer defaultReorderLevel;

    @Builder.Default
    private Boolean active = true;
}
