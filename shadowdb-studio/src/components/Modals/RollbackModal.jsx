import { RotateCcw, AlertTriangle, X, Clock } from 'lucide-react';

export default function RollbackModal({
  isOpen,
  onClose,
  onConfirm,
  commitItem,
  currentDbName
}) {
  if (!isOpen || !commitItem) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#1f293d] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-900 dark:text-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
              <RotateCcw size={20} />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                Rollback Database State
              </h3>
              <p className="text-xs font-mono text-amber-500 flex items-center gap-1 mt-0.5">
                <AlertTriangle size={12} /> State Restoration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X size={16} />
          </button>
        </div>

        <div className="text-xs font-sans text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
          <p>
            Are you sure you want to revert database{' '}
            <strong className="font-mono text-slate-900 dark:text-white px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {currentDbName}
            </strong>{' '}
            to snapshot{' '}
            <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
              {commitItem.id}
            </span>
            ?
          </p>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
              <Clock size={11} />
              <span>{commitItem.timestamp}</span>
            </div>
            <p className="font-medium text-slate-800 dark:text-slate-200">
              "{commitItem.message}"
            </p>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            This will restore the database tables and data back to this exact snapshot point. A new rollback commit will be recorded.
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
              onConfirm(commitItem.id);
              onClose();
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-semibold rounded-lg flex items-center gap-1.5 transition shadow-sm active:scale-95">
            <RotateCcw size={13} />
            <span>Confirm Rollback</span>
          </button>
        </div>
      </div>
    </div>
  );
}
