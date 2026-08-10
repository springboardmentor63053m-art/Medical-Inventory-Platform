/**
 * Utility functions for user roles, supplier company counts, and authentic data helper methods.
 */

// ==========================================
// USER & ROLE UTILITIES
// ==========================================

export const normalizeRole = (role) => {
  if (!role) return '';
  let roleStr = role;
  if (typeof role === 'object' && role !== null && role.name) {
    roleStr = role.name;
  }
  return String(roleStr)
    .toUpperCase()
    .replace(/^ROLE_/, '')
    .trim();
};

export const getUserRoles = (user) => {
  if (!user) return [];
  let rawRoles = [];

  if (user.roles) {
    if (Array.isArray(user.roles)) {
      rawRoles = user.roles;
    } else if (typeof user.roles === 'object' && typeof user.roles[Symbol.iterator] === 'function') {
      rawRoles = Array.from(user.roles);
    } else if (typeof user.roles === 'string') {
      rawRoles = [user.roles];
    }
  } else if (user.role) {
    rawRoles = [user.role];
  }

  const normalized = rawRoles.map(normalizeRole).filter(Boolean);
  return Array.from(new Set(normalized));
};

export const getUsersByRole = (users, targetRole) => {
  if (!Array.isArray(users)) return [];
  if (!targetRole || targetRole === 'ALL') return users;

  const normalizedTarget = normalizeRole(targetRole);
  return users.filter((u) => {
    const roles = getUserRoles(u);
    return roles.includes(normalizedTarget);
  });
};

export const getRoleCount = (users, targetRole) => {
  return getUsersByRole(users, targetRole).length;
};

export const getSupplierCompanyCount = (suppliers = []) => {
  return Array.isArray(suppliers) ? new Set(suppliers.map(s => s.id)).size : 0;
};

// ==========================================
// SUPPLIER & MEDICINE RELATIONSHIP UTILITIES
// ==========================================

export const normalizeCompanyName = (name) => {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(token => !['ltd', 'limited', 'corp', 'corporation', 'inc', 'incorporated', 'labs', 'laboratories', 'pharma', 'pharmaceutical', 'pharmaceuticals', 'industries', 'healthcare', 'distributors', 'global', 'logistics', 'supply', 'supplies', 'chain', 'partner', 'co'].includes(token))
    .join(' ')
    .trim();
};

export const isMedicineAssociatedWithSupplier = (medicine, supplier) => {
  if (!medicine || !supplier) return false;

  const supId = Number(supplier.id);

  if (Array.isArray(medicine.suppliers) && medicine.suppliers.length > 0) {
    return medicine.suppliers.some((s) => s.id && Number(s.id) === supId);
  }

  if (Array.isArray(supplier.medicines) && supplier.medicines.length > 0) {
    return supplier.medicines.some(
      (m) => Number(m.id) === Number(medicine.id) || (m.medicineCode && m.medicineCode === medicine.medicineCode)
    );
  }

  return false;
};

export const getSuppliersForMedicine = (medicine, availableSuppliers = []) => {
  if (!medicine) return [];
  const suppliers = Array.isArray(availableSuppliers) ? availableSuppliers : [];
  return suppliers.filter((sup) => isMedicineAssociatedWithSupplier(medicine, sup));
};

export const getMedicinesSupplied = (supplier, medicines = []) => {
  if (!supplier) return [];

  const matched = new Map();

  if (Array.isArray(supplier.medicines)) {
    supplier.medicines.forEach((med) => {
      if (med && med.id) matched.set(String(med.id), med);
    });
  }

  if (Array.isArray(medicines)) {
    medicines.forEach((med) => {
      if (med && med.id && isMedicineAssociatedWithSupplier(med, supplier)) {
        if (!matched.has(String(med.id))) {
          matched.set(String(med.id), med);
        }
      }
    });
  }

  return Array.from(matched.values());
};

export const getMedicinesSuppliedCount = (supplier, medicines = []) => {
  return getMedicinesSupplied(supplier, medicines).length;
};

