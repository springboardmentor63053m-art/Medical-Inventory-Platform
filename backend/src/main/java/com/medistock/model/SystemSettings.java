package com.medistock.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Single-row table of admin-tunable system settings. Previously several of
 * these (near-expiry window, dead-stock window) were hardcoded constants;
 * this lets Admin change them at runtime instead of editing source and
 * redeploying — matches the requirement that Admin can "set expiry alert
 * rules" rather than the system dictating a fixed 30-day window.
 *
 * Always exactly one row (id = 1); SystemSettingsService creates it with
 * defaults on first access if it doesn't exist yet.
 */
@Entity
@Table(name = "system_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSettings {

    @Id
    private Long id;

    @Builder.Default
    private int nearExpiryWindowDays = 30;

    @Builder.Default
    private int deadStockWindowDays = 90;
}
