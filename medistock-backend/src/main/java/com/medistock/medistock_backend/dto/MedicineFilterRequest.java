package com.medistock.medistock_backend.dto;

import com.medistock.medistock_backend.entity.MedicineSortField;
import com.medistock.medistock_backend.entity.SortDirection;
import com.medistock.medistock_backend.entity.StockStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineFilterRequest {
    private String search;
    private Long categoryId;
    private Long supplierId;
    private StockStatus stockStatus;
    private MedicineSortField sortBy;
    private SortDirection sortDirection;
    private Integer page;
    private Integer size;
    private Boolean all;
}
