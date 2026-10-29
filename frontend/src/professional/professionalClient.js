export function getInitials(name, avatar) {
  if (name && typeof name === 'string' && name.trim()) {
    const clean = name.trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  }
  if (avatar && typeof avatar === 'string' && avatar.length <= 3 && !avatar.includes('/') && !avatar.includes('.')) {
    return avatar.toUpperCase();
  }
  return 'PR';
}

export function getPartnerTier(profile) {
  const jobs = profile?.jobsCompleted != null ? Number(profile.jobsCompleted) : 0;
  if (profile?.tier && profile.tier !== 'Diamond Pro Partner' && profile.tier !== 'Diamond Pro Partner (Level 5)') {
    return profile.tier;
  }
  if (jobs >= 500) return 'Diamond Pro Partner (Level 5)';
  if (jobs >= 200) return 'Platinum Partner (Level 4)';
  if (jobs >= 50) return 'Gold Partner (Level 3)';
  if (jobs >= 10) return 'Silver Partner (Level 2)';
  return 'New Partner (Level 1)';
}

const API_BASE = '/api/professional';

class ProfessionalClient {
  constructor() {
    this.token = sessionStorage.getItem('uc_pro_token') || localStorage.getItem('uc_pro_token') || '';
    this.proId = localStorage.getItem('uc_pro_id') || 'WRK-79932';
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
      if (data) {
        const parsed = JSON.parse(data);
        const name = parsed.applicantName || parsed.name || '';
        // Automatically cleanse any hardcoded mock defaults (e.g. 15450, mock VS avatar, Diamond Pro for 0 jobs)
        if (name) {
          parsed.avatar = getInitials(name);
        }
        const jobs = parsed.jobsCompleted != null ? Number(parsed.jobsCompleted) : 0;
        if (jobs === 0 || !parsed.jobsCompleted) {
          if (parsed.walletBalance === 15450) parsed.walletBalance = 0;
          if (parsed.lifetimeEarnings === 428000) parsed.lifetimeEarnings = 0;
          if (parsed.tier === 'Diamond Pro Partner (Level 5)' || parsed.tier === 'Diamond Pro Partner') {
            parsed.tier = 'New Partner (Level 1)';
          }
        }
        return parsed;
      }
    } catch {
      // ignore
    }

    try {
      const u = JSON.parse(localStorage.getItem('uc_user'));
      if (u && (u.role === 'professional' || u.applicantName || u.name)) {
        const name = u.applicantName || u.name || 'cryto';
        return {
          id: u.id || u.workerId || 'WRK-00146',
          applicantName: name,
          name: name,
          status: 'Approved',
          phone: u.phone || '8778293269',
          email: u.email || 'cryto@gmail.com',
          avatar: getInitials(name),
          trade: u.tradeName || u.trade || "Women's Salon",
          tradeName: u.tradeName || u.trade || "Women's Salon",
          tier: 'New Partner (Level 1)',
          operationalHub: 'Krishnagiri Town (Direct Service)',
          employmentType: 'Direct Freelance',
          walletBalance: 0,
          lifetimeEarnings: 0,
          jobsCompleted: 0,
          rating: 0,
          isOnline: true
        };
      }
    } catch {}

    return {
      id: 'WRK-00146',
      applicantName: 'cryto',
      status: 'Approved',
      phone: '8778293269',
      email: 'cryto@gmail.com',
      avatar: 'CR',
      trade: "Women's Salon",
      tradeName: "Women's Salon",
      tier: 'New Partner (Level 1)',
      operationalHub: 'Krishnagiri Town (Direct Service)',
      employmentType: 'Direct Freelance',
      walletBalance: 0,
      lifetimeEarnings: 0,
      jobsCompleted: 0,
      rating: 0,
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
    const user = this.getStoredUser();
    const effectiveProId = (this.proId && this.proId !== 'PRO-8841') 
      ? this.proId 
      : (user?.id && user?.id !== 'PRO-8841' ? user.id : 'WRK-79932');

    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      'x-professional-id': effectiveProId,
      ...(user?.email ? { 'x-professional-email': user.email } : {}),
      ...(user?.applicantName || user?.name ? { 'x-professional-name': user.applicantName || user.name } : {}),
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

  async deleteNotification(id = 'all-read') {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE'
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
