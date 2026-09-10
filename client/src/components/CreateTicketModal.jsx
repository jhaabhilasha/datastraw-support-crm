import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';

export const CreateTicketModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    priority: 'Medium'
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.customer_name.trim()) {
      errs.customer_name = 'Customer name is required';
    }
    if (!formData.customer_email.trim()) {
      errs.customer_email = 'Customer email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.customer_email.trim())) {
        errs.customer_email = 'Please enter a valid email address';
      }
    }
    if (!formData.subject.trim()) {
      errs.subject = 'Subject is required';
    }
    if (!formData.description.trim()) {
      errs.description = 'Issue description is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await onSubmit({
      customer_name: formData.customer_name.trim(),
      customer_email: formData.customer_email.trim().toLowerCase(),
      subject: formData.subject.trim(),
      description: formData.description.trim(),
      priority: formData.priority
    });

    if (success) {
      setFormData({
        customer_name: '',
        customer_email: '',
        subject: '',
        description: '',
        priority: 'Medium'
      });
      setErrors({});
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Create Support Ticket</h3>
            <p className="text-xs text-slate-500">Enter customer information and details regarding the issue</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Jane Doe"
                value={formData.customer_name}
                onChange={(e) => {
                  setFormData({ ...formData, customer_name: e.target.value });
                  if (errors.customer_name) setErrors({ ...errors, customer_name: null });
                }}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 transition-all ${
                  errors.customer_name
                    ? 'border-rose-300 ring-rose-200 focus:ring-rose-400'
                    : 'border-slate-200 focus:ring-indigo-500'
                }`}
              />
              {errors.customer_name && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.customer_name}
                </p>
              )}
            </div>

            {/* Customer Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="e.g. jane@company.com"
                value={formData.customer_email}
                onChange={(e) => {
                  setFormData({ ...formData, customer_email: e.target.value });
                  if (errors.customer_email) setErrors({ ...errors, customer_email: null });
                }}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 transition-all ${
                  errors.customer_email
                    ? 'border-rose-300 ring-rose-200 focus:ring-rose-400'
                    : 'border-slate-200 focus:ring-indigo-500'
                }`}
              />
              {errors.customer_email && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.customer_email}
                </p>
              )}
            </div>
          </div>

          {/* Issue Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Brief summary of the issue..."
              value={formData.subject}
              onChange={(e) => {
                setFormData({ ...formData, subject: e.target.value });
                if (errors.subject) setErrors({ ...errors, subject: null });
              }}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 transition-all ${
                errors.subject
                  ? 'border-rose-300 ring-rose-200 focus:ring-rose-400'
                  : 'border-slate-200 focus:ring-indigo-500'
              }`}
            />
            {errors.subject && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.subject}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Low', 'Medium', 'High', 'Urgent'].map((pri) => (
                <button
                  type="button"
                  key={pri}
                  onClick={() => setFormData({ ...formData, priority: pri })}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    formData.priority === pri
                      ? pri === 'Urgent'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500 font-bold'
                        : pri === 'High'
                        ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500 font-bold'
                        : 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pri}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Provide complete details, error codes, logs, or steps to reproduce..."
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: null });
              }}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 transition-all ${
                errors.description
                  ? 'border-rose-300 ring-rose-200 focus:ring-rose-400'
                  : 'border-slate-200 focus:ring-indigo-500'
              }`}
            />
            {errors.description && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.description}
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Creating...' : 'Create Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
