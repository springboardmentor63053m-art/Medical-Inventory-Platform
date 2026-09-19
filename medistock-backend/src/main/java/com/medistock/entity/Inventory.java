package com.medistock.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medicine_id", nullable = false, unique = true)
    private Medicine medicine;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "minimum_stock", nullable = false)
    private Integer minimumStock;

    @Column(name = "maximum_stock", nullable = false)
    private Integer maximumStock;

    @Column(length = 200)
    private String location;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    public Inventory() {}

    public Inventory(Long id, Medicine medicine, Integer quantity, Integer minimumStock, Integer maximumStock, String location, LocalDateTime lastUpdated) {
        this.id = id;
        this.medicine = medicine;
        this.quantity = quantity;
        this.minimumStock = minimumStock;
        this.maximumStock = maximumStock;
        this.location = location;
        this.lastUpdated = lastUpdated;
    }

    @PrePersist
    protected void onCreate() {
        this.lastUpdated = LocalDateTime.now();
        if (this.quantity == null) this.quantity = 0;
        if (this.minimumStock == null) this.minimumStock = 0;
        if (this.maximumStock == null) this.maximumStock = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Medicine getMedicine() { return medicine; }
    public void setMedicine(Medicine medicine) { this.medicine = medicine; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getMinimumStock() { return minimumStock; }
    public void setMinimumStock(Integer minimumStock) { this.minimumStock = minimumStock; }

    public Integer getMaximumStock() { return maximumStock; }
    public void setMaximumStock(Integer maximumStock) { this.maximumStock = maximumStock; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    public static InventoryBuilder builder() { return new InventoryBuilder(); }

    public static class InventoryBuilder {
        private Long id;
        private Medicine medicine;
        private Integer quantity;
        private Integer minimumStock;
        private Integer maximumStock;
        private String location;
        private LocalDateTime lastUpdated;

        public InventoryBuilder id(Long id) { this.id = id; return this; }
        public InventoryBuilder medicine(Medicine medicine) { this.medicine = medicine; return this; }
        public InventoryBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public InventoryBuilder minimumStock(Integer minimumStock) { this.minimumStock = minimumStock; return this; }
        public InventoryBuilder maximumStock(Integer maximumStock) { this.maximumStock = maximumStock; return this; }
        public InventoryBuilder location(String location) { this.location = location; return this; }
        public InventoryBuilder lastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; return this; }

        public Inventory build() {
            return new Inventory(id, medicine, quantity, minimumStock, maximumStock, location, lastUpdated);
        }
    }
}
