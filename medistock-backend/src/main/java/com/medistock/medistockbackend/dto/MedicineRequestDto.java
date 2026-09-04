package com.medistock.medistockbackend.dto;

public class MedicineRequestDto {
    private String name;
    private String description;
    private String category;
    private Double price;
    private SupplierIdDto supplier;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public static class SupplierIdDto {
        private Long id;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
    }

    public SupplierIdDto getSupplier() {
        return supplier;
    }

    public void setSupplier(SupplierIdDto supplier) {
        this.supplier = supplier;
    }
}
