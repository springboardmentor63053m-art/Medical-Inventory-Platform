package com.medistock.medistockbackend.service;

import com.medistock.medistockbackend.entity.Report;
import java.util.List;

public interface ReportService {
    List<Report> findAll();
    Report findById(Long id);
    Report save(Report entity);
    void deleteById(Long id);
}
