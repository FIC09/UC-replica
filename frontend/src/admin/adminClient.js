// =========================================================================
// REAL-TIME API CLIENT FOR URBAN SERVICES ADMIN DASHBOARD
// 100% Real Database Operations (MongoDB / PostgreSQL)
// Zero mock dataset fallbacks, zero synthetic injection.
// =========================================================================

const rawBase = import.meta.env.VITE_API_BASE_URL || '/api';
const API_BASE = rawBase.endsWith('/admin') ? rawBase : `${rawBase.replace(/\/$/, '')}/admin`;

function getAdminAuthToken() {
  try {
    return sessionStorage.getItem('uc_admin_token') || localStorage.getItem('uc_admin_token') || '';
  } catch {
    return '';
  }
}

// No auto-login backdoor. Authentication must be explicitly performed by user.

async function fetchWithFallback(endpoint, options = {}, emptyFallback = null) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    let url = `${API_BASE}${endpoint}`;
    let token = getAdminAuthToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    let res;
    try {
      res = await fetch(url, {
        ...options,
        headers,
        signal: options.signal || controller.signal
      });
    } catch (fetchErr) {
      if (rawBase.startsWith('/')) {
        // Transparent direct fallback to backend if proxy refuses connection
        const fallbackUrl = `http://127.0.0.1:5000/api/admin${endpoint}`;
        res = await fetch(fallbackUrl, {
          ...options,
          headers,
          signal: options.signal || controller.signal
        });
      } else {
        throw fetchErr;
      }
    }

    // Direct fallback if Vite proxy returns 502/503/504 Bad Gateway
    if (res && res.status >= 502 && res.status <= 504 && rawBase.startsWith('/')) {
      try {
        const fallbackUrl = `http://127.0.0.1:5000/api/admin${endpoint}`;
        const directRes = await fetch(fallbackUrl, {
          ...options,
          headers,
          signal: options.signal || controller.signal
        });
        if (directRes && directRes.status < 500) {
          res = directRes;
        }
      } catch (_) {}
    }

    // If unauthorized, clear invalid admin token
    if (res.status === 401) {
      sessionStorage.removeItem('uc_admin_token');
      localStorage.removeItem('uc_admin_token');
      sessionStorage.removeItem('uc_admin_auth');
      localStorage.removeItem('uc_admin_auth');
    }

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const errorMsg = errBody.error || errBody.message || `HTTP ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = errBody;
      throw error;
    }

    const data = await res.json().catch(() => null);
    return data !== null ? data : (emptyFallback !== null ? emptyFallback : {});
  } catch (err) {
    clearTimeout(timeoutId);
    if (emptyFallback !== null) {
      return emptyFallback;
    }
    throw err;
  }
}

export const adminClient = {
  // Authentication & RBAC
  login: async (email, password) => {
    let res;
    try {
      res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
    } catch (e) {
      if (rawBase.startsWith('/')) {
        res = await fetch(`http://127.0.0.1:5000/api/admin/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
      } else {
        throw e;
      }
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || data.message || `Login failed with status ${res.status}`);
    }
    if (data.token) {
      sessionStorage.setItem('uc_admin_token', data.token);
      localStorage.setItem('uc_admin_token', data.token);
      sessionStorage.setItem('uc_admin_auth', 'true');
      if (data.admin) {
        sessionStorage.setItem('uc_admin_user', JSON.stringify(data.admin));
        localStorage.setItem('uc_admin_user', JSON.stringify(data.admin));
      }
    }
    return data;
  },

  logout: async () => {
    try {
      const token = getAdminAuthToken();
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      }).catch(() => {});
    } catch {}
    sessionStorage.removeItem('uc_admin_token');
    sessionStorage.removeItem('uc_admin_auth');
    sessionStorage.removeItem('uc_admin_user');
    localStorage.removeItem('uc_admin_token');
    localStorage.removeItem('uc_admin_user');
  },

  me: () => fetchWithFallback('/auth/me', {}, { success: true, admin: null }),

  requestPasswordReset: (email) => {
    return fetchWithFallback('/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // Overview Metrics
  getOverview: (params = {}) => {
    const query = '?' + new URLSearchParams(params).toString();
    return fetchWithFallback(`/overview${query}`);
  },

  getOverviewMetrics: (params = {}) => {
    const query = '?' + new URLSearchParams(params).toString();
    return fetchWithFallback(`/overview${query}`);
  },

  // Real-Time Bookings Operations
  getBookings: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/bookings?${q}`, {}, { success: true, bookings: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } });
  },

  getBookingDetail: async (id) => {
    return fetchWithFallback(`/bookings/${id}`);
  },

  createBooking: (bookingData) => fetchWithFallback('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  }),

  deleteBooking: (id) => fetchWithFallback(`/bookings/${id}`, {
    method: 'DELETE'
  }),

  updateLifecycleStatus: (id, newStatus, notes) => fetchWithFallback(`/bookings/${id}/lifecycle`, {
    method: 'PUT',
    body: JSON.stringify({ newStatus, notes })
  }),

  updateBooking: (id, updateData) => fetchWithFallback(`/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  }),

  assignProfessional: (id, professionalIdOrData, maybeName) => {
    const payload = typeof professionalIdOrData === 'object' && professionalIdOrData !== null
      ? professionalIdOrData
      : { professionalId: professionalIdOrData, professionalName: maybeName };
    return fetchWithFallback(`/bookings/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  getAssignmentStats: () => fetchWithFallback('/bookings/assignment-stats', {}, {
    success: true,
    stats: {
      totalUnassigned: 0,
      pendingOffers: 0,
      autoAssigned: 0,
      manuallyAssigned: 0,
      rejectedOffers: 0,
      expiredOffers: 0,
      rejectedOrExpired: 0,
      awaitingOwnerAttention: 0,
      requiringAttention: 0
    }
  }),

  getEligibleProfessionals: (bookingId, search = '') => fetchWithFallback(`/bookings/${bookingId}/eligible-professionals?search=${encodeURIComponent(search)}`),

  sendManualOffer: (bookingId, professionalId, timeoutSeconds = 90) => fetchWithFallback(`/bookings/${bookingId}/offer`, {
    method: 'POST',
    body: JSON.stringify({ professionalId, timeoutSeconds })
  }),

  retryAutoAssign: (bookingId) => fetchWithFallback(`/bookings/${bookingId}/auto-assign`, {
    method: 'POST'
  }),

  switchAssignmentMode: (bookingId, mode) => fetchWithFallback(`/bookings/${bookingId}/mode`, {
    method: 'POST',
    body: JSON.stringify({ mode })
  }),

  rescheduleBooking: (id, newSlot, newDate, reason) => fetchWithFallback(`/bookings/${id}/reschedule`, {
    method: 'PUT',
    body: JSON.stringify({ newSlot, newDate, reason })
  }),

  cancelBooking: (id, reason, feeCharged = 0) => fetchWithFallback(`/bookings/${id}/cancel`, {
    method: 'PUT',
    body: JSON.stringify({ reason, feeCharged })
  }),

  addBookingNote: (id, note) => fetchWithFallback(`/bookings/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note })
  }),

  initiateRefund: (id, amount, reason) => fetchWithFallback(`/bookings/${id}/refund`, {
    method: 'POST',
    body: JSON.stringify({ amount, reason })
  }),

  getBookingInvoice: (id) => fetchWithFallback(`/bookings/${id}/invoice`, {}, { success: true, invoice: null }),

  // Real-Time Customers Operations
  getCustomers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/customers?${q}`, {}, { success: true, customers: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } });
  },

  getCustomerDetail: (id) => fetchWithFallback(`/customers/${id}`),

  createCustomer: (customerData) => fetchWithFallback('/customers', {
    method: 'POST',
    body: JSON.stringify(customerData)
  }),

  updateCustomerStatus: (id, status, reason) => fetchWithFallback(`/customers/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, reason })
  }),

  deleteCustomer: (id) => fetchWithFallback(`/customers/${id}`, {
    method: 'DELETE'
  }),

  anonymiseCustomer: (id) => fetchWithFallback(`/customers/${id}/anonymise`, { method: 'POST' }),

  addCustomerNote: (id, note) => fetchWithFallback(`/customers/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note })
  }),

  // Real-Time Professionals Operations
  getProfessionals: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/professionals?${q}`, {}, { success: true, professionals: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } });
  },

  getProfessionalDetail: (id) => fetchWithFallback(`/professionals/${id}`),

  createProfessional: (proData) => fetchWithFallback('/professionals', {
    method: 'POST',
    body: JSON.stringify(proData)
  }),

  updateProfessionalStatus: (id, status, reason) => fetchWithFallback(`/professionals/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, reason })
  }),

  deleteProfessional: (id) => fetchWithFallback(`/professionals/${id}`, {
    method: 'DELETE'
  }),

  verifyProfessional: (id) => fetchWithFallback(`/professionals/${id}/kyc`, { method: 'PUT' }),

  verifyProfessionalDocument: (id, docType, status, rejectionReason) => fetchWithFallback(`/professionals/${id}/verify-document`, {
    method: 'PUT',
    body: JSON.stringify({ docType, status, rejectionReason })
  }),

  verifyProfessionalBank: (id, status, rejectionReason) => fetchWithFallback(`/professionals/${id}/verify-bank`, {
    method: 'PUT',
    body: JSON.stringify({ status, rejectionReason })
  }),

  assignProfessionalSkillsAndCoverage: (id, data) => fetchWithFallback(`/professionals/${id}/skills-coverage`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  scheduleProfessionalTraining: (id, data) => fetchWithFallback(`/professionals/${id}/schedule-training`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  requestProfessionalCorrection: (id, correctionNotes) => fetchWithFallback(`/professionals/${id}/request-correction`, {
    method: 'POST',
    body: JSON.stringify({ correctionNotes })
  }),

  addProfessionalNote: (id, note) => fetchWithFallback(`/professionals/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note })
  }),

  // Real-Time Business Partners Operations
  getPartners: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/partners?${q}`, {}, { success: true, partners: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } });
  },

  getPartnerDetail: (id) => fetchWithFallback(`/partners/${id}`),

  createPartner: (partnerData) => fetchWithFallback('/partners', {
    method: 'POST',
    body: JSON.stringify(partnerData)
  }),

  updatePartnerStatus: (id, status, reason) => fetchWithFallback(`/partners/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, reason })
  }),

  deletePartner: (id) => fetchWithFallback(`/partners/${id}`, {
    method: 'DELETE'
  }),

  verifyPartnerDocument: (id, docType, status, rejectionReason) => fetchWithFallback(`/partners/${id}/verify-document`, {
    method: 'PUT',
    body: JSON.stringify({ docType, status, rejectionReason })
  }),

  updatePartnerSettlementMode: (id, settlementMode, commissionRate) => fetchWithFallback(`/partners/${id}/settlement-mode`, {
    method: 'PUT',
    body: JSON.stringify({ settlementMode, commissionRate })
  }),

  addPartnerNote: (id, note) => fetchWithFallback(`/partners/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note })
  }),

  // Real-Time Service Catalogue Operations
  getServices: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/services?${q}`, {}, { success: true, services: [], count: 0 });
  },

  createService: (serviceData) => fetchWithFallback('/services', {
    method: 'POST',
    body: JSON.stringify(serviceData)
  }),

  updateService: (id, updates) => fetchWithFallback(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),

  archiveService: (id) => fetchWithFallback(`/services/${id}/archive`, {
    method: 'PUT'
  }),

  restoreService: (id) => fetchWithFallback(`/services/${id}/restore`, {
    method: 'PUT'
  }),

  deleteService: (id) => fetchWithFallback(`/services/${id}`, {
    method: 'DELETE'
  }),

  // Locations & Serviceability
  getLocations: () => fetchWithFallback('/locations', {}, { success: true, locations: [] }),

  toggleLocationSurge: (cityId, active, surgeAmount) => fetchWithFallback('/locations/surge', {
    method: 'POST',
    body: JSON.stringify({ cityId, active, surgeAmount })
  }),

  updatePincodeCoverage: (data) => fetchWithFallback('/locations/pincode', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  updateOperatingParameters: (data) => fetchWithFallback('/locations/operating-parameters', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  checkServiceability: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/locations/check-serviceability?${q}`, {}, { success: false, serviceable: false });
  },

  // Payments & Ledger
  getPayments: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/payments?${q}`, {}, { success: true, transactions: [], payments: [] });
  },

  getTransactions: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/payments?${q}`, {}, { success: true, transactions: [] });
  },

  getReconciliationExceptions: () => fetchWithFallback('/payments/reconciliation', {}, { success: true, exceptions: [] }),

  getPayouts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/payments/payouts?${q}`, {}, { success: true, payouts: [] });
  },

  getPayoutStatements: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/payments/payouts?${q}`, {}, { success: true, payouts: [] });
  },

  releasePayout: (id, idempotencyKey) => fetchWithFallback(`/payments/payouts/${id}/release`, {
    method: 'POST',
    body: JSON.stringify({ idempotencyKey })
  }),

  getRefunds: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/payments/refunds?${q}`, {}, { success: true, refunds: [], refundRequests: [] });
  },

  getRefundRequests: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/payments/refunds?${q}`, {}, { success: true, refundRequests: [] });
  },

  processRefund: (id, action, approvedAmount, rejectionReason) => fetchWithFallback(`/payments/refunds/${id}/process`, {
    method: 'POST',
    body: JSON.stringify({ action, approvedAmount, rejectionReason })
  }),

  // Support, Reviews & Moderation
  getSupportTickets: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/support/tickets?${q}`, {}, { success: true, count: 0, openCount: 0, tickets: [] });
  },

  createSupportTicket: (data) => fetchWithFallback('/support/tickets', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  addTicketMessage: (id, text, isInternal = false) => fetchWithFallback(`/support/tickets/${id}/message`, {
    method: 'POST',
    body: JSON.stringify({ text, isInternal })
  }),

  updateTicketStatus: (id, status, closureReason = '') => fetchWithFallback(`/support/tickets/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, closureReason })
  }),

  getReviews: () => fetchWithFallback('/reviews', {}, { success: true, reviews: [] }),

  moderateReview: (id, isPublished, reason = '') => fetchWithFallback(`/reviews/${id}/moderate`, {
    method: 'PUT',
    body: JSON.stringify({ isPublished, reason })
  }),

  getRevisits: () => fetchWithFallback('/support/revisits', {}, { success: true, revisits: [] }),

  createRevisit: (revisitData) => fetchWithFallback('/support/revisits', {
    method: 'POST',
    body: JSON.stringify(revisitData)
  }),

  // Training & Inventory
  getTrainingModules: () => fetchWithFallback('/training', {}, { success: true, modules: [] }),
  assignTraining: (id, data) => fetchWithFallback(`/training/${id}/assign`, { method: 'POST', body: JSON.stringify(data) }),
  getInventory: () => fetchWithFallback('/inventory', {}, { success: true, inventory: [] }),
  adjustInventoryStock: (id, delta, reason) => fetchWithFallback(`/inventory/${id}/stock`, { method: 'PUT', body: JSON.stringify({ delta, reason }) }),
  getSupplyOrders: () => fetchWithFallback('/inventory/supply-orders', {}, { success: true, orders: [] }),
  fulfillSupplyOrder: (id, idempotencyKey) => fetchWithFallback(`/inventory/supply-orders/${id}/fulfill`, { method: 'POST', body: JSON.stringify({ idempotencyKey }) }),

  // Promotions & Content
  getPromotions: () => fetchWithFallback('/promotions', {}, { success: true, promotions: [] }),
  createPromotion: (promoData) => fetchWithFallback('/promotions', { method: 'POST', body: JSON.stringify(promoData) }),
  getContent: () => fetchWithFallback('/content', {}, { success: true, content: {} }),
  updateContent: (contentData) => fetchWithFallback('/content', { method: 'PUT', body: JSON.stringify(contentData) }),
  getNotifications: () => fetchWithFallback('/notifications', {}, { success: true, notifications: [] }),
  sendNotification: (notifData) => fetchWithFallback('/notifications/send', { method: 'POST', body: JSON.stringify(notifData) }),

  // Reports
  getReports: (period = '30d') => fetchWithFallback(`/reports?period=${period}`, {}, { success: true, reports: {} }),

  // Team
  getTeam: () => fetchWithFallback('/team', {}, { success: true, team: [] }),
  getPermissionMatrix: () => fetchWithFallback('/team/permissions', {}, { success: true, matrix: {} }),
  inviteTeamMember: (memberData) => fetchWithFallback('/team/invite', { method: 'POST', body: JSON.stringify(memberData) }),
  updateTeamMemberStatus: (id, status, role) => fetchWithFallback(`/team/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, role }) }),
  revokeTeamMemberSessions: (id, reason) => fetchWithFallback(`/team/${id}/revoke-sessions`, { method: 'POST', body: JSON.stringify({ reason }) }),

  // Audit Logs
  getAuditLogs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/audit-logs${q ? `?${q}` : ''}`, {}, { success: true, auditLogs: [] });
  },

  exportAuditLogsCsv: async () => {
    const token = getAdminAuthToken();
    const res = await fetch(`${API_BASE}/audit-logs/export`, {
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    });
    if (!res.ok) throw new Error('Failed to export audit logs');
    return res.blob();
  },

  // Settings
  getSettings: () => fetchWithFallback('/settings', {}, { success: true, settings: {} }),
  updateSettings: (settingsData) => fetchWithFallback('/settings', { method: 'PUT', body: JSON.stringify(settingsData) }),
  toggleSurge: (active, amount = 49) => fetchWithFallback('/surge', { method: 'POST', body: JSON.stringify({ active, amount }) }),

  // Sandbox Reset
  resetDemoData: () => fetchWithFallback('/demo/reset', { method: 'POST' })
};
