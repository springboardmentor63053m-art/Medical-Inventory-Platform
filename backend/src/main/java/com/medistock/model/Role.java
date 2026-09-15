package com.medistock.model;

public enum Role {
    ADMIN,
    PHARMACIST,
    STAFF,
    /**
     * Optional role (see MediStock User Roles & Dashboard Guide, section 5).
     * Not one of the three core documented roles, but supported so a
     * supplier can log in and see only their own profile, supplied
     * medicines, and purchase/order activity.
     */
    SUPPLIER
}
