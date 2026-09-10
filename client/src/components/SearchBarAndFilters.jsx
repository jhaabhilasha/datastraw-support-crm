import React from 'react';
import { Search, X, Filter } from 'lucide-react';

export const SearchBarAndFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  ticketCounts
}) => {
  const statusTabs = [
    { id: 'All', label: 'All Tickets', count: ticketCounts?.total },
    { id: 'Open', label: 'Open', count: ticketCounts?.open },
    { id: 'In Progress', label: 'In Progress', count: ticketCounts?.inProgress },
    { id: 'Closed', label: 'Closed', count: ticketCounts?.closed },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs space-y-4">
      {/* Top row: Search input + Priority selector */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search bar (works as you type) */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search across ticket ID, customer name, email, subject, or description..."
            className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="priority-select" className="text-xs font-medium text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Priority:
          </label>
          <select
            id="priority-select"
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="text-xs font-medium py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-700 cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Bottom row: Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wider">Status:</span>
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onStatusChange(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
