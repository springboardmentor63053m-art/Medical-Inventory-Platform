package com.medistock.entity;

/** The three roles supported by MediStock. */
public enum Role {
    ADMIN,      // full access, can create PHARMACIST and STAFF
    PHARMACIST, // can create STAFF only
    STAFF       // read + basic stock operations
}
