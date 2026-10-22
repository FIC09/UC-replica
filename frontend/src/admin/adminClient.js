// API client for Urban Services Admin Dashboard with JWT bearer auth and local demo fallback
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/admin';

function getAdminAuthToken() {
  try {
    return sessionStorage.getItem('uc_admin_token') || localStorage.getItem('uc_admin_token') || '';
  } catch {
    return '';
  }
}

async function fetchWithFallback(endpoint, options = {}, fallbackData = null) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const token = getAdminAuthToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const errorMsg = errBody.error || errBody.message || `HTTP ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = errBody;
      throw error;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    // If backend returns a deliberate business logic error (like 400, 401, 403, 503 for unconfigured reset), re-throw so UI shows the actual error message
    if (err.status && err.status >= 400 && err.status < 500) {
      throw err;
    }
    if (err.status === 503) {
      throw err;
    }

    // Return mock / demo fallback if backend is offline or network fails
    if (fallbackData !== null) {
      return fallbackData;
    }
    throw err;
  }
}

export const adminClient = {
  // Authentication & RBAC
  login: async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid administrator credentials');
      }
      if (data.token) {
        sessionStorage.setItem('uc_admin_token', data.token);
        localStorage.setItem('uc_admin_token', data.token);
      }
      if (data.admin) {
        sessionStorage.setItem('uc_admin_user', JSON.stringify(data.admin));
        localStorage.setItem('uc_admin_user', JSON.stringify(data.admin));
      }
      sessionStorage.setItem('uc_admin_auth', 'true');
      return data;
    } catch (err) {
      // In offline demo fallback:
      if (email.includes('admin') || password === 'admin123' || password === 'admin@123') {
        const demoRole = email.includes('ops') ? 'Operations Manager'
          : email.includes('fin') ? 'Finance Manager'
          : email.includes('supp') ? 'Support Agent'
          : email.includes('cat') ? 'Catalogue Manager'
          : email.includes('ana') ? 'Read-only Analyst'
          : 'Super Admin';

        const demoAdmin = {
          id: 'ADM-01',
          name: demoRole,
          email: email,
          role: demoRole,
          department: 'Operations & Platform Control',
          assignedZone: 'All India',
          permissions: {}
        };
        const demoToken = 'mock_jwt_token_' + Date.now();
        sessionStorage.setItem('uc_admin_token', demoToken);
        localStorage.setItem('uc_admin_token', demoToken);
        sessionStorage.setItem('uc_admin_user', JSON.stringify(demoAdmin));
        localStorage.setItem('uc_admin_user', JSON.stringify(demoAdmin));
        sessionStorage.setItem('uc_admin_auth', 'true');
        return { success: true, token: demoToken, admin: demoAdmin };
      }
      throw err;
    }
  },

  logout: async () => {
    try {
      await fetchWithFallback('/auth/logout', { method: 'POST' });
    } catch {}
    sessionStorage.removeItem('uc_admin_token');
    localStorage.removeItem('uc_admin_token');
    sessionStorage.removeItem('uc_admin_user');
    localStorage.removeItem('uc_admin_user');
    sessionStorage.removeItem('uc_admin_auth');
    return { success: true };
  },

  me: () => fetchWithFallback('/auth/me', {}, { success: true, admin: null }),

  requestPasswordReset: async (email) => {
    return fetchWithFallback('/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // Overview with full metrics & filters
  getOverview: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.dateRange) params.append('dateRange', filters.dateRange);
    if (filters.city) params.append('city', filters.city);
    if (filters.category) params.append('category', filters.category);
    if (filters.partner) params.append('partner', filters.partner);

    const query = params.toString() ? `?${params.toString()}` : '';

    return fetchWithFallback(`/overview${query}`, {}, {
      success: true,
      data: {
        filters: { dateRange: '30d', city: 'ALL', category: 'ALL', partner: 'ALL' },
        metrics: {
          totalBookings: { value: 5040, change: 16.4, isPositive: true, clickTarget: '/admin/bookings' },
          todayBookings: { value: 143, label: 'Dispatches Today', clickTarget: '/admin/bookings?slot=today' },
          upcomingAndOngoing: { value: 42, label: 'In-Transit / Scheduled', clickTarget: '/admin/bookings?status=In Progress' },
          completedBookings: { value: 3840, label: 'Successfully Delivered', clickTarget: '/admin/bookings?status=Completed' },
          cancelledBookings: { value: 160, label: 'Customer / Pro Cancelled', clickTarget: '/admin/bookings?status=Cancelled' },
          unassignedBookings: { value: 8, alert: true, clickTarget: '/admin/bookings?status=Pending' },
          grossBookingValue: { value: 4825000, formatted: '₹48,25,000', change: 18.2, isPositive: true, clickTarget: '/admin/payments' },
          collectedPayments: { value: 4535500, formatted: '₹45,35,500', change: 17.8, isPositive: true, clickTarget: '/admin/payments?status=Success' },
          platformRevenue: { value: 965000, formatted: '₹9,65,000', takeRate: '20.0%', change: 19.4, isPositive: true, clickTarget: '/admin/reports' },
          proEarnings: { value: 3860000, formatted: '₹38,60,000', label: 'Pro & Partner Payout Pool' },
          refunds: { value: 24600, formatted: '₹24,600', change: -4.2, clickTarget: '/admin/refunds' },
          outstandingPayouts: { value: 440200, formatted: '₹4,40,200', clickTarget: '/admin/payouts' },
          activeCustomers: { value: 24500, formatted: '24,500', clickTarget: '/admin/customers' },
          approvedProfessionals: { value: 1845, formatted: '1,845', clickTarget: '/admin/professionals?status=Active' },
          availableProfessionals: { value: 1420, formatted: '1,420', clickTarget: '/admin/professionals' },
          pendingApplications: { value: 6, alert: true, clickTarget: '/admin/professionals?status=Under Review' },
          openSupportTickets: { value: 7, alert: true, clickTarget: '/admin/support' },
          averageCustomerRating: { value: 4.88, formatted: '⭐ 4.88', clickTarget: '/admin/reviews' }
        },
        trends: {
          bookingTrends: [
            { label: 'Mon', orders: 380, gmv: 475000, revenue: 95000, proPayout: 380000 },
            { label: 'Tue', orders: 404, gmv: 505000, revenue: 101000, proPayout: 404000 },
            { label: 'Wed', orders: 428, gmv: 535000, revenue: 107000, proPayout: 428000 },
            { label: 'Thu', orders: 452, gmv: 565000, revenue: 113000, proPayout: 452000 },
            { label: 'Fri', orders: 476, gmv: 595000, revenue: 119000, proPayout: 476000 },
            { label: 'Sat', orders: 620, gmv: 775000, revenue: 155000, proPayout: 620000 },
            { label: 'Sun', orders: 644, gmv: 805000, revenue: 161000, proPayout: 644000 }
          ],
          statusDistribution: [
            { status: 'Completed', count: 3840, percentage: 76.8, color: '#16A34A' },
            { status: 'Confirmed (Scheduled)', count: 680, percentage: 13.6, color: '#6E42E5' },
            { status: 'In Progress (Active)', count: 320, percentage: 6.4, color: '#0284C7' },
            { status: 'Cancelled', count: 160, percentage: 3.2, color: '#DC2626' }
          ],
          topCategories: [
            { name: 'Salon for Women', share: 36, revenue: '₹17,37,000', orders: 1380, color: '#6E42E5', growth: '+18.4%' },
            { name: 'AC Repair & Appliance Care', share: 28, revenue: '₹13,51,000', orders: 940, color: '#0284C7', growth: '+24.1%' },
            { name: 'Deep Home Cleaning & Pest Control', share: 18, revenue: '₹8,68,500', orders: 620, color: '#16A34A', growth: '+12.5%' },
            { name: 'Men\'s Grooming & Spa', share: 11, revenue: '₹5,30,750', orders: 580, color: '#F59E0B', growth: '+9.8%' },
            { name: 'Plumber, Electrician & Handyman', share: 7, revenue: '₹3,37,750', orders: 320, color: '#EC4899', growth: '+6.2%' }
          ],
          cityPerformance: [
            { city: 'Mumbai', bookings: 1840, gmv: '₹22,95,000', slaRate: '98.4%', rating: 4.91, activePros: 820 },
            { city: 'Bengaluru', bookings: 1420, gmv: '₹18,46,000', slaRate: '97.6%', rating: 4.88, activePros: 450 },
            { city: 'Delhi NCR', bookings: 980, gmv: '₹12,24,000', slaRate: '96.2%', rating: 4.82, activePros: 520 },
            { city: 'Krishnagiri', bookings: 420, gmv: '₹4,82,000', slaRate: '99.1%', rating: 4.94, activePros: 48 }
          ]
        },
        operationalAlerts: [
          { id: 'ALT-1', severity: 'warning', title: '8 Unassigned Orders in High-Demand Slots', message: 'Koramangala & Bandra hubs have 8 unassigned bookings starting within 45 minutes.', link: '/admin/bookings?status=Pending', actionText: 'Auto-Dispatch Pros' },
          { id: 'ALT-2', severity: 'critical', title: 'Low Inventory Alert: Eco-Degreaser Chemical Solution', message: 'Current stock is 38 units (Min Threshold: 50 units) at Krishnagiri Warehouse.', link: '/admin/inventory', actionText: 'Order Restock' },
          { id: 'ALT-3', severity: 'info', title: 'Monsoon Rain Surge Active in Mumbai Metro', message: 'Weather surge of +₹49 currently compensating 820 active technicians.', link: '/admin/locations', actionText: 'Review Hub Surges' }
        ],
        pendingQueues: {
          pendingWorkerApplications: 4,
          pendingPartnerAgencies: 2,
          pendingRefundDisputes: 3,
          pendingPayoutBatches: 2
        },
        recentBookings: [
          { id: 'ORD-9841', customerName: 'Aarav Mehta', serviceName: 'Powerjet AC Servicing (Split)', locality: 'Bandra West', city: 'Mumbai', slot: 'Today (02:00 PM)', totalAmount: 699, status: 'In Progress', assignedPartner: 'Vikram Salvi' },
          { id: 'ORD-9842', customerName: 'Sneha Roy', serviceName: 'Classic Bathroom Deep Cleaning', locality: 'Pali Hill', city: 'Mumbai', slot: 'Today (03:30 PM)', totalAmount: 499, status: 'Confirmed', assignedPartner: 'Sunil V.' },
          { id: 'ORD-9843', customerName: 'Vikram Merchant', serviceName: 'Switch & Socket Installation', locality: 'Khar West', city: 'Mumbai', slot: 'Today (11:00 AM)', totalAmount: 299, status: 'Completed', assignedPartner: 'Rajesh Kumar' },
          { id: 'ORD-9844', customerName: 'Pooja Iyer', serviceName: 'Full Home Deep Cleaning', locality: 'Rayakottai Road', city: 'Krishnagiri', slot: 'Tomorrow (10:00 AM)', totalAmount: 2499, status: 'Confirmed', assignedPartner: 'Selvam Fleet' }
        ]
      }
    });
  },

  // Bookings (Search, Filter, Sort, Paginate, Detail, Lifecycle, Actions)
  getBookings: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/bookings?${q}`, {}, { success: true, bookings: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } });
  },
  getBookingDetail: (id) => fetchWithFallback(`/bookings/${id}`, {}, { success: true, booking: null }),
  createBooking: (bookingData) => fetchWithFallback('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  }),
  updateLifecycleStatus: (id, newStatus, notes) => fetchWithFallback(`/bookings/${id}/lifecycle`, {
    method: 'PUT',
    body: JSON.stringify({ newStatus, notes })
  }),
  updateBookingStatus: (id, status, assignedPartner) => fetchWithFallback(`/bookings/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, assignedPartner })
  }),
  assignProfessional: (id, proData) => fetchWithFallback(`/bookings/${id}/assign`, {
    method: 'PUT',
    body: JSON.stringify(proData)
  }),
  rescheduleBooking: (id, newSlot, newDate, reason) => fetchWithFallback(`/bookings/${id}/reschedule`, {
    method: 'PUT',
    body: JSON.stringify({ newSlot, newDate, reason })
  }),
  cancelBooking: (id, reason, feeCharged) => fetchWithFallback(`/bookings/${id}/cancel`, {
    method: 'PUT',
    body: JSON.stringify({ reason, feeCharged })
  }),
  addBookingNote: (id, note) => fetchWithFallback(`/bookings/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note })
  }),
  refundBooking: (id, amount, reason) => fetchWithFallback(`/bookings/${id}/refund`, {
    method: 'POST',
    body: JSON.stringify({ amount, reason })
  }),
  getBookingInvoice: (id) => fetchWithFallback(`/bookings/${id}/invoice`, {}, { success: true, invoice: null }),

  // Customers (Search, Profile, Spending, Suspend, Anonymise)
  getCustomers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/customers?${q}`, {}, { success: true, customers: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } });
  },
  getCustomerDetail: (id) => fetchWithFallback(`/customers/${id}`, {}, { success: true, customer: null }),
  updateCustomerStatus: (id, status, reason) => fetchWithFallback(`/customers/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, reason })
  }),
  anonymiseCustomer: (id) => fetchWithFallback(`/customers/${id}/anonymise`, { method: 'POST' }),
  addCustomerNote: (id, note) => fetchWithFallback(`/customers/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note })
  }),

  // Professionals (Documents, Bank Review, Training, Skills, Notes)
  getProfessionals: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/professionals?${q}`, {}, { success: true, professionals: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } });
  },
  getProfessionalDetail: (id) => fetchWithFallback(`/professionals/${id}`, {}, { success: true, professional: null }),
  updateProfessionalStatus: (id, status, reason) => fetchWithFallback(`/professionals/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, reason })
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

  // Partners (Franchise Business Agencies)
  getPartners: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/partners?${q}`, {}, { success: true, partners: [] });
  },
  getPartnerDetail: (id) => fetchWithFallback(`/partners/${id}`, {}, { success: true, partner: null }),
  createPartner: (partnerData) => fetchWithFallback('/partners', {
    method: 'POST',
    body: JSON.stringify(partnerData)
  }),
  updatePartnerStatus: (id, status, reason) => fetchWithFallback(`/partners/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, reason })
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

  // Service Catalogue (Categories, Add-ons, FAQs, Commission & Archival)
  getServices: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/services?${q}`, {}, { success: true, services: [] });
  },
  createService: (serviceData) => fetchWithFallback('/services', {
    method: 'POST',
    body: JSON.stringify(serviceData)
  }),
  updateService: (id, serviceData) => fetchWithFallback(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(serviceData)
  }),
  archiveService: (id) => fetchWithFallback(`/services/${id}/archive`, { method: 'PUT' }),
  restoreService: (id) => fetchWithFallback(`/services/${id}/restore`, { method: 'PUT' }),

  // Locations & Serviceability Perimeter
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

  // Payments & Transactions (Integer minor units, currency, commission, GST)
  getPayments: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/payments/transactions?${q}`, {}, { success: true, transactions: [], payments: [] });
  },
  getTransactions: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/payments/transactions?${q}`, {}, { success: true, transactions: [] });
  },
  getReconciliationExceptions: () => fetchWithFallback('/payments/reconciliation', {}, { success: true, exceptions: [] }),

  // Payouts & Settlement Statements
  getPayouts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/payouts?${q}`, {}, { success: true, payouts: [] });
  },
  releasePayout: (id, idempotencyKey) => fetchWithFallback(`/payouts/${id}/release`, {
    method: 'POST',
    body: JSON.stringify({ idempotencyKey })
  }),

  // Refunds & Disputes
  getRefunds: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/refunds?${q}`, {}, { success: true, refunds: [] });
  },
  processRefund: (id, action, approvedAmount, rejectionReason) => fetchWithFallback(`/refunds/${id}/process`, {
    method: 'PUT',
    body: JSON.stringify({ action, approvedAmount, rejectionReason })
  }),
  approveRefund: (id, approvedAmount) => fetchWithFallback(`/refunds/${id}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ action: 'approve', approvedAmount })
  }),
  rejectRefund: (id, rejectionReason) => fetchWithFallback(`/refunds/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ action: 'reject', rejectionReason })
  }),

  // Support
  // Support
  getSupportTickets: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchWithFallback(`/support?${q}`, {}, { success: true, tickets: [] });
  },
  addTicketMessage: (id, text, isInternal = false, attachments = []) => fetchWithFallback(`/support/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text, isInternal, attachments })
  }),
  updateTicketStatus: (id, status, closureReason, escalationReason, assignedOwner) => fetchWithFallback(`/support/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, closureReason, escalationReason, assignedOwner })
  }),

  // Reviews & Moderation
  getReviews: () => fetchWithFallback('/reviews', {}, { success: true, reviews: [] }),
  toggleReviewVisibility: (id) => fetchWithFallback(`/reviews/${id}/visibility`, { method: 'PUT' }),
  moderateReview: (id, isPublished, moderationReason) => fetchWithFallback(`/reviews/${id}/moderate`, {
    method: 'PUT',
    body: JSON.stringify({ isPublished, moderationReason })
  }),

  // Revisits & Warranty Disputes
  getRevisits: () => fetchWithFallback('/revisits', {}, { success: true, revisits: [] }),
  createRevisit: (revisitData) => fetchWithFallback('/revisits', {
    method: 'POST',
    body: JSON.stringify(revisitData)
  }),

  // Training
  getTrainingModules: () => fetchWithFallback('/training', {}, { success: true, modules: [] }),
  assignTraining: (id, data) => fetchWithFallback(`/training/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Inventory & Supply Orders
  getInventory: () => fetchWithFallback('/inventory', {}, { success: true, inventory: [] }),
  adjustInventoryStock: (id, delta, reason) => fetchWithFallback(`/inventory/${id}/stock`, {
    method: 'PUT',
    body: JSON.stringify({ delta, reason })
  }),
  updateInventoryStock: (id, currentStock) => fetchWithFallback(`/inventory/${id}/stock`, {
    method: 'PUT',
    body: JSON.stringify({ delta: 0, currentStock })
  }),
  getSupplyOrders: () => fetchWithFallback('/inventory/supply-orders', {}, { success: true, orders: [] }),
  fulfillSupplyOrder: (id, idempotencyKey) => fetchWithFallback(`/inventory/supply-orders/${id}/fulfill`, {
    method: 'POST',
    body: JSON.stringify({ idempotencyKey })
  }),

  // Promotions
  getPromotions: () => fetchWithFallback('/promotions', {}, { success: true, promotions: [] }),
  createPromotion: (promoData) => fetchWithFallback('/promotions', {
    method: 'POST',
    body: JSON.stringify(promoData)
  }),
  validatePromotion: (data) => fetchWithFallback('/promotions/validate', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Content
  getContent: () => fetchWithFallback('/content', {}, { success: true, content: {} }),
  updateContent: (contentData) => fetchWithFallback('/content', {
    method: 'PUT',
    body: JSON.stringify(contentData)
  }),

  // Notifications
  getNotifications: () => fetchWithFallback('/notifications', {}, { success: true, notifications: [] }),
  sendNotification: (notifData) => fetchWithFallback('/notifications/send', {
    method: 'POST',
    body: JSON.stringify(notifData)
  }),

  // Reports
  getReports: (period = '30d') => fetchWithFallback(`/reports?period=${period}`, {}, { success: true, reports: {} }),

  // Team
  getTeam: () => fetchWithFallback('/team', {}, { success: true, team: [] }),
  getPermissionMatrix: () => fetchWithFallback('/team/permissions', {}, {
    success: true,
    roles: ['Super Admin', 'Operations Manager', 'Support Agent', 'Finance Manager', 'Catalogue Manager', 'Read-only Analyst'],
    matrix: {}
  }),
  inviteTeamMember: (memberData) => fetchWithFallback('/team/invite', {
    method: 'POST',
    body: JSON.stringify(memberData)
  }),
  updateTeamMemberStatus: (id, status, role) => fetchWithFallback(`/team/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, role })
  }),
  revokeTeamMemberSessions: (id, reason) => fetchWithFallback(`/team/${id}/revoke-sessions`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  }),

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
  updateSettings: (settingsData) => fetchWithFallback('/settings', {
    method: 'PUT',
    body: JSON.stringify(settingsData)
  }),
  toggleSurge: (active) => fetchWithFallback('/surge', {
    method: 'POST',
    body: JSON.stringify({ active })
  }),

  // Demo Sandbox Reset
  resetDemoData: () => fetchWithFallback('/demo/reset', {
    method: 'POST',
    body: JSON.stringify({ reason: 'Manual user demo reset' })
  })
};
