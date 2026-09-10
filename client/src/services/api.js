const API_BASE = '/api/tickets';

/**
 * Fetch all tickets matching optional status, search query, or priority
 */
export const fetchTickets = async ({ status = 'All', search = '', priority = 'All' } = {}) => {
  const params = new URLSearchParams();
  if (status && status !== 'All') params.append('status', status);
  if (search && search.trim() !== '') params.append('search', search.trim());
  if (priority && priority !== 'All') params.append('priority', priority);

  const url = `${API_BASE}${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch tickets (${res.status})`);
  }
  return res.json();
};

/**
 * Fetch ticket details by ticket_id including notes & customer history
 */
export const fetchTicketById = async (ticketId) => {
  const res = await fetch(`${API_BASE}/${ticketId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch ticket ${ticketId}`);
  }
  return res.json();
};

/**
 * Create a new ticket
 * Returns { ticket_id, created_at, ... }
 */
export const createTicket = async (ticketData) => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to create ticket (${res.status})`);
  }
  return res.json();
};

/**
 * Update ticket status and optionally append note
 * Returns { success: true, updated_at }
 */
export const updateTicket = async (ticketId, updateData) => {
  const res = await fetch(`${API_BASE}/${ticketId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to update ticket ${ticketId}`);
  }
  return res.json();
};

/**
 * Add a new internal note directly to a ticket
 */
export const addTicketNote = async (ticketId, { note_text, author }) => {
  const res = await fetch(`${API_BASE}/${ticketId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note_text, author }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to add note to ticket ${ticketId}`);
  }
  return res.json();
};

/**
 * Fetch KPI metrics for the dashboard
 */
export const fetchStats = async () => {
  const res = await fetch(`${API_BASE}/stats/summary`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch ticket statistics');
  }
  return res.json();
};

/**
 * Seed database with sample realistic tickets
 */
export const seedDemoData = async () => {
  const res = await fetch(`${API_BASE}/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to seed sample data');
  }
  return res.json();
};

/**
 * Returns export CSV URL
 */
export const getExportCSVUrl = () => `${API_BASE}/export/csv`;
