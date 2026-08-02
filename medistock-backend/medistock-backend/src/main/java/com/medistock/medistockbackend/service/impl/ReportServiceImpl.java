package com.medistock.medistockbackend.service.impl;

import com.medistock.medistockbackend.entity.Report;
import com.medistock.medistockbackend.repository.ReportRepository;
import com.medistock.medistockbackend.service.ReportService;
import com.medistock.medistockbackend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRepository repository;

    @Override
    public List<Report> findAll() { return repository.findAll(); }

    @Override
    public Report findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + id));
    }

    @Override
    public Report save(Report entity) { return repository.save(entity); }

    @Override
    public void deleteById(Long id) { repository.deleteById(id); }
}
