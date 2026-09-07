import axiosInstance from './axiosInstance'

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => axiosInstance.post('/auth/login',    data),
  register: (data) => axiosInstance.post('/auth/register', data),
}

// ── Dashboard ─────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => axiosInstance.get('/dashboard/stats'),
}

// ── Medicines ─────────────────────────────────────────────────
export const medicineAPI = {
  getAll:    (search) => axiosInstance.get('/medicines', { params: { search } }),
  getById:   (id)     => axiosInstance.get(`/medicines/${id}`),
  create:    (data)   => axiosInstance.post('/medicines', data),
  update:    (id, d)  => axiosInstance.put(`/medicines/${id}`, d),
  delete:    (id)     => axiosInstance.delete(`/medicines/${id}`),
  getByCategory: (cid) => axiosInstance.get(`/medicines/category/${cid}`),
  getBySupplier: (sid) => axiosInstance.get(`/medicines/supplier/${sid}`),
  linkSupplier:  (mid, sid) => axiosInstance.put(`/medicines/${mid}/link-supplier/${sid}`),
  unlinkSupplier:(mid) => axiosInstance.put(`/medicines/${mid}/unlink-supplier`),
}

// ── Categories ────────────────────────────────────────────────
export const categoryAPI = {
  getAll:  ()       => axiosInstance.get('/categories'),
  getById: (id)     => axiosInstance.get(`/categories/${id}`),
  create:  (data)   => axiosInstance.post('/categories', data),
  update:  (id, d)  => axiosInstance.put(`/categories/${id}`, d),
  delete:  (id)     => axiosInstance.delete(`/categories/${id}`),
}

// ── Suppliers ─────────────────────────────────────────────────
export const supplierAPI = {
  getAll:  ()       => axiosInstance.get('/suppliers'),
  getById: (id)     => axiosInstance.get(`/suppliers/${id}`),
  create:  (data)   => axiosInstance.post('/suppliers', data),
  update:  (id, d)  => axiosInstance.put(`/suppliers/${id}`, d),
  delete:  (id)     => axiosInstance.delete(`/suppliers/${id}`),
}

// ── Inventory ─────────────────────────────────────────────────
export const inventoryAPI = {
  getAll:       ()       => axiosInstance.get('/inventory'),
  getById:      (id)     => axiosInstance.get(`/inventory/${id}`),
  getByMedicine:(mid)    => axiosInstance.get(`/inventory/medicine/${mid}`),
  getLowStock:  ()       => axiosInstance.get('/inventory/low-stock'),
  getExpiring:  (days)   => axiosInstance.get('/inventory/expiring', { params: { days } }),
  create:       (data)   => axiosInstance.post('/inventory', data),
  update:       (id, d)  => axiosInstance.put(`/inventory/${id}`, d),
  delete:       (id)     => axiosInstance.delete(`/inventory/${id}`),
  adjust:       (data)   => axiosInstance.post('/inventory/adjust', data),
}

// ── Purchases ─────────────────────────────────────────────────
export const purchaseAPI = {
  getAll:   ()    => axiosInstance.get('/purchases'),
  getById:  (id)  => axiosInstance.get(`/purchases/${id}`),
  create:   (d)   => axiosInstance.post('/purchases', d),
  receive:  (id)  => axiosInstance.put(`/purchases/${id}/receive`),
  cancel:   (id)  => axiosInstance.put(`/purchases/${id}/cancel`),
  delete:   (id)  => axiosInstance.delete(`/purchases/${id}`),
}

// ── Sales ─────────────────────────────────────────────────────
export const saleAPI = {
  getAll:   ()    => axiosInstance.get('/sales'),
  getById:  (id)  => axiosInstance.get(`/sales/${id}`),
  create:   (d)   => axiosInstance.post('/sales', d),
  cancel:   (id)  => axiosInstance.put(`/sales/${id}/cancel`),
  delete:   (id)  => axiosInstance.delete(`/sales/${id}`),
}

