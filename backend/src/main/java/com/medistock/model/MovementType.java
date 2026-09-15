package com.medistock.model;

public enum MovementType {
    /** Opening balance recorded the moment a medicine is first created with quantity &gt; 0. */
    INITIAL_STOCK,
    PURCHASE_IN,
    DISPENSE_OUT,
    MANUAL_ADJUSTMENT,
    DAMAGE_REMOVAL,
    EXPIRED_REMOVAL
}
