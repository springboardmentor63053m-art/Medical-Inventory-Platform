package com.medistock.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "suppliers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 20)
    private String contactNumber;

    @Column(length = 150)
    private String email;

    @Column(length = 255)
    private String address;

    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL)
    @JsonIgnore
    @Builder.Default
    private List<Medicine> medicines = new java.util.ArrayList<>();
}
