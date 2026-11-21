const API_BASE = '/api/v1';

export const DEMO_ACCOUNTS = {
  Farmer: { email: 'farmer@agriwise.com', password: 'Farmer@123', label: 'Ramesh Patel (Farmer)', role: 'Farmer' },
  Buyer: { email: 'buyer@agriwise.com', password: 'Buyer@123', label: 'Ananya Sharma (Buyer)', role: 'Buyer' },
  Delivery: { email: 'delivery@agriwise.com', password: 'Delivery@123', label: 'Vikram Singh (Delivery Partner)', role: 'Delivery' },
  FPO: { email: 'fpo@agriwise.com', password: 'FPO@123', label: 'Sanjay Verma (FPO Lead)', role: 'FPO' },
  Admin: { email: 'admin@agriwise.com', password: 'Admin@123', label: 'Platform Administrator', role: 'Admin' }
};

export const DEMO_PROFILES = {
  'farmer@agriwise.com': { id: 1, name: 'Ramesh Patel', email: 'farmer@agriwise.com', role: 'Farmer', phone: '+91 98765 43210', preferred_language: 'en', account_status: 'ACTIVE' },
  'buyer@agriwise.com': { id: 2, name: 'Ananya Sharma', email: 'buyer@agriwise.com', role: 'Buyer', phone: '+91 98765 43211', preferred_language: 'en', account_status: 'ACTIVE' },
  'delivery@agriwise.com': { id: 3, name: 'Vikram Singh', email: 'delivery@agriwise.com', role: 'Delivery', phone: '+91 98765 43212', preferred_language: 'en', account_status: 'ACTIVE' },
  'fpo@agriwise.com': { id: 4, name: 'Sanjay Verma', email: 'fpo@agriwise.com', role: 'FPO', phone: '+91 98765 43213', preferred_language: 'en', account_status: 'ACTIVE' },
  'admin@agriwise.com': { id: 5, name: 'Platform Administrator', email: 'admin@agriwise.com', role: 'Admin', phone: '+91 98765 43214', preferred_language: 'en', account_status: 'ACTIVE' }
};

