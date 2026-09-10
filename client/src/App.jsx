import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { SearchBarAndFilters } from './components/SearchBarAndFilters';
import { TicketList } from './components/TicketList';
import { CreateTicketModal } from './components/CreateTicketModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import {
  fetchTickets,
  fetchTicketById,
  createTicket,
  updateTicket,
  addTicketNote,
  fetchStats,
  seedDemoData,
  getExportCSVUrl
} from './services/api';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modals & Detail
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicketDetail, setSelectedTicketDetail] = useState(null);
  const [isUpdatingDetail, setIsUpdatingDetail] = useState(false);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load stats
  const refreshStats = useCallback(async () => {
    try {
      const data = await fetchStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Load tickets matching active filters
  const refreshTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchTickets({
        status: statusFilter,
        search: searchQuery,
        priority: priorityFilter
      });
      setTickets(data);
    } catch (err) {
      showToast(err.message || 'Error fetching tickets', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery, priorityFilter]);

  // Initial load
  useEffect(() => {
    refreshTickets();
    refreshStats();
  }, [refreshTickets, refreshStats]);

  // Handle Create Ticket
  const handleCreateTicket = async (formData) => {
    setIsSubmitting(true);
    try {
      const newTicket = await createTicket(formData);
      showToast(`Ticket ${newTicket.ticket_id} created successfully!`, 'success');
      setIsCreateOpen(false);
      await Promise.all([refreshTickets(), refreshStats()]);
      return true;
    } catch (err) {
      showToast(err.message || 'Failed to create ticket', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Ticket Detail
  const handleSelectTicket = async (ticketId) => {
    setSelectedTicketId(ticketId);
    try {
      const detail = await fetchTicketById(ticketId);
      setSelectedTicketDetail(detail);
    } catch (err) {
      showToast(err.message || 'Failed to load ticket details', 'error');
      setSelectedTicketId(null);
    }
  };

  // Handle Quick Status Change from row
  const handleQuickStatusChange = async (ticketId, newStatus) => {
    try {
      await updateTicket(ticketId, { status: newStatus });
      showToast(`Status updated to ${newStatus} for ${ticketId}`, 'success');
      
      // Optimistic update for immediate feedback
      setTickets((prev) =>
        prev.map((t) => (t.ticket_id === ticketId ? { ...t, status: newStatus } : t))
      );

      if (selectedTicketDetail?.ticket_id === ticketId) {
        setSelectedTicketDetail((prev) => ({ ...prev, status: newStatus }));
      }
      refreshStats();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
      refreshTickets();
    }
  };

  // Handle Status Change from Detail Drawer
  const handleUpdateStatusInDetail = async (ticketId, newStatus) => {
    setIsUpdatingDetail(true);
    try {
      await updateTicket(ticketId, { status: newStatus });
      setSelectedTicketDetail((prev) => ({ ...prev, status: newStatus }));
      showToast(`Ticket status changed to ${newStatus}`, 'success');
      await Promise.all([refreshTickets(), refreshStats()]);
    } catch (err) {
      showToast(err.message || 'Failed to update ticket status', 'error');
    } finally {
      setIsUpdatingDetail(false);
    }
  };

  // Handle Add Note from Detail Drawer
  const handleAddNote = async (ticketId, { note_text, author }) => {
    try {
      const newNote = await addTicketNote(ticketId, { note_text, author });
      setSelectedTicketDetail((prev) => ({
        ...prev,
        notes: [...(prev.notes || []), newNote]
      }));
      showToast('Internal note recorded', 'info');
      await refreshTickets();
    } catch (err) {
      showToast(err.message || 'Failed to add note', 'error');
    }
  };

  // Handle Demo Data Seeding
  const handleSeedData = async () => {
    if (!window.confirm('Reset and seed database with realistic sample tickets & notes?')) {
      return;
    }
    setIsSeeding(true);
    try {
      await seedDemoData();
      showToast('Database successfully seeded with realistic support data!', 'success');
      setSearchQuery('');
      setStatusFilter('All');
      setPriorityFilter('All');
      await Promise.all([refreshTickets(), refreshStats()]);
      if (selectedTicketId) {
        handleSelectTicket(selectedTicketId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to seed sample data', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-60 animate-fade-in">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              toast.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : toast.type === 'info'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        onOpenCreate={() => setIsCreateOpen(true)}
        onSeedData={handleSeedData}
        isSeeding={isSeeding}
        exportUrl={getExportCSVUrl()}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Metrics Dashboard Cards */}
        <StatsOverview
          stats={stats}
          currentStatusFilter={statusFilter}
          onSelectFilter={(newFilter) => setStatusFilter(newFilter)}
        />

        {/* Live Search and Status/Priority Filters */}
        <SearchBarAndFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          ticketCounts={stats}
        />

        {/* Tickets List / Table */}
        <TicketList
          tickets={tickets}
          isLoading={isLoading}
          onSelectTicket={handleSelectTicket}
          onQuickStatusChange={handleQuickStatusChange}
          onResetFilters={handleResetFilters}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 bg-white text-center text-xs text-slate-500">
        <p>
          Datastraw Assessment Test &bull; Built with Node.js, Express, SQLite, React, & Tailwind CSS
        </p>
      </footer>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTicket}
        isSubmitting={isSubmitting}
      />

      {/* Ticket Details & Notes Drawer */}
      <TicketDetailModal
        ticket={selectedTicketDetail}
        isOpen={!!selectedTicketId}
        onClose={() => {
          setSelectedTicketId(null);
          setSelectedTicketDetail(null);
        }}
        onUpdateStatus={handleUpdateStatusInDetail}
        onAddNote={handleAddNote}
        onSelectAnotherTicket={handleSelectTicket}
        isUpdating={isUpdatingDetail}
      />
    </div>
  );
}

export default App;
