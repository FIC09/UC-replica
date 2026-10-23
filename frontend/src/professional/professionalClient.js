// Professional API Client for Home-Services Platform

const API_BASE = '/api/professional';

class ProfessionalClient {
  constructor() {
    this.token = sessionStorage.getItem('uc_pro_token') || localStorage.getItem('uc_pro_token') || '';
    this.proId = localStorage.getItem('uc_pro_id') || 'PRO-8841';
  }

  setAuth(token, proUser) {
    this.token = token || '';
    if (token) {
      sessionStorage.setItem('uc_pro_token', token);
      localStorage.setItem('uc_pro_token', token);
    }
    if (proUser && proUser.id) {
      this.proId = proUser.id;
      localStorage.setItem('uc_pro_id', proUser.id);
      localStorage.setItem('uc_pro_user', JSON.stringify(proUser));
    }
  }

  getStoredUser() {
    try {
      const data = localStorage.getItem('uc_pro_user');
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return {
      id: 'PRO-8841',
      applicantName: 'Vikram Salvi',
      phone: '+91 98205 11982',
      email: 'vikram.salvi@urbanpro.com',
      avatar: 'VS',
      trade: 'Master AC Specialist & Electrician',
      tier: 'Diamond Pro Partner (Level 5)',
      employmentType: 'Direct Freelance',
      walletBalance: 15450,
      isOnline: true
    };
  }

  logout() {
    this.token = '';
    this.proId = '';
    sessionStorage.removeItem('uc_pro_token');
    localStorage.removeItem('uc_pro_token');
    localStorage.removeItem('uc_pro_user');
    localStorage.removeItem('uc_pro_id');
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      'x-professional-id': this.proId || 'PRO-8841',
      ...(options.headers || {})
    };

    const url = `${API_BASE}${endpoint}`;

    try {
      const res = await fetch(url, {
        ...options,
        headers
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || data.message || `Request failed with HTTP ${res.status}`);
      }

      return data;
    } catch (err) {
      console.warn(`[Professional API] ${endpoint} error:`, err.message);
      throw err;
    }
  }

  // Auth & Session
  async login(credentials) {
    const data = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (data.success && data.token) {
      this.setAuth(data.token, data.professional);
    }
    return data;
  }