export const api = {
  getToken: () => localStorage.getItem('agriwise_token'),
  setToken: (token) => localStorage.setItem('agriwise_token', token),
  clearToken: () => localStorage.removeItem('agriwise_token'),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem('agriwise_user'));
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem('agriwise_user', JSON.stringify(user)),
  clearUser: () => localStorage.removeItem('agriwise_user'),

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    let res;
    try {
      res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });
    } catch {
      // If relative API_BASE failed (e.g. dev server proxy issue), try direct backend fallback
      try {
        res = await fetch(`http://127.0.0.1:8000/api/v1${endpoint}`, {
          ...options,
          headers
        });
      } catch {
        throw new Error('Backend server is unreachable (port 8000). Please start the backend server with `npm run backend` or `npm run dev`.');
      }
    }

    if (res.status === 401) {
      // Auto logout on expired session
      this.clearToken();
      this.clearUser();
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({
        detail: (res.status === 502 || res.status === 504)
          ? 'Backend API server (port 8000) is unreachable. Please verify the backend service is running.'
          : res.statusText
      }));
      throw new Error(errData.detail || 'Network error');
    }

    return res.json();
  },

  // Auth
  async login(email, password) {
    try {
      const data = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      this.setToken(data.access_token);
      this.setUser(data.user);
      return data;
    } catch (err) {
      // Safe offline demo fallback for demo accounts when backend server is offline
      const normalizedEmail = (email || '').trim().toLowerCase();
      const demoUser = DEMO_PROFILES[normalizedEmail];
      if (demoUser && (err.message.includes('unreachable') || err.message.includes('Network') || err.message.includes('fetch') || err.message.includes('502') || err.message.includes('504'))) {
        console.warn('[AgriWise] Backend is offline. Activating offline demo profile for', demoUser.role);
        const demoData = {
          access_token: 'demo-token-' + demoUser.role.toLowerCase(),
          token_type: 'bearer',
          user: demoUser,
          isOfflineDemo: true
        };
        this.setToken(demoData.access_token);
        this.setUser(demoData.user);
        return demoData;
      }
      throw err;
    }
  },

  async register(payload) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(data.access_token);
    this.setUser(data.user);
    return data;
  },

  async sendEmailOtp(email) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async verifyEmailOtp(email, otp) {
    const data = await this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    });
    this.setToken(data.access_token);
    this.setUser(data.user);
    return data;
  },

  async registerMultiStep(payload) {
    const data = await this.request('/auth/register-multistep', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(data.access_token);
    this.setUser(data.user);
    return data;
  },

  async getMe() {
    return this.request('/auth/me');
  },

  async getProfile() {
    return this.request('/auth/profile');
  },

  async updatePreferences(pref) {
    return this.request('/auth/preferences', {
      method: 'PATCH',
      body: JSON.stringify(pref)
    });
  },

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    this.clearToken();
    this.clearUser();
  },

  // Farms
  getFarms: () => api.request('/farms'),
  createFarm: (farm) => api.request('/farms', { method: 'POST', body: JSON.stringify(farm) }),
  deleteFarm: (id) => api.request(`/farms/${id}`, { method: 'DELETE' }),
  getFarmActivities: (farmId) => api.request(`/farms/${farmId}/activities`),
  addFarmActivity: (farmId, act) => api.request(`/farms/${farmId}/activities`, { method: 'POST', body: JSON.stringify(act) }),
  getFarmExpenses: (farmId) => api.request(`/farms/${farmId}/expenses`),
  addFarmExpense: (farmId, exp) => api.request(`/farms/${farmId}/expenses`, { method: 'POST', body: JSON.stringify(exp) }),

  // Crops
  getCrops: (farmId) => api.request(farmId ? `/crops?farm_id=${farmId}` : '/crops'),
  createCrop: (crop) => api.request('/crops', { method: 'POST', body: JSON.stringify(crop) }),
  updateCrop: (id, updates) => api.request(`/crops/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  deleteCrop: (id) => api.request(`/crops/${id}`, { method: 'DELETE' }),

  // Recommendation
  getCropRecommendation: (req) => api.request('/recommendations/crop', { method: 'POST', body: JSON.stringify(req) }),
  getRecommendationHistory: () => api.request('/recommendations/history'),

  // Weather Intelligence
  getWeather: (lat, lon, location, crops) => {
    let url = `/weather?lat=${lat || 28.9845}&lon=${lon || 77.7064}&location=${encodeURIComponent(location || 'Meerut, Uttar Pradesh')}`;
    if (crops && crops.length) {
      const cropStr = Array.isArray(crops) ? crops.join(',') : crops;
      url += `&crops=${encodeURIComponent(cropStr)}`;
    }
    return api.request(url);
  },

  // Disease
  analyzeDisease: (formData) => api.request('/disease/analyze', { method: 'POST', body: formData }),
  getDiseaseHistory: () => api.request('/disease/history'),

  // RAG Assistant
  chatAssistant: (message, conversation_id) => api.request('/assistant/chat', { method: 'POST', body: JSON.stringify({ message, conversation_id }) }),
  getAssistantStatus: () => api.request('/assistant/status'),
  getConversations: () => api.request('/assistant/conversations'),
  getConversationMessages: (id) => api.request(`/assistant/conversations/${id}`),

  // Market
  getCommodities: () => api.request('/market/commodities'),
  getMandiRates: (commodity, state, search) => {
    const params = new URLSearchParams();
    if (commodity) params.append('commodity', commodity);
    if (state && state !== 'All') params.append('state', state);
    if (search) params.append('search', search);
    return api.request(`/market/mandi-rates?${params.toString()}`);
  },
  getMarketOverview: () => api.request('/market/overview'),
  getMarketForecast: (product, location) => api.request(`/market/forecast?product=${encodeURIComponent(product)}&location=${encodeURIComponent(location || 'Central Mandi Hub')}`),

  // Marketplace
  getProducts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.request(`/products${q ? '?' + q : ''}`);
  },
  createProduct: (prod) => api.request('/products', { method: 'POST', body: JSON.stringify(prod) }),
  getProductDetail: (id) => api.request(`/products/${id}`),
  updateProduct: (id, updates) => api.request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  deleteProduct: (id) => api.request(`/products/${id}`, { method: 'DELETE' }),

  // Orders
  createOrder: (order) => api.request('/orders', { method: 'POST', body: JSON.stringify(order) }),
  getOrders: () => api.request('/orders'),
  getOrderDetail: (id) => api.request(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Notifications
  getNotifications: () => api.request('/notifications'),
  markNotificationRead: (id) => api.request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => api.request('/notifications/mark-all-read', { method: 'POST' }),

  // FPO
  getFpoOverview: () => api.request('/fpo/overview'),

  // Admin
  getAdminMetrics: () => api.request('/admin/metrics'),
  getAllUsers: () => api.request('/admin/users'),
  toggleUserStatus: (id, account_status) => api.request(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ account_status }) }),
  updateUserRole: (id, role) => api.request(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  getAuditLogs: () => api.request('/admin/audit-logs'),

  // Decision Support
  getDecisionSupport: () => api.request('/decision-support/dashboard'),

  // Delivery Partner Logistics & Telemetry
  getAssignedDeliveries: () => api.request('/delivery/orders/assigned'),
  getAvailableDeliveries: () => api.request('/delivery/orders/available'),
  getDeliveryHistory: () => api.request('/delivery/orders/history'),
  getDeliveryOrderDetail: (id) => api.request(`/delivery/orders/${id}`),
  claimDeliveryOrder: (id) => api.request(`/delivery/orders/${id}/claim`, { method: 'POST' }),
  updateDeliveryStatus: (id, payload) => api.request(`/delivery/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
  confirmDeliveryOtp: (id, payload) => api.request(`/delivery/orders/${id}/confirm`, { method: 'POST', body: JSON.stringify(payload) }),
  updateDeliveryGps: (id, payload) => api.request(`/delivery/orders/${id}/gps`, { method: 'POST', body: JSON.stringify(payload) }),
  getDeliveryRouteOptimization: (id) => api.request(`/delivery/orders/${id}/route`),
  getDeliveryCheckpoints: (id) => api.request(`/delivery/orders/${id}/checkpoints`),
  getDeliveryTelemetry: () => api.request('/delivery/telemetry/overview'),
};

