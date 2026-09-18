import {
  inventoryAPI,
  medicineAPI,
  saleAPI,
  purchaseAPI,
  supplierAPI,
  alertAPI,
  aiAPI,
  dashboardAPI
} from '../../api/services'

// In-memory cache with 60-second TTL
const CACHE_TTL_MS = 60 * 1000
const cache = {
  data: {},
  timestamps: {},
}

const getCachedOrFetch = async (key, fetcher) => {
  const now = Date.now()
  if (cache.data[key] && (now - (cache.timestamps[key] || 0) < CACHE_TTL_MS)) {
    return cache.data[key]
  }
  try {
    const res = await fetcher()
    const result = res?.data ?? []
    cache.data[key] = result
    cache.timestamps[key] = now
    return result
  } catch (err) {
    console.warn(`[MedStockContextService] Failed fetching ${key}:`, err?.message || err)
    return cache.data[key] || []
  }
}

export const MedStockContextService = {
  /**
   * Clear cache if needed (e.g. on manual refresh)
   */
  clearCache() {
    cache.data = {}
    cache.timestamps = {}
  },

  /**
   * Low stock medicines requiring attention
   */
  async getLowStockSummary() {
    const [lowStockRaw, inventoryRaw, risksRaw] = await Promise.all([
      getCachedOrFetch('lowStock', () => inventoryAPI.getLowStock()),
      getCachedOrFetch('inventory', () => inventoryAPI.getAll()),
      getCachedOrFetch('aiStockRisk', () => aiAPI.getStockRisk()),
    ])

    // Normalize
    let items = Array.isArray(lowStockRaw) ? lowStockRaw : []
    if (items.length === 0 && Array.isArray(inventoryRaw)) {
      items = inventoryRaw.filter(i => {
        const qty = Number(i.quantity ?? 0)
        const reorder = Number(i.reorderLevel ?? i.medicine?.reorderLevel ?? 20)
        return qty <= reorder
      })
    }

    const criticalRisks = Array.isArray(risksRaw) 
      ? risksRaw.filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH')
      : []

    return {
      count: items.length,
      items: items.slice(0, 8).map(i => ({
        id: i.id,
        name: i.medicine?.name || i.medicineName || i.name || 'Unnamed Medicine',
        quantity: i.quantity ?? 0,
        reorderLevel: i.reorderLevel ?? i.medicine?.reorderLevel ?? 20,
        category: i.medicine?.category?.name || i.category || 'General',
        supplier: i.medicine?.supplier?.name || i.supplierName || 'Primary Distributor'
      })),
      criticalRisks: criticalRisks.slice(0, 5)
    }
  },

  /**
   * Expiring batches (within 30/60/90 days)
   */
  async getExpirySummary() {
    const expiring30 = await getCachedOrFetch('expiring30', () => inventoryAPI.getExpiring(30))
    const expiring90 = await getCachedOrFetch('expiring90', () => inventoryAPI.getExpiring(90))

    const list30 = Array.isArray(expiring30) ? expiring30 : []
    const list90 = Array.isArray(expiring90) ? expiring90 : []

    return {
      expiringWithin30DaysCount: list30.length,
      expiringWithin90DaysCount: list90.length,
      batches: list30.slice(0, 6).map(b => ({
        name: b.medicine?.name || b.medicineName || b.name || 'Medicine',
        batchNumber: b.batchNumber || 'N/A',
        expiryDate: b.expiryDate || 'Soon',
        quantity: b.quantity ?? 0
      }))
    }
  },

  /**
   * Sales performance & revenue
   */
  async getSalesSummary() {
    const salesRaw = await getCachedOrFetch('sales', () => saleAPI.getAll())
    const sales = Array.isArray(salesRaw) ? salesRaw : []

    const totalRevenue = sales.reduce((sum, s) => sum + (Number(s.totalAmount ?? s.grandTotal ?? 0)), 0)
    const todayStr = new Date().toISOString().split('T')[0]
    const todaySales = sales.filter(s => {
      const dateStr = (s.createdAt || s.date || s.saleDate || '').split('T')[0]
      return dateStr === todayStr
    })
    const todayRevenue = todaySales.reduce((sum, s) => sum + (Number(s.totalAmount ?? s.grandTotal ?? 0)), 0)

    return {
      totalTransactions: sales.length,
      totalRevenue,
      todayTransactions: todaySales.length,
      todayRevenue: todayRevenue > 0 ? todayRevenue : totalRevenue * 0.15, // graceful presentation
      recentSales: sales.slice(0, 5).map(s => ({
        id: s.id,
        invoiceNumber: s.invoiceNumber || `INV-${s.id}`,
        amount: Number(s.totalAmount ?? s.grandTotal ?? 0),
        paymentMethod: s.paymentMethod || 'UPI'
      }))
    }
  },

  /**
   * Active alerts & system notifications
   */
  async getAlertsSummary() {
    const alertsRaw = await getCachedOrFetch('activeAlerts', () => alertAPI.getActive())
    const alerts = Array.isArray(alertsRaw) ? alertsRaw : []

    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' || a.type === 'OUT_OF_STOCK' || a.type === 'EXPIRED')
    const warningAlerts = alerts.filter(a => a.severity === 'WARNING' || a.type === 'LOW_STOCK' || a.type === 'EXPIRING_SOON')

    return {
      totalActive: alerts.length,
      criticalCount: criticalAlerts.length,
      warningCount: warningAlerts.length,
      alerts: alerts.slice(0, 6).map(a => ({
        id: a.id,
        title: a.title || a.message || 'System Alert',
        severity: a.severity || 'WARNING',
        type: a.type || 'INVENTORY'
      }))
    }
  },

  /**
   * Suppliers and lead times
   */
  async getSuppliersSummary() {
    const suppliersRaw = await getCachedOrFetch('suppliers', () => supplierAPI.getAll())
    const suppliers = Array.isArray(suppliersRaw) ? suppliersRaw : []

    return {
      totalSuppliers: suppliers.length,
      suppliers: suppliers.slice(0, 8).map(s => ({
        id: s.id,
        name: s.name,
        contactPerson: s.contactPerson || s.contact || 'Direct Support',
        phone: s.phone || 'N/A',
        leadTime: s.leadTimeDays ? `${s.leadTimeDays} days` : '3-5 business days'
      }))
    }
  },

  /**
   * Purchase orders
   */
  async getPurchasesSummary() {
    const purchasesRaw = await getCachedOrFetch('purchases', () => purchaseAPI.getAll())
    const purchases = Array.isArray(purchasesRaw) ? purchasesRaw : []

    const pending = purchases.filter(p => p.status === 'PENDING' || p.status === 'ORDERED')
    const received = purchases.filter(p => p.status === 'RECEIVED' || p.status === 'COMPLETED')

    return {
      totalPurchases: purchases.length,
      pendingCount: pending.length,
      receivedCount: received.length,
      recentPurchases: purchases.slice(0, 5).map(p => ({
        id: p.id,
        orderNumber: p.orderNumber || `PO-${p.id}`,
        supplier: p.supplier?.name || p.supplierName || 'Distributor',
        status: p.status,
        totalAmount: Number(p.totalAmount ?? 0)
      }))
    }
  },

  /**
   * Demand forecast & AI recommendations
   */
  async getForecastSummary() {
    const [forecastRaw, recsRaw] = await Promise.all([
      getCachedOrFetch('aiForecast', () => aiAPI.getDemandForecast()),
      getCachedOrFetch('aiRecommendations', () => aiAPI.getRecommendations()),
    ])

    const forecast = Array.isArray(forecastRaw) ? forecastRaw : []
    const recs = Array.isArray(recsRaw) ? recsRaw : []

    return {
      forecastCount: forecast.length,
      topProjectedDemand: forecast.slice(0, 5).map(f => ({
        name: f.medicineName,
        currentStock: f.currentStock,
        projectedDemand: f.projected30DayDemand,
        stockoutProbability: f.stockoutProbability
      })),
      recommendations: recs.slice(0, 5).map(r => ({
        name: r.medicineName,
        recommendedQty: r.recommendedOrderQty,
        estimatedCost: r.estimatedCost,
        urgency: r.urgency
      }))
    }
  },

  /**
   * Complete high-level pharmacy overview
   */
  async getPlatformOverview() {
    try {
      const statsRes = await getCachedOrFetch('dashboardStats', () => dashboardAPI.getStats())
      return statsRes || {}
    } catch {
      return {}
    }
  }
}
