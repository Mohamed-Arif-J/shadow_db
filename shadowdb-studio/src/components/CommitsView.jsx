import React, { useState } from 'react';
import {
  GitCommit,
  RotateCcw,
  CheckCircle2,
  Clock,
  Code2,
  Check
} from 'lucide-react';
import RollbackModal from './Modals/RollbackModal';

export default function CommitsView({
  commits = [],
  currentDbName,
  onRollback
}) {
  const [selectedCommitForRollback, setSelectedCommitForRollback] = useState(null);
  const [rollbackSuccessMsg, setRollbackSuccessMsg] = useState(null);

  const handleConfirmRollback = async (commitId) => {
    const success = await onRollback(commitId);
    if (success !== false) {
      setRollbackSuccessMsg(`Successfully rolled back '${currentDbName}' to snapshot ${commitId}`);
      setTimeout(() => setRollbackSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 max-w-3xl w-full mx-auto space-y-6 animate-in fade-in duration-150">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-theme-primary flex items-center gap-2">
          <GitCommit size={20} className="text-theme-accent" />
          <span>Commit History for '{currentDbName}'</span>
        </h2>
        <p className="text-xs text-theme-secondary font-mono">
          Each transaction and applied change creates an immutable SQLite snapshot. You can safely rollback to any previous state.
        </p>
      </div>

      {/* Success Notification Banner */}
      {rollbackSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center justify-between shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Check size={15} className="font-bold" />
            <span className="font-semibold">{rollbackSuccessMsg}</span>
          </div>
          <button
            onClick={() => setRollbackSuccessMsg(null)}
            className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 text-[11px] underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-3">
        {commits.map((c, idx) => {
          const isLatest = idx === 0;

          return (
            <div
              key={c.id}
              className={`rounded-xl border p-4 transition shadow-sm space-y-3 ${isLatest
                ? 'bg-theme-surface border-theme-accent/40 ring-1 ring-theme-accent/15'
                : 'bg-theme-surface/70 border-theme-border hover:border-theme-border/80'
              }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-theme-accent/10 text-theme-accent border border-theme-accent/25 font-semibold">
                      {c.id}
                    </span>
                    {isLatest && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-semibold border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 size={10} /> CURRENT HEAD
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-theme-primary">
                    {c.message}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-theme-muted">
                    <Clock size={11} /> {c.timestamp}
                  </div>
                </div>

                {!isLatest && (
                  <button
                    type="button"
                    onClick={() => setSelectedCommitForRollback(c)}
                    className="px-3 py-1.5 rounded-lg border border-theme-border hover:border-theme-accent/50 text-xs font-mono text-theme-secondary hover:text-theme-accent bg-theme-elevated transition flex items-center gap-1.5 shrink-0 active:scale-95">
                    <RotateCcw size={12} />
                    <span>Rollback</span>
                  </button>
                )}
              </div>

              {/* SQL Applied snippet if present */}
              {c.sqlApplied && (
                <div className="pt-2 border-t border-theme-border/50">
                  <div className="text-[10px] font-mono text-theme-muted mb-1 flex items-center gap-1">
                    <Code2 size={11} /> Applied SQL Statement:
                  </div>
                  <pre className="p-2.5 rounded-lg bg-[var(--code-bg)] text-[var(--code-text)] font-mono text-[11px] overflow-x-auto">
                    <code>{c.sqlApplied}</code>
                  </pre>
                </div>
              )}
            </div>
          );
        })}

        {commits.length === 0 && (
          <div className="p-8 text-center text-xs font-mono text-theme-muted rounded-xl border border-theme-border bg-theme-surface">
            No commit snapshots recorded yet.
          </div>
        )}
      </div>

      {/* Confirmation Modal for Rollback */}
      <RollbackModal
        isOpen={Boolean(selectedCommitForRollback)}
        onClose={() => setSelectedCommitForRollback(null)}
        onConfirm={handleConfirmRollback}
        commitItem={selectedCommitForRollback}
        currentDbName={currentDbName}
      />
    </div>
  );
}
