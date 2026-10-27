import React, { useState } from 'react';
import { Table2, X, Plus } from 'lucide-react';

export default function AddTableModal({
  isOpen,
  onClose,
  currentDbName,
  onAddTable
}) {
  const [tableSql, setTableSql] = useState(
    "CREATE TABLE courses (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  credits INTEGER DEFAULT 3\n);"
  );

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tableSql.trim()) return;
    onAddTable(tableSql);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#1f293d] rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-sm font-semibold text-theme-primary flex items-center gap-2">
            <Table2 size={16} className="text-theme-accent" />
            <span>Add Table into '{currentDbName}'</span>
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
              CREATE TABLE DDL (SQLite Syntax)
            </label>
            <textarea
              rows={6}
              value={tableSql}
              onChange={(e) => setTableSql(e.target.value)}
              className="w-full bg-[var(--code-bg)] text-[var(--code-text)] border border-theme-border rounded-xl p-3 font-mono text-xs focus:outline-none focus:border-theme-accent leading-relaxed shadow-inner"
            />
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
              className="px-4 py-1.5 bg-theme-accent text-black font-mono font-semibold text-xs rounded-lg hover:brightness-110 flex items-center gap-1.5 transition shadow-sm">
              <Plus size={14} /> Execute & Add Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
