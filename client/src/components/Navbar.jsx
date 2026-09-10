import React from 'react';
import { Plus, Download, Sparkles, LifeBuoy, CheckCircle2 } from 'lucide-react';

export const Navbar = ({ onOpenCreate, onSeedData, isSeeding, exportUrl }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand and Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <LifeBuoy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">DATASTRAW</span>
                <span className="text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                  CRM Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Customer Support & Ticketing Operations</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Seeder */}
            <button
              onClick={onSeedData}
              disabled={isSeeding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 disabled:opacity-50"
              title="Populate realistic test tickets with notes"
            >
              <Sparkles className={`w-3.5 h-3.5 text-indigo-600 ${isSeeding ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{isSeeding ? 'Seeding...' : 'Seed Demo Data'}</span>
            </button>

            {/* CSV Export */}
            <a
              href={exportUrl}
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
              title="Export all tickets to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Export CSV</span>
            </a>

            {/* Create Ticket Primary CTA */}
            <button
              onClick={onOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Ticket</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
