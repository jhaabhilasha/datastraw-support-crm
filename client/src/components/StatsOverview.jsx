import React from 'react';
import { Ticket, AlertCircle, Clock, CheckCircle2, Flame } from 'lucide-react';

export const StatsOverview = ({ stats, currentStatusFilter, onSelectFilter }) => {
  const cards = [
    {
      id: 'All',
      label: 'Total Tickets',
      value: stats?.total ?? 0,
      icon: Ticket,
      color: 'text-slate-700',
      bg: 'bg-slate-100',
      border: 'border-slate-200',
      badge: 'All items'
    },
    {
      id: 'Open',
      label: 'Open',
      value: stats?.open ?? 0,
      icon: AlertCircle,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'Needs triage'
    },
    {
      id: 'In Progress',
      label: 'In Progress',
      value: stats?.inProgress ?? 0,
      icon: Clock,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      badge: 'Active'
    },
    {
      id: 'Closed',
      label: 'Closed',
      value: stats?.closed ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      badge: `${stats?.resolutionRate ?? 0}% rate`
    },
    {
      id: 'Urgent',
      label: 'Urgent Unresolved',
      value: stats?.urgent ?? 0,
      icon: Flame,
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      badge: 'High Priority'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = currentStatusFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter(card.id === 'Urgent' ? 'All' : card.id)}
            className={`text-left p-4 rounded-xl border transition-all duration-150 relative overflow-hidden bg-white ${
              isActive
                ? 'ring-2 ring-indigo-500 shadow-sm border-indigo-200'
                : 'hover:border-slate-300 hover:shadow-xs border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">{card.label}</span>
              <div className={`p-1.5 rounded-lg ${card.bg} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </span>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${card.bg} ${card.color}`}>
                {card.badge}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
