// Centralized MERN API Client for Urban Company Replica
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (error) {
    console.warn(`API [${options.method || 'GET'}] ${endpoint} failed:`, error.message);
    throw error;
  }
}

// 1. Auth API
export const authApi = {
  login: (phone, name) => request('/auth/login', { method: 'POST', body: { phone, name } }),
  register: (nameOrData, phone, email, extra = {}) => {
    if (typeof nameOrData === 'object' && nameOrData !== null) {
      return request('/auth/register', { method: 'POST', body: nameOrData });
    }
    return request('/auth/register', { method: 'POST', body: { name: nameOrData, phone, email, ...extra } });
  },
  getMe: (phone) => request(`/auth/me${phone ? `?phone=${encodeURIComponent(phone)}` : ''}`),
  updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: profileData }),
};

// 2. Services Catalogue API
export const servicesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/services${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/services/${id}`),
  create: (serviceData) => request('/services', { method: 'POST', body: serviceData }),
  update: (id, fields) => request(`/services/${id}`, { method: 'PUT', body: fields }),
  delete: (id) => request(`/services/${id}`, { method: 'DELETE' }),
};

// 3. Bookings API
export const bookingsApi = {
  getAll: (phone) => request(`/bookings${phone ? `?phone=${encodeURIComponent(phone)}` : ''}`),
  getById: (id) => request(`/bookings/${id}`),
  create: (bookingData) => request('/bookings', { method: 'POST', body: bookingData }),
  update: (id, fields) => request(`/bookings/${id}`, { method: 'PUT', body: fields }),
  delete: (id) => request(`/bookings/${id}`, { method: 'DELETE' }),
};

// 4. Addresses API
export const addressesApi = {
  getAll: (phone) => request(`/addresses${phone ? `?phone=${encodeURIComponent(phone)}` : ''}`),
  create: (addressData) => request('/addresses', { method: 'POST', body: addressData }),
  update: (id, fields) => request(`/addresses/${id}`, { method: 'PUT', body: fields }),
  setDefault: (id) => request(`/addresses/${id}/default`, { method: 'PUT' }),
  delete: (id) => request(`/addresses/${id}`, { method: 'DELETE' }),
};

// 5. Worker Onboarding Applications API
export const workerApi = {
  getAll: () => request('/worker-applications'),
  submit: (applicationData) => request('/worker-applications', { method: 'POST', body: applicationData }),
  updateStatus: (id, status) => request(`/worker-applications/${id}`, { method: 'PUT', body: { status } }),
  delete: (id) => request(`/worker-applications/${id}`, { method: 'DELETE' }),
};

// 6. Partner Onboarding Applications API
export const partnerApi = {
  getAll: () => request('/partner-applications'),
  submit: (applicationData) => request('/partner-applications', { method: 'POST', body: applicationData }),
  updateStatus: (id, status) => request(`/partner-applications/${id}`, { method: 'PUT', body: { status } }),
  delete: (id) => request(`/partner-applications/${id}`, { method: 'DELETE' }),
};

// 7. Coupons API
export const couponsApi = {
  getAll: () => request('/coupons'),
  verify: (code, orderAmount) => request('/coupons/verify', { method: 'POST', body: { code, orderAmount } }),
  create: (couponData) => request('/coupons', { method: 'POST', body: couponData }),
};

// 8. Admin Operations API
export const adminApi = {
  getSettings: () => request('/admin/settings'),
  setSurge: (active) => request('/admin/surge', { method: 'POST', body: { active } }),
  setBroadcast: (message) => request('/admin/broadcast', { method: 'POST', body: { message } }),
  addAuditLog: (logData) => request('/admin/audit-logs', { method: 'POST', body: logData }),
  getStats: () => request('/admin/stats'),
};
