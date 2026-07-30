package com.medistock.medistock_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "contact_person")
    private String contactPerson;

    private String email;

    private String phone;

    private String address;

    @OneToMany(mappedBy = "supplier")
    @JsonIgnore
    @Builder.Default
    private List<Medicine> medicines = new ArrayList<>();

    @OneToMany(mappedBy = "supplier")
    @JsonIgnore
    @Builder.Default
    private List<PurchaseOrder> purchaseOrders = new ArrayList<>();
}
