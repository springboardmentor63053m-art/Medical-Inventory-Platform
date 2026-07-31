package com.medicalinventory.exception;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String medicineName, int available, int requested) {
        super(String.format("Insufficient stock for '%s'. Available: %d, Requested: %d", medicineName, available, requested));
    }
}
