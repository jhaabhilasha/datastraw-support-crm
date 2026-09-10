import React from 'react';
import { MessageSquare, Calendar, ArrowRight, User, AlertCircle, Inbox } from 'lucide-react';

const statusStyles = {
  'Open': {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500'
  },
  'In Progress': {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500'
  },
  'Closed': {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500'
  }
};

const priorityStyles = {
  'Urgent': 'bg-rose-100 text-rose-800 border-rose-200 font-semibold',
  'High': 'bg-orange-100 text-orange-800 border-orange-200',
  'Medium': 'bg-slate-100 text-slate-700 border-slate-200',
  'Low': 'bg-gray-100 text-gray-600 border-gray-200'
};

export const TicketList = ({
  tickets,
  isLoading,
  onSelectTicket,
  onQuickStatusChange,
  onResetFilters
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-4 w-2/3">
                <div className="w-16 h-6 bg-slate-200 rounded-md"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-4 bg-slate-200 rounded-sm"></div>
                  <div className="w-1/2 h-3 bg-slate-100 rounded-sm"></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-20 h-6 bg-slate-100 rounded-full"></div>
                <div className="w-16 h-4 bg-slate-100 rounded-sm"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Inbox className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">No support tickets found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
          No tickets matched your current search and filter criteria. Try adjusting your query or filters.
        </p>
        <button
          onClick={onResetFilters}
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
        >
          Reset Filters & Search
        </button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Desktop Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <div className="col-span-2">Ticket ID</div>
        <div className="col-span-3">Customer</div>
        <div className="col-span-4">Issue Subject</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1 text-right">Date</div>
      </div>

      {/* Ticket Rows */}
      <div className="divide-y divide-slate-100">
        {tickets.map((ticket) => {
          const statusConfig = statusStyles[ticket.status] || statusStyles['Open'];
          const priorityBadgeClass = priorityStyles[ticket.priority] || priorityStyles['Medium'];

          return (
            <div
              key={ticket.ticket_id}
              onClick={() => onSelectTicket(ticket.ticket_id)}
              className="p-4 sm:px-5 sm:py-3.5 hover:bg-indigo-50/40 transition-colors cursor-pointer group"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-4 items-center">
                {/* ID & Priority (Col 2) */}
                <div className="md:col-span-2 flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-800 px-2 py-1 rounded-md border border-slate-200 transition-colors">
                    {ticket.ticket_id}
                  </span>
                  {ticket.priority && (
                    <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${priorityBadgeClass}`}>
                      {ticket.priority}
                    </span>
                  )}
                </div>

                {/* Customer Info (Col 3) */}
                <div className="md:col-span-3">
                  <div className="font-medium text-sm text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{ticket.customer_name}</span>
                  </div>
                  <div className="text-xs text-slate-500 truncate pl-5">
                    {ticket.customer_email}
                  </div>
                </div>

                {/* Subject & snippet (Col 4) */}
                <div className="md:col-span-4">
                  <div className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {ticket.subject}
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {ticket.description}
                  </div>
                  {/* Mobile-only tags */}
                  <div className="flex md:hidden items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${statusConfig.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                      {ticket.status}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(ticket.created_at)}
                    </span>
                  </div>
                </div>

                {/* Status Dropdown / Badge (Col 2) */}
                <div className="hidden md:flex md:col-span-2 items-center gap-2">
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="relative"
                  >
                    <select
                      value={ticket.status}
                      onChange={(e) => onQuickStatusChange(ticket.ticket_id, e.target.value)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors ${statusConfig.badge}`}
                    >
                      <option value="Open">● Open</option>
                      <option value="In Progress">● In Progress</option>
                      <option value="Closed">● Closed</option>
                    </select>
                  </div>

                  {ticket.notes_count > 0 && (
                    <span
                      title={`${ticket.notes_count} internal notes`}
                      className="inline-flex items-center gap-1 text-slate-400 text-xs hover:text-slate-600"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-mono">{ticket.notes_count}</span>
                    </span>
                  )}
                </div>

                {/* Date & Detail Arrow (Col 1) */}
                <div className="hidden md:flex md:col-span-1 items-center justify-end gap-2 text-right">
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(ticket.created_at)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
