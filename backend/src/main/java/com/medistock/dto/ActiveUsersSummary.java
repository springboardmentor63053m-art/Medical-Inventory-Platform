package com.medistock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActiveUsersSummary {
    private long totalActive;
    /** e.g. {"ADMIN": 1, "PHARMACIST": 2, "STAFF": 4, "SUPPLIER": 1} — includes every role, even zero counts. */
    private Map<String, Long> byRole;
    private List<ActiveUserResponse> users;
}
