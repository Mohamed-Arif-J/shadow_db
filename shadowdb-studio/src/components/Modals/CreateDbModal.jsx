import React, { useState } from 'react';
import { Database, X } from 'lucide-react';

export default function CreateDbModal({
  isOpen,
  onClose,
  onCreate
}) {
  const [dbName, setDbName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = dbName.trim().replace(/[^a-zA-Z0-9_]/g, '');
    if (!clean) return;
    onCreate(clean);
    setDbName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#1f293d] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-sm font-semibold text-theme-primary flex items-center gap-2">
            <Database size={16} className="text-theme-accent" />
            <span>Create New Database</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-theme-elevated transition">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-theme-secondary">
              Database Identifier
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. ecommerce_store"
              value={dbName}
              onChange={(e) => setDbName(e.target.value)}
              className="w-full bg-theme-elevated border border-theme-border rounded-xl px-3.5 py-2 text-xs font-mono text-theme-primary placeholder-theme-muted focus:outline-none focus:border-theme-accent shadow-sm"
            />
            <p className="text-[10px] font-mono text-theme-muted">
              Alphanumeric characters and underscores only.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-theme-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-theme-border hover:bg-theme-elevated text-theme-secondary text-xs font-mono rounded-lg transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!dbName.trim()}
              className="px-4 py-1.5 bg-theme-accent text-black font-mono font-semibold text-xs rounded-lg hover:brightness-110 disabled:opacity-50 transition shadow-sm">
              Create Database
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
