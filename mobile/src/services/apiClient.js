import { API_BASE_URL, CLOUD_API_URL } from '../config/api';

/**
 * Universal Mobile API Client connected directly to the Express & MongoDB Atlas backend.
 */
class MobileApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const primaryUrl = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {})
    };

    try {
      const response = await fetch(primaryUrl, {
        ...options,
        headers
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error ${response.status}`);
      }
      return data;
    } catch (err) {
      // Fallback to cloud HTTPS backend if local IP is unreachable or blocked by browser mixed content
      if (this.baseUrl !== CLOUD_API_URL) {
        try {
          const fallbackUrl = `${CLOUD_API_URL}${endpoint}`;
          const fallbackRes = await fetch(fallbackUrl, { ...options, headers });
          const fallbackData = await fallbackRes.json();
          if (fallbackRes.ok) return fallbackData;
        } catch (_) {}
      }
      console.warn(`[MobileApiClient] Error querying ${endpoint}:`, err.message);
      throw err;
    }
  }

  // Health
  checkHealth() {
    return this.request('/health');
  }

  // Bookings
  getBookings(phone) {
    return this.request(`/bookings${phone ? `?phone=${encodeURIComponent(phone)}` : ''}`);
  }

  createBooking(bookingPayload) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingPayload)
    });
  }

  getBookingById(id) {
    return this.request(`/bookings/${id}`);
  }

  // Promotions & Coupons
  getPromotions() {
    return this.request('/promotions');
  }

  validateCoupon(code, totalAmount) {
    return this.request('/promotions/validate', {
      method: 'POST',
      body: JSON.stringify({ code, totalAmount })
    });
  }

  // Services
  getServices() {
    return this.request('/services');
  }

  // Auth / OTP
  sendOtp(phone) {
    return this.request('/auth/send-registration-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  }

  verifyOtp(phone, otp) {
    return this.request('/auth/verify-registration-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp })
    });
  }
}

export const mobileApi = new MobileApiClient(API_BASE_URL);
export default mobileApi;