// ── Alerts ────────────────────────────────────────────────────
export const alertAPI = {
  getAll:        ()    => axiosInstance.get('/alerts'),
  getActive:     ()    => axiosInstance.get('/alerts/active'),
  acknowledge:   (id)  => axiosInstance.put(`/alerts/${id}/acknowledge`),
  resolve:       (id)  => axiosInstance.put(`/alerts/${id}/resolve`),
}

// ── Employees ─────────────────────────────────────────────────
export const employeeAPI = {
  getAll:   ()       => axiosInstance.get('/employees'),
  getById:  (id)     => axiosInstance.get(`/employees/${id}`),
  create:   (data)   => axiosInstance.post('/employees', data),
  update:   (id, d)  => axiosInstance.put(`/employees/${id}`, d),
  delete:   (id)     => axiosInstance.delete(`/employees/${id}`),
}

// ── Stock Movements ───────────────────────────────────────────
export const stockAPI = {
  getAll:         ()      => axiosInstance.get('/stock-movements'),
  getByMedicine:  (mid)   => axiosInstance.get(`/stock-movements/medicine/${mid}`),
}

// ── Prescriptions ─────────────────────────────────────────────
export const prescriptionAPI = {
  getAll:            (status)  => axiosInstance.get('/prescriptions', { params: { status } }),
  getStats:          ()        => axiosInstance.get('/prescriptions/stats'),
  getById:           (id)      => axiosInstance.get(`/prescriptions/${id}`),
  checkAvailability: (id)      => axiosInstance.get(`/prescriptions/${id}/availability`),
  create:            (data)    => axiosInstance.post('/prescriptions', data),
  approve:           (id)      => axiosInstance.put(`/prescriptions/${id}/approve`),
  reject:            (id, body)=> axiosInstance.put(`/prescriptions/${id}/reject`, body),
  dispense:          (id)      => axiosInstance.put(`/prescriptions/${id}/dispense`),
}

// ── Patients ──────────────────────────────────────────────────
export const patientAPI = {
  getAll:   (search) => axiosInstance.get('/patients', { params: { search } }),
  getById:  (id)     => axiosInstance.get(`/patients/${id}`),
  create:   (data)   => axiosInstance.post('/patients', data),
  update:   (id, d)  => axiosInstance.put(`/patients/${id}`, d),
  delete:   (id)     => axiosInstance.delete(`/patients/${id}`),
}

// ── Doctors ───────────────────────────────────────────────────
export const doctorAPI = {
  getAll:   (search, activeOnly) => axiosInstance.get('/doctors', { params: { search, activeOnly } }),
  getById:  (id)     => axiosInstance.get(`/doctors/${id}`),
  create:   (data)   => axiosInstance.post('/doctors', data),
  update:   (id, d)  => axiosInstance.put(`/doctors/${id}`, d),
  delete:   (id)     => axiosInstance.delete(`/doctors/${id}`),
}

// ── AI Intelligence ───────────────────────────────────────────
export const aiAPI = {
  getDemandForecast: ()   => axiosInstance.get('/ai/forecast'),
  getStockRisk:      ()   => axiosInstance.get('/ai/stock-risk'),
  getRecommendations:()   => axiosInstance.get('/ai/recommendations'),
  getAnomalies:      ()   => axiosInstance.get('/ai/anomalies'),
  askAssistant:      (q)  => axiosInstance.get('/ai/assistant', { params: { q } }),
}

// ── Audit Logs ────────────────────────────────────────────────
export const auditAPI = {
  getAll:     ()         => axiosInstance.get('/audit-logs'),
  getByUser:  (userId)   => axiosInstance.get(`/audit-logs/user/${userId}`),
  getByEntity:(type, id) => axiosInstance.get('/audit-logs/entity', { params: { type, id } }),
  create:     (data)     => axiosInstance.post('/audit-logs', data),
  delete:     (id)       => axiosInstance.delete(`/audit-logs/${id}`),
  clearAll:   ()         => axiosInstance.delete('/audit-logs/clear'),
}
