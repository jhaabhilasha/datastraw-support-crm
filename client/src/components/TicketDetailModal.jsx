import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Clock,
  MessageSquare,
  Send,
  History,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink
} from 'lucide-react';

const CANNED_RESPONSES = [
  {
    label: '👋 Initial Triage',
    text: 'Thank you for contacting Datastraw Support. We have logged this issue and our engineering team is actively investigating.'
  },
  {
    label: '🔍 Need More Info',
    text: 'Could you please provide the exact error message, browser version, and timestamps when this occurred to help us replicate?'
  },
  {
    label: '💳 Billing Escalation',
    text: 'We have escalated this transaction to our billing finance department for review and potential adjustment within 1-2 business days.'
  },
  {
    label: '✅ Fix Deployed',
    text: 'A patch addressing this behavior has been successfully deployed to production. Please refresh your session and verify.'
  }
];

export const TicketDetailModal = ({
  ticket,
  isOpen,
  onClose,
  onUpdateStatus,
  onAddNote,
  onSelectAnotherTicket,
  isUpdating
}) => {
  const [newNote, setNewNote] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Support Agent');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  if (!isOpen || !ticket) return null;

  const handleStatusChange = async (newStatus) => {
    await onUpdateStatus(ticket.ticket_id, newStatus);
  };

  const handleAddNoteSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmittingNote(true);
    try {
      await onAddNote(ticket.ticket_id, {
        note_text: newNote.trim(),
        author: noteAuthor.trim() || 'Support Agent'
      });
      setNewNote('');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const applyCannedResponse = (text) => {
    setNewNote((prev) => (prev ? `${prev}\n\n${text}` : text));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-left border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-200">
              {ticket.ticket_id}
            </span>
            <div className="flex items-center gap-2">
              <label htmlFor="modal-status-select" className="text-xs font-semibold text-slate-500">Status:</label>
              <select
                id="modal-status-select"
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all ${
                  ticket.status === 'Open'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : ticket.status === 'In Progress'
                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}
              >
                <option value="Open">● Open</option>
                <option value="In Progress">● In Progress</option>
                <option value="Closed">● Closed</option>
              </select>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Issue Subject & Priority */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {ticket.subject}
              </h2>
              {ticket.priority && (
                <span
                  className={`text-xs uppercase font-bold px-2.5 py-1 rounded-md border shrink-0 ${
                    ticket.priority === 'Urgent'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : ticket.priority === 'High'
                      ? 'bg-orange-100 text-orange-800 border-orange-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {ticket.priority} Priority
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Created: {formatDate(ticket.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Updated: {formatDate(ticket.updated_at)}
              </span>
            </div>
          </div>

          {/* Customer Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Customer Profile
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">{ticket.customer_name}</div>
                <a
                  href={`mailto:${ticket.customer_email}`}
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
                >
                  <Mail className="w-3 h-3" />
                  {ticket.customer_email}
                </a>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Customer History</span>
                <div className="text-xs font-semibold text-slate-700">
                  {ticket.customer_history ? ticket.customer_history.length + 1 : 1} Total Tickets
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Problem Description
            </h4>
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </div>
          </div>

          {/* Customer 360: Other Tickets by this Customer */}
          {ticket.customer_history && ticket.customer_history.length > 0 && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-900 mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-indigo-600" />
                Customer 360: Other Tickets by this User ({ticket.customer_history.length})
              </h4>
              <div className="space-y-1.5">
                {ticket.customer_history.map((hist) => (
                  <div
                    key={hist.ticket_id}
                    onClick={() => onSelectAnotherTicket(hist.ticket_id)}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-indigo-100 hover:border-indigo-300 transition-colors cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-700">{hist.ticket_id}</span>
                      <span className="text-slate-800 font-medium truncate max-w-xs">{hist.subject}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {hist.status}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes & Activity Section */}
          <div className="border-t border-slate-200 pt-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Internal Notes & Collaboration ({ticket.notes?.length || 0})
            </h4>

            {/* Notes Timeline */}
            <div className="space-y-3 mb-6">
              {ticket.notes && ticket.notes.length > 0 ? (
                ticket.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
                        {note.author || 'Support Agent'}
                      </span>
                      <span className="text-[11px] text-slate-400">{formatDate(note.created_at)}</span>
                    </div>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap">{note.note_text}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No internal notes added yet. Add a note or choose a canned response below.
                </div>
              )}
            </div>

            {/* Canned Responses shortcuts */}
            <div className="mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1.5">
                <Sparkles className="w-3 h-3 text-indigo-500" /> Quick Canned Replies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CANNED_RESPONSES.map((canned, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyCannedResponse(canned.text)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 transition-colors"
                  >
                    {canned.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNoteSubmit} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Agent Name (e.g. Sarah J.)"
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-44"
                />
                <span className="text-xs text-slate-400">Collaborating on this ticket</span>
              </div>
              <textarea
                rows={3}
                placeholder="Write an internal note or update status context..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNote.trim() || isSubmittingNote}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingNote ? 'Saving...' : 'Add Note'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
