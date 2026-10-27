import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

export default function DeleteDbModal({
  isOpen,
  onClose,
  onConfirm,
  dbName
}) {
  if (!isOpen || !dbName) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#1f293d] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-900 dark:text-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0">
              <Trash2 size={20} />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                Delete Database
              </h3>
              <p className="text-xs font-mono text-rose-500 flex items-center gap-1 mt-0.5">
                <AlertTriangle size={12} /> Irreversible Action
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X size={16} />
          </button>
        </div>

        <div className="text-xs font-sans text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
          <p>
            Are you sure you want to permanently delete the database{' '}
            <strong className="font-mono text-slate-900 dark:text-white px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {dbName}
            </strong>
            ?
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            This will permanently remove all table schemas, data records, and all recorded commit snapshots from your browser storage.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono rounded-lg transition">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(dbName);
              onClose();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm active:scale-95">
            <Trash2 size={13} />
            <span>Delete Database</span>
          </button>
        </div>
      </div>
    </div>
  );
}
