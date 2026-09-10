import { dbGet, dbAll, dbRun, generateNextTicketId } from '../config/database.js';

/**
 * POST /api/tickets
 * Body: { customer_name, customer_email, subject, description, priority }
 * Returns: { ticket_id, created_at } (plus full record for UI)
 */
export const createTicket = async (req, res) => {
  try {
    const { customer_name, customer_email, subject, description, priority = 'Medium' } = req.body;

    // Validation
    if (!customer_name || !customer_email || !subject || !description) {
      return res.status(400).json({
        error: 'Validation failed: customer_name, customer_email, subject, and description are required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email.trim())) {
      return res.status(400).json({ error: 'Validation failed: Invalid email format.' });
    }

    const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
    const sanitizedPriority = validPriorities.includes(priority) ? priority : 'Medium';

    const ticket_id = await generateNextTicketId();
    const now = new Date().toISOString();

    await dbRun(
      `INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status, priority, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'Open', ?, ?, ?)`,
      [ticket_id, customer_name.trim(), customer_email.trim().toLowerCase(), subject.trim(), description.trim(), sanitizedPriority, now, now]
    );

    // Return as per spec: { ticket_id, created_at } (with full ticket attached for convenience)
    res.status(201).json({
      ticket_id,
      created_at: now,
      customer_name: customer_name.trim(),
      customer_email: customer_email.trim().toLowerCase(),
      subject: subject.trim(),
      description: description.trim(),
      status: 'Open',
      priority: sanitizedPriority
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Internal server error while creating ticket.' });
  }
};

/**
 * GET /api/tickets
 * Query params: ?status=Open&search=query&priority=High
 * Returns: Array of tickets
 */
export const getTickets = async (req, res) => {
  try {
    const { status, search, priority } = req.query;

    let sql = `
      SELECT t.id, t.ticket_id, t.customer_name, t.customer_email, t.subject, t.description,
             t.status, t.priority, t.created_at, t.updated_at,
             COUNT(n.id) as notes_count
      FROM tickets t
      LEFT JOIN notes n ON t.ticket_id = n.ticket_id
      WHERE 1=1
    `;
    const params = [];

    // Filter by status (Open, In Progress, Closed)
    if (status && status !== 'All') {
      sql += ` AND LOWER(t.status) = LOWER(?)`;
      params.push(status);
    }

    // Filter by priority (optional extra)
    if (priority && priority !== 'All') {
      sql += ` AND LOWER(t.priority) = LOWER(?)`;
      params.push(priority);
    }

    // Search functionality across names, IDs, emails, subjects, descriptions
    if (search && search.trim() !== '') {
      const searchPattern = `%${search.trim()}%`;
      sql += ` AND (
        t.ticket_id LIKE ? OR
        t.customer_name LIKE ? OR
        t.customer_email LIKE ? OR
        t.subject LIKE ? OR
        t.description LIKE ?
      )`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    sql += ` GROUP BY t.id ORDER BY t.created_at DESC`;

    const tickets = await dbAll(sql, params);
    res.json(tickets);
  } catch (error) {
    console.error('Error retrieving tickets:', error);
    res.status(500).json({ error: 'Internal server error while retrieving tickets.' });
  }
};

/**
 * GET /api/tickets/:ticket_id
 * Returns: { ticket_id, customer_name, customer_email, subject, description, status, priority, created_at, updated_at, notes, customer_history }
 */
export const getTicketById = async (req, res) => {
  try {
    const { ticket_id } = req.params;

    const ticket = await dbGet(`SELECT * FROM tickets WHERE ticket_id = ?`, [ticket_id]);
    if (!ticket) {
      return res.status(404).json({ error: `Ticket with ID ${ticket_id} not found.` });
    }

    // Fetch notes ordered chronologically
    const notes = await dbAll(
      `SELECT id, ticket_id, note_text, author, created_at FROM notes WHERE ticket_id = ? ORDER BY created_at ASC`,
      [ticket_id]
    );

    // Customer 360 Standout feature: Fetch customer's previous tickets
    const customerHistory = await dbAll(
      `SELECT ticket_id, subject, status, priority, created_at
       FROM tickets
       WHERE customer_email = ? AND ticket_id != ?
       ORDER BY created_at DESC LIMIT 5`,
      [ticket.customer_email, ticket_id]
    );

    res.json({
      ...ticket,
      notes: notes || [],
      customer_history: customerHistory || []
    });
  } catch (error) {
    console.error('Error retrieving ticket by ID:', error);
    res.status(500).json({ error: 'Internal server error while retrieving ticket details.' });
  }
};

/**
 * PUT /api/tickets/:ticket_id
 * Body: { status, notes, priority }
 * Returns: { success: true, updated_at }
 */
export const updateTicket = async (req, res) => {
  try {
    const { ticket_id } = req.params;
    const { status, notes, note_text, author = 'Support Agent', priority } = req.body;

    const ticket = await dbGet(`SELECT * FROM tickets WHERE ticket_id = ?`, [ticket_id]);
    if (!ticket) {
      return res.status(404).json({ error: `Ticket with ID ${ticket_id} not found.` });
    }

    const updates = [];
    const params = [];
    const now = new Date().toISOString();

    if (status) {
      const validStatuses = ['Open', 'In Progress', 'Closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status: ${status}. Must be Open, In Progress, or Closed.` });
      }
      updates.push(`status = ?`);
      params.push(status);
    }

    if (priority) {
      const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
      if (validPriorities.includes(priority)) {
        updates.push(`priority = ?`);
        params.push(priority);
      }
    }

    updates.push(`updated_at = ?`);
    params.push(now);

    params.push(ticket_id);
    await dbRun(`UPDATE tickets SET ${updates.join(', ')} WHERE ticket_id = ?`, params);

    // If notes text is included in PUT body (as specified in PDF: { status, notes })
    const noteContent = note_text || (typeof notes === 'string' ? notes : null);
    if (noteContent && noteContent.trim() !== '') {
      await dbRun(
        `INSERT INTO notes (ticket_id, note_text, author, created_at) VALUES (?, ?, ?, ?)`,
        [ticket_id, noteContent.trim(), author, now]
      );
    }

    // Return as specified in PDF: { success: true, updated_at }
    res.json({
      success: true,
      updated_at: now,
      ticket_id,
      status: status || ticket.status
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Internal server error while updating ticket.' });
  }
};

/**
 * POST /api/tickets/:ticket_id/notes
 * Body: { note_text, author }
 */
export const addTicketNote = async (req, res) => {
  try {
    const { ticket_id } = req.params;
    const { note_text, author = 'Support Agent' } = req.body;

    if (!note_text || note_text.trim() === '') {
      return res.status(400).json({ error: 'note_text is required.' });
    }

    const ticket = await dbGet(`SELECT ticket_id FROM tickets WHERE ticket_id = ?`, [ticket_id]);
    if (!ticket) {
      return res.status(404).json({ error: `Ticket with ID ${ticket_id} not found.` });
    }

    const now = new Date().toISOString();
    const result = await dbRun(
      `INSERT INTO notes (ticket_id, note_text, author, created_at) VALUES (?, ?, ?, ?)`,
      [ticket_id, note_text.trim(), author, now]
    );

    // Also touch updated_at on ticket
    await dbRun(`UPDATE tickets SET updated_at = ? WHERE ticket_id = ?`, [now, ticket_id]);

    res.status(201).json({
      id: result.lastID,
      ticket_id,
      note_text: note_text.trim(),
      author,
      created_at: now
    });
  } catch (error) {
    console.error('Error adding ticket note:', error);
    res.status(500).json({ error: 'Internal server error while adding note.' });
  }
};

/**
 * GET /api/tickets/stats/summary
 * Returns KPI metrics for dashboard
 */
export const getStatsSummary = async (req, res) => {
  try {
    const totalRow = await dbGet(`SELECT COUNT(*) as count FROM tickets`);
    const openRow = await dbGet(`SELECT COUNT(*) as count FROM tickets WHERE status = 'Open'`);
    const inProgressRow = await dbGet(`SELECT COUNT(*) as count FROM tickets WHERE status = 'In Progress'`);
    const closedRow = await dbGet(`SELECT COUNT(*) as count FROM tickets WHERE status = 'Closed'`);
    const urgentRow = await dbGet(`SELECT COUNT(*) as count FROM tickets WHERE priority = 'Urgent' AND status != 'Closed'`);

    const total = totalRow?.count || 0;
    const open = openRow?.count || 0;
    const inProgress = inProgressRow?.count || 0;
    const closed = closedRow?.count || 0;
    const urgent = urgentRow?.count || 0;
    const resolutionRate = total > 0 ? Math.round((closed / total) * 100) : 0;

    res.json({
      total,
      open,
      inProgress,
      closed,
      urgent,
      resolutionRate
    });
  } catch (error) {
    console.error('Error getting stats summary:', error);
    res.status(500).json({ error: 'Internal server error while retrieving statistics.' });
  }
};

/**
 * GET /api/tickets/export/csv
 * Returns all tickets as a downloadable CSV
 */
export const exportTicketsCSV = async (req, res) => {
  try {
    const tickets = await dbAll(`SELECT * FROM tickets ORDER BY created_at DESC`);
    
    // Build CSV string
    const headers = ['Ticket ID', 'Customer Name', 'Customer Email', 'Subject', 'Status', 'Priority', 'Created At', 'Updated At'];
    const rows = tickets.map(t => [
      `"${t.ticket_id}"`,
      `"${(t.customer_name || '').replace(/"/g, '""')}"`,
      `"${(t.customer_email || '').replace(/"/g, '""')}"`,
      `"${(t.subject || '').replace(/"/g, '""')}"`,
      `"${t.status}"`,
      `"${t.priority}"`,
      `"${t.created_at}"`,
      `"${t.updated_at}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="tickets-export-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Internal server error while exporting CSV.' });
  }
};
