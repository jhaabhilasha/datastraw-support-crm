import express from 'express';
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  addTicketNote,
  getStatsSummary,
  exportTicketsCSV
} from '../controllers/ticketsController.js';
import { seedDatabase } from '../seeds/seedData.js';

const router = express.Router();

// Specific routes before parameterized :ticket_id
router.get('/stats/summary', getStatsSummary);
router.get('/export/csv', exportTicketsCSV);

router.post('/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database seeded successfully with sample tickets and notes.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Standard REST endpoints matching spec
router.post('/', createTicket);
router.get('/', getTickets);
router.get('/:ticket_id', getTicketById);
router.put('/:ticket_id', updateTicket);
router.post('/:ticket_id/notes', addTicketNote);

export default router;