  async sendOtp(phone) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  }

  async verifyOtp(phone, otp) {
    const data = await this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp })
    });
    if (data.success && data.token) {
      this.setAuth(data.token, data.professional);
    }
    return data;
  }

  // Application & Onboarding
  async registerApplication(payload) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getOnboardingStatus() {
    return this.request('/onboarding-status');
  }

  async resubmitCorrections(payload) {
    return this.request('/onboarding/resubmit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Profile
  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(updates) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // Availability & Shift
  async getAvailability() {
    return this.request('/availability');
  }

  async updateAvailability(payload) {
    return this.request('/availability', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  // Today Dashboard & Dispatches
  async getTodayDashboard() {
    return this.request('/today');
  }

  // Job Offers (Offer-and-Accept allocation mode)
  async getJobOffers() {
    return this.request('/offers');
  }

  async acceptJobOffer(offerId) {
    return this.request(`/offers/${offerId}/accept`, {
      method: 'POST'
    });
  }

  async declineJobOffer(offerId, reason = 'schedule_conflict') {
    return this.request(`/offers/${offerId}/decline`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // Jobs
  async getJobs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/jobs${query ? `?${query}` : ''}`);
  }

  async getJobDetail(jobId) {
    return this.request(`/jobs/${jobId}`);
  }

  async updateJobStatus(jobId, status, otp) {
    return this.request(`/jobs/${jobId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, otp })
    });
  }

  async verifyJobOtp(jobId, otp) {
    return this.request(`/jobs/${jobId}/verify-otp`, {
      method: 'POST',
      body: JSON.stringify({ otp })
    });
  }

  async requestReassignment(jobId, reason) {
    return this.request(`/jobs/${jobId}/reassign`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async updateJobChecklist(jobId, itemId, completed) {
    return this.request(`/jobs/${jobId}/checklist`, {
      method: 'PUT',
      body: JSON.stringify({ itemId, completed })
    });
  }

  async getJobChecklists(jobId) {
    return this.request(`/jobs/${jobId}/checklists`);
  }

  async updateJobChecklistSection(jobId, payload) {
    return this.request(`/jobs/${jobId}/checklists`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async uploadJobPhotoEvidence(jobId, payload) {
    return this.request(`/jobs/${jobId}/photos`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getExtraWorkCatalogue(jobId) {
    return this.request(`/jobs/${jobId}/extra-work/catalog`);
  }

  async getExtraWorkRequests(jobId) {
    return this.request(`/jobs/${jobId}/extra-work`);
  }

  async proposeExtraWork(jobId, payload) {
    return this.request(`/jobs/${jobId}/extra-work`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async handleCustomerExtraWorkApproval(jobId, workId, payload) {
    return this.request(`/jobs/${jobId}/extra-work/${workId}/approval`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getJobMessages(jobId) {
    return this.request(`/jobs/${jobId}/messages`);
  }

  async sendJobMessage(jobId, payload) {
    return this.request(`/jobs/${jobId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getCancellationPolicy() {
    return this.request('/cancellation-policy');
  }

  async reportJobIncident(jobId, payload) {
    return this.request(`/jobs/${jobId}/incident-report`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async addProfessionalNote(jobId, note) {
    return this.request(`/jobs/${jobId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note })
    });
  }

  // Earnings & Payouts
  async getEarnings() {
    return this.request('/earnings');
  }

  async getPayouts() {
    return this.request('/payouts');
  }

  async requestWithdrawal(payload) {
    return this.request('/payouts/withdraw', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async submitBankChangeRequest(payload) {
    return this.request('/payouts/bank-change-request', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getBankChangeHistory() {
    return this.request('/payouts/bank-change-history');
  }

  async getFinancialDisputes() {
    return this.request('/payouts/disputes');
  }

  async submitFinancialDispute(payload) {
    return this.request('/payouts/disputes', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Reviews & Performance
  async getReviews() {
    return this.request('/reviews');
  }

  async flagReview(reviewId, payload) {
    return this.request(`/reviews/${reviewId}/flag`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getPerformance() {
    return this.request('/performance');
  }

  async submitPerformanceAppeal(payload) {
    return this.request('/performance/appeal', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Training & Academy
  async getTrainings() {
    return this.request('/trainings');
  }

  async getTrainingAssessment(courseId) {
    return this.request(`/trainings/${courseId}/assessment`);
  }

  async submitTrainingAssessment(courseId, answers) {
    return this.request(`/trainings/${courseId}/assessment`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  }

  async completeTraining(courseId) {
    return this.request(`/trainings/${courseId}/complete`, {
      method: 'POST'
    });
  }

  async bookTrainingSession(payload) {
    return this.request('/trainings/book-session', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Inventory & Consumables
  async getInventory() {
    return this.request('/inventory');
  }

  async requestRestock(payload) {
    return this.request('/inventory/restock', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async reportDamagedItem(payload) {
    return this.request('/inventory/return-report', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Shop
  async getShopItems() {
    return this.request('/shop');
  }

  async placeShopOrder(payload) {
    return this.request('/shop/order', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Support & Safety
  async getSupportTickets(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/support${query ? `?${query}` : ''}`);
  }

  async createSupportTicket(payload) {
    return this.request('/support', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async addTicketMessage(ticketId, payload) {
    return this.request(`/support/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async escalateSafetyIncident(payload) {
    return this.request('/support/safety-escalation', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Notifications
  async getNotifications(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/notifications${query ? `?${query}` : ''}`);
  }

  async markNotificationsRead(id = null) {
    return this.request('/notifications/read-all', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
  }

  // Profile Change History
  async getProfileChangeHistory() {
    return this.request('/profile/change-history');
  }

  // Documents
  async getDocuments() {
    return this.request('/documents');
  }

  async uploadDocument(payload) {
    return this.request('/documents/upload', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Settings, Sessions & Account Closure
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(payload) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async revokeOtherSessions() {
    return this.request('/settings/sessions/revoke-others', {
      method: 'POST'
    });
  }

  async updateSecurityPin(payload) {
    return this.request('/settings/security-pin', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async requestAccountClosure(payload) {
    return this.request('/settings/account-closure-request', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Immutable Audit History Trail
  async getAuditHistory(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/audit-history${query ? `?${query}` : ''}`);
  }

  // Confirmed Demo Data Reset (Affects only demo data)
  async resetDemoData() {
    return this.request('/demo/reset', {
      method: 'POST',
      body: JSON.stringify({ confirmReset: true })
    });
  }

  // Mobile Reliability & Offline Draft Preservation Helpers
  saveDraft(key, data) {
    try {
      localStorage.setItem(`uc_pro_draft_${key}`, JSON.stringify({ data, savedAt: Date.now() }));
    } catch {}
  }

  loadDraft(key) {
    try {
      const raw = localStorage.getItem(`uc_pro_draft_${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  clearDraft(key) {
    try {
      localStorage.removeItem(`uc_pro_draft_${key}`);
    } catch {}
  }
}

export const professionalClient = new ProfessionalClient();
