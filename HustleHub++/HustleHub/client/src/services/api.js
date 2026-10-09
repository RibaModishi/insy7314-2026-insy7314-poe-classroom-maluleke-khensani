import { getGigArtwork } from '../data/gigArtwork';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
const TOKEN_KEY = 'hustlehub.token';

export function saveToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export async function request(path, { token = getToken(), ...options } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Unable to connect to the HustleHub+ API. Check that the backend is running.');
  }

  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) {
      saveToken(null);
      window.dispatchEvent(new Event('hustlehub:unauthorized'));
    }
    const error = new Error(data?.error || `Request failed (${response.status})`);
    error.status = response.status;
    error.retryAfterSeconds = data?.retryAfterSeconds;
    throw error;
  }
  return data;
}

const post = (path, body, token) => request(path, {
  method: 'POST', body: JSON.stringify(body), ...(token ? { token } : {}),
});

export const authAPI = {
  login: async (credentials) => {
    const { token } = await post('/api/auth/login', credentials, null);
    saveToken(token);
    try {
      return { token, user: await request('/api/auth/me', { token }) };
    } catch (error) {
      saveToken(null);
      throw error;
    }
  },
  register: async (details) => {
    await post('/api/auth/register', details, null);
    return authAPI.login({ email: details.email, password: details.password });
  },
  me: (token = getToken()) => request('/api/auth/me', { token }),
  logout: () => saveToken(null),
};

export const gigAPI = {
  list: () => request('/api/gigs'),
  get: (id) => request(`/api/gigs/${id}`),
  create: (gig) => post('/api/gigs', gig),
  update: (id, gig) => request(`/api/gigs/${id}`, { method: 'PUT', body: JSON.stringify(gig) }),
  remove: (id) => request(`/api/gigs/${id}`, { method: 'DELETE' }),
};

export const bookingAPI = {
  list: () => request('/api/bookings'),
  create: (gigId) => post('/api/bookings', { gigId }),
  updateStatus: (id, status) => request(`/api/bookings/${id}/status`, {
    method: 'PUT', body: JSON.stringify({ status }),
  }),
};

export const transactionAPI = {
  list: () => request('/api/transactions'),
  income: () => request('/api/transactions/income'),
};

export function toGigView(gig) {
  return {
    ...gig,
    id: gig._id || gig.id,
    freelancerId: typeof gig.freelancer === 'object' ? gig.freelancer?._id : gig.freelancer,
    freelancerName: typeof gig.freelancer === 'object' ? gig.freelancer?.name || 'Freelancer' : 'Freelancer',
    deliveryDays: 7,
    rating: 'New',
    reviewCount: 0,
    tags: [],
    image: getGigArtwork(gig),
  };
}

export function toBookingView(booking) {
  return {
    ...booking,
    id: booking._id || booking.id,
    gigTitle: booking.gig?.title || 'Gig',
    freelancerName: booking.freelancer?.name || 'Freelancer',
    clientName: booking.client?.name || 'Client',
    createdAt: booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : '',
  };
}
