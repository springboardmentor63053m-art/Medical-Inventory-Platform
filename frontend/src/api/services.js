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
  getByMedicine:(mid)    => axiosInstance.get(`/inventory/medicine/${mid}`),
  getLowStock:  ()       => axiosInstance.get('/inventory/low-stock'),
  getExpiring:  (days)   => axiosInstance.get('/inventory/expiring', { params: { days } }),
  adjust:       (data)   => axiosInstance.post('/inventory/adjust', data),
}

// ── Purchases ─────────────────────────────────────────────────
export const purchaseAPI = {
  getAll:   ()    => axiosInstance.get('/purchases'),
  getById:  (id)  => axiosInstance.get(`/purchases/${id}`),
  create:   (d)   => axiosInstance.post('/purchases', d),
  receive:  (id)  => axiosInstance.put(`/purchases/${id}/receive`),
  cancel:   (id)  => axiosInstance.put(`/purchases/${id}/cancel`),
}

// ── Sales ─────────────────────────────────────────────────────
export const saleAPI = {
  getAll:   ()    => axiosInstance.get('/sales'),
  getById:  (id)  => axiosInstance.get(`/sales/${id}`),
  create:   (d)   => axiosInstance.post('/sales', d),
  cancel:   (id)  => axiosInstance.put(`/sales/${id}/cancel`),
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
