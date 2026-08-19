package com.medistock.reports.service;

public interface ReportService {

    byte[] generateInventoryCsv();

    byte[] generateExpiryCsv(int days);
}