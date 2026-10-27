import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Table2,
  Code2
} from 'lucide-react';
import ProcessingTimeline from './ProcessingTimeline';
import ShadowLogo from './ShadowLogo';

export default function ConversationView({
  conversationHistory = [],
  onPromote,
  currentDbName,
  onSelectPrompt,
  quickPrompts = []
}) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);

  // Auto-scroll container on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [conversationHistory]);

  const handleCopy = (sqlText, msgId) => {
    navigator.clipboard.writeText(sqlText);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (conversationHistory.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto space-y-6 min-h-0">
        <ShadowLogo size={68} withGlow={true} />

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 dark:from-cyan-300 dark:via-indigo-300 dark:to-fuchsia-400 bg-clip-text text-transparent">
            ShadowDB Query Assistant
          </h2>
          <p className="text-sm text-theme-secondary max-w-md mx-auto leading-relaxed">
            Ask natural-language questions about your database. ShadowDB synthesizes SQL via local LLMs and verifies operations in an isolated WebAssembly sandbox.
          </p>
        </div>

        {/* Quick starter chips */}
        {quickPrompts.length > 0 && (
          <div className="w-full space-y-2 pt-2">
            <div className="text-[11px] font-mono text-theme-muted uppercase tracking-wider">
              Suggested questions for '{currentDbName}':
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt(q)}
                  className="p-3 rounded-xl bg-theme-surface hover:bg-theme-elevated border border-theme-border hover:border-theme-accent/40 text-xs font-mono text-theme-secondary hover:text-theme-primary transition group shadow-sm flex items-start gap-2">
                  <Sparkles size={13} className="text-theme-accent shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span className="line-clamp-2">{q}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-8 max-w-4xl w-full mx-auto min-h-0">
      {conversationHistory.map((item) => {
        const isCompleted = item.status === 'completed';
        const hasError = item.status === 'error';
        const outcome = item.sandboxOutcome;

        return (
          <div key={item.id} className="space-y-4 animate-in fade-in duration-200">
            {/* USER MESSAGE ROW */}
            <div className="flex justify-end">
              <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-theme-elevated border border-theme-border p-4 shadow-sm space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-theme-muted">
                  <span className="flex items-center gap-1 font-semibold text-theme-accent">
                    <Database size={11} /> {item.dbName || currentDbName}
                  </span>
                  <span>{item.timestamp}</span>
                </div>
                <p className="text-sm text-theme-primary whitespace-pre-wrap leading-relaxed font-sans">
                  {item.question}
                </p>
              </div>
            </div>

            {/* AI RESPONSE ROW */}
            <div className="flex items-start gap-3">
              <ShadowLogo size={28} withGlow={true} className="mt-0.5" />

              <div className="flex-1 min-w-0 space-y-4">
                {/* 1. Processing Timeline */}
                <ProcessingTimeline
                  steps={item.steps}
                  isCompleted={isCompleted}
                  hasError={hasError}
                  totalDurationMs={item.totalDurationMs}
                />

                {/* 2. Error Message if failed */}
                {hasError && item.error && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs font-mono text-rose-400 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5 text-rose-500">
                      <AlertTriangle size={14} /> Execution Interrupted
                    </div>
                    <p className="text-rose-400/90">{item.error}</p>
                  </div>
                )}

                {/* 3. Generated SQL Block */}
                {item.generatedSql && (
                  <div className="rounded-xl border border-theme-border bg-theme-surface overflow-hidden shadow-sm">
                    <div className="px-4 py-2 border-b border-theme-border/60 bg-theme-elevated/40 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <Code2 size={13} className="text-theme-accent" />
                        <span className="font-semibold text-theme-primary">Synthesized SQL</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-theme-accent/10 text-theme-accent border border-theme-accent/25">
                          T=0.0 GREEDY
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopy(item.generatedSql, item.id)}
                        className="px-2 py-1 rounded bg-theme-surface hover:bg-theme-elevated border border-theme-border text-[11px] text-theme-secondary hover:text-theme-primary flex items-center gap-1.5 transition">
                        {copiedId === item.id ? (
                          <>
                            <Check size={12} className="text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy SQL</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-4 bg-[var(--code-bg)] text-[var(--code-text)] font-mono text-xs overflow-x-auto leading-relaxed border-0">
                      <code>{item.generatedSql}</code>
                    </pre>
                  </div>
                )}

                {/* 4. Sandbox Outcome & Results Table */}
                {outcome && (
                  <div className={`rounded-xl border p-4 space-y-3 ${outcome.success ? 'bg-emerald-500/5 border-emerald-500/25' : 'bg-rose-500/5 border-rose-500/25'}`}>
                    {/* Status header with Promote Action */}
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        {outcome.success ? (
                          <>
                            <CheckCircle2 className="text-emerald-500" size={15} />
                            <span className="text-emerald-500 font-semibold">
                              Sandbox Dry-Run Passed ({outcome.executionTimeMs}ms)
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="text-rose-500" size={15} />
                            <span className="text-rose-500 font-semibold">
                              Execution Error: {outcome.error}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Promote button */}
                      {outcome.success && (
                        <div>
                          {item.isPromoted ? (
                            <span className="px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold flex items-center gap-1.5">
                              <Check size={13} /> Applied to Production
                            </span>
                          ) : (
                            <button
                              onClick={() => onPromote(item)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 transition shadow-sm">
                              <span>Promote to Production</span>
                              <ArrowRight size={13} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Warnings (e.g. naked update/delete) */}
                    {outcome.warnings?.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs font-mono text-amber-500 space-y-1">
                        {outcome.warnings.map((w, idx) => (
                          <p key={idx} className="flex items-center gap-1.5">
                            <AlertTriangle size={13} /> {w}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Results Table */}
                    {outcome.results?.length > 0 && outcome.results[0].columns?.length > 0 ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-theme-muted">
                          <span className="flex items-center gap-1">
                            <Table2 size={12} className="text-theme-accent" /> Returned Rows
                          </span>
                          <span>
                            {outcome.results[0].values.length} {outcome.results[0].values.length === 1 ? 'row' : 'rows'}
                          </span>
                        </div>

                        <div className="rounded-lg border border-theme-border overflow-x-auto bg-theme-surface">
                          <table className="w-full text-left font-mono text-xs border-collapse">
                            <thead className="bg-theme-elevated border-b border-theme-border text-theme-secondary">
                              <tr>
                                {outcome.results[0].columns.map((c, i) => (
                                  <th key={i} className="px-3.5 py-2 font-semibold">
                                    {c}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {outcome.results[0].values.map((row, i) => (
                                <tr
                                  key={i}
                                  className="border-b border-theme-border/40 hover:bg-theme-elevated/50 transition">
                                  {row.map((val, j) => (
                                    <td key={j} className="px-3.5 py-2 text-theme-primary">
                                      {val === null ? (
                                        <span className="text-theme-muted italic">null</span>
                                      ) : (
                                        String(val)
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : outcome.success ? (
                      <div className="text-xs font-mono text-theme-muted py-1">
                        Query completed successfully with 0 rows returned (DDL or DML executed).
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
