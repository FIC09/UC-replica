// Business Partner API Client

const API_BASE = '/api/partner';

class PartnerClient {
  constructor() {
    this.token = sessionStorage.getItem('uc_partner_token') || localStorage.getItem('uc_partner_token') || 'simulated-partner-jwt-token';
    this.partnerId = localStorage.getItem('uc_partner_id') || 'PTR-90142';
  }

  setAuth(token, partnerData, staffData) {
    this.token = token || '';
    if (token) {
      sessionStorage.setItem('uc_partner_token', token);
      localStorage.setItem('uc_partner_token', token);
    }
    if (partnerData && partnerData.id) {
      this.partnerId = partnerData.id;
      localStorage.setItem('uc_partner_id', partnerData.id);
      localStorage.setItem('uc_partner_profile', JSON.stringify(partnerData));
    }
    if (staffData) {
      localStorage.setItem('uc_partner_staff', JSON.stringify(staffData));
    }
  }

  getStoredPartner() {
    try {
      const data = localStorage.getItem('uc_partner_profile');
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return {
      id: 'PTR-90142',
      businessName: 'Apex Home Solutions LLP',
      ownerName: 'Sandeep Patil',
      email: 'contact@apexhome.in',
      phone: '+91 98210 33411',
      tier: 'Platinum Enterprise Fleet',
      category: 'ac-appliances',
      categoryName: 'AC & Appliance Care',
      city: 'Mumbai',
      status: 'Active',
      settlementMode: 'settle_to_business',
      metrics: {
        totalBookings: 0,
        completedBookings: 0,
        rating: 0,
        complaintsCount: 0,
        totalPayouts: 0
      }
    };
  }

  getStoredStaff() {
    try {
      const data = localStorage.getItem('uc_partner_staff');
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return {
      id: 'STF-APX-01',
      name: 'Sandeep Patil',
      email: 'contact@apexhome.in',
      phone: '+91 98210 33411',
      role: 'Business Owner',
      permissions: {
        viewing: true,
        editing: true,
        assigning_jobs: true,
        managing_team: true,
        viewing_finances: true,
        exporting: true,
        managing_staff: true,
        updating_documents: true,
        requesting_bank_changes: true
      }
    };
  }

  logout() {
    this.token = '';
    this.partnerId = '';
    sessionStorage.removeItem('uc_partner_token');
    localStorage.removeItem('uc_partner_token');
    localStorage.removeItem('uc_partner_profile');
    localStorage.removeItem('uc_partner_staff');
    localStorage.removeItem('uc_partner_id');
  }

  async ensureAuthenticated() {
    if (this.token && this.token !== 'simulated-partner-jwt-token') return this.token;
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: 'partner@urbancompany.com', password: 'partner123' })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          this.setAuth(data.token, data.partner, data.staff);
          return data.token;
        }
      }
    } catch (e) {
      console.warn('Partner auto-auth note:', e.message);
    }
    return null;
  }

  async request(endpoint, options = {}) {
    if (!this.token || this.token === 'simulated-partner-jwt-token') {
      if (endpoint !== '/login' && endpoint !== '/register') {
        await this.ensureAuthenticated();
      }
    }

    let headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      'x-partner-id': this.partnerId || 'PTR-90142',
      ...(options.headers || {})
    };

    const url = `${API_BASE}${endpoint}`;

    try {
      let res = await fetch(url, {
        ...options,
        headers
      });

      if (res.status === 401 && !options._retriedAuth && endpoint !== '/login') {
        const refreshedToken = await this.ensureAuthenticated();
        if (refreshedToken) {
          headers = {
            ...headers,
            Authorization: `Bearer ${refreshedToken}`,
            'x-partner-id': this.partnerId || 'PTR-90142'
          };
          res = await fetch(url, {
            ...options,
            _retriedAuth: true,
            headers
          });
        }
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || data.message || `Request failed with HTTP ${res.status}`);
      }

      return data;
    } catch (err) {
      console.warn(`[Partner API] ${endpoint} error:`, err.message);
      throw err;
    }
  }

  // Auth & Account
  async login(credentials) {
    const data = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (data.success && data.token) {
      this.setAuth(data.token, data.partner, data.staff);
    }
    return data;
  }

  async register(formData) {
    const data = await this.request('/register', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    if (data.success && data.token) {
      this.setAuth(data.token, data.partner, data.staff);
    }
    return data;
  }

  async requestPasswordReset(email) {
    return this.request('/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async getMe() {
    return this.request('/me');
  }

  // Onboarding & Application
  async getOnboardingStatus() {
    return this.request('/onboarding/status');
  }

  async saveOnboardingDraft(data) {
    return this.request('/onboarding/draft', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async submitOnboarding(data) {
    return this.request('/onboarding/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async submitOnboardingCorrections(data) {
    return this.request('/onboarding/corrections', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Dashboard
  async getDashboardSummary(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/dashboard-summary${q ? '?' + q : ''}`);
  }

  // Bookings
  async getBookings(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/bookings?${query}`);
  }

  async getBookingDetail(id) {
    return this.request(`/bookings/${id}`);
  }

  async assignBooking(bookingId, professionalId, reason = '') {
    return this.request(`/bookings/${bookingId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ professionalId, reason })
    });
  }

  async addBookingNote(bookingId, note) {
    return this.request(`/bookings/${bookingId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note })
    });
  }

  async requestReschedule(bookingId, data) {
    return this.request(`/bookings/${bookingId}/reschedule-request`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async requestCancellation(bookingId, data) {
    return this.request(`/bookings/${bookingId}/cancel-request`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async overrideCompletion(bookingId, data) {
    return this.request(`/bookings/${bookingId}/completion-override`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Calendar
  async getCalendar() {
    return this.request('/calendar');
  }

  // Team
  async getTeam() {
    return this.request('/team');
  }

  async addTeamMember(data) {
    return this.request('/team', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async proposeTeamMember(data) {
    return this.request('/team/propose', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async linkExistingPro(data) {
    return this.request('/team/link-existing', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateTeamMember(proId, data) {
    return this.request(`/team/${proId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async requestSkillChange(proId, data) {
    return this.request(`/team/${proId}/request-skill-change`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateProAvailability(proId, data) {
    return this.request(`/team/${proId}/availability`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async removeTeamMember(proId, data) {
    return this.request(`/team/${proId}/remove-association`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Services & Coverage
  async getServices() {
    return this.request('/services');
  }

  async requestServiceCategory(data) {
    return this.request('/services/request-category', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async toggleServiceParticipation(data) {
    return this.request('/services/participation', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getCoverage() {
    return this.request('/coverage');
  }

  async requestCoverageChange(data) {
    return this.request('/coverage/request-change', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateCapacityConfig(data) {
    return this.request('/coverage/capacity', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async validateServiceability(data) {
    return this.request('/coverage/validate-serviceability', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Finances & Settlements
  async getEarnings() {
    return this.request('/earnings');
  }

  async getEarningsLedger() {
    return this.request('/earnings/ledger');
  }

  async getSettlements() {
    return this.request('/settlements');
  }

  async downloadSettlementStatement(id) {
    return this.request(`/settlements/${id}/statement`);
  }

  async requestSettlementCorrection(id, data) {
    return this.request(`/settlements/${id}/request-correction`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async requestBankChange(data) {
    return this.request('/settlements/bank-change-request', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Invoices & Reports
  async getInvoices() {
    return this.request('/invoices');
  }

  async downloadInvoice(id) {
    return this.request(`/invoices/${id}/download`);
  }

  async getReports() {
    return this.request('/reports');
  }

  async getPerformanceMetrics() {
    return this.request('/reports/performance');
  }

  // Refunds & Disputes
  async getRefundsDisputes() {
    return this.request('/refunds-disputes');
  }

  async getDisputeDetail(id) {
    return this.request(`/refunds-disputes/${id}`);
  }

  async submitDispute(data) {
    return this.request('/refunds-disputes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async addDisputeMessage(id, data) {
    return this.request(`/refunds-disputes/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Reviews
  async getReviews() {
    return this.request('/reviews');
  }

  async replyToReview(id, reply) {
    return this.request(`/reviews/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply })
    });
  }

  async flagReview(id, data) {
    return this.request(`/reviews/${id}/flag`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Training & Compliance
  async getTraining() {
    return this.request('/training');
  }

  async requestTrainingSession(data) {
    return this.request('/training/request-session', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Inventory & Supply Orders
  async getInventory() {
    return this.request('/inventory');
  }

  async getSupplyOrders() {
    return this.request('/inventory/orders');
  }

  async createSupplyOrder(data) {
    return this.request('/inventory/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async receiveSupplyOrderGoods(id) {
    return this.request(`/inventory/orders/${id}/goods-received`, {
      method: 'POST'
    });
  }

  async allocateInventory(data) {
    return this.request('/inventory/allocate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async adjustInventory(data) {
    return this.request('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async returnInventory(data) {
    return this.request('/inventory/returns', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getInventoryMovements() {
    return this.request('/inventory/movements');
  }

  async orderInventory(itemId, quantity) {
    return this.request('/inventory/order', {
      method: 'POST',
      body: JSON.stringify({ itemId, quantity })
    });
  }

  // Support & Helpdesk
  async getSupportTickets() {
    return this.request('/support');
  }

  async getSupportTicketDetail(id) {
    return this.request(`/support/tickets/${id}`);
  }

  async createSupportTicket(data) {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async addSupportTicketMessage(id, message) {
    return this.request(`/support/tickets/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  // Notifications
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'PUT'
    });
  }

  // Documents
  async getDocuments() {
    return this.request('/documents');
  }

  async uploadDocument(data) {
    return this.request('/documents/upload', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Staff
  async getStaff() {
    return this.request('/staff');
  }

  async inviteStaff(data) {
    return this.request('/staff', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateStaffStatus(id, status) {
    return this.request(`/staff/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async deleteStaff(id) {
    return this.request(`/staff/${id}`, {
      method: 'DELETE'
    });
  }

  // Activity & Settings
  async getActivityLogs() {
    return this.request('/activity');
  }

  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(data) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Demo Sandbox Reset
  async resetDemoData(data = { confirmReset: true }) {
    return this.request('/demo/reset', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const partnerClient = new PartnerClient();
