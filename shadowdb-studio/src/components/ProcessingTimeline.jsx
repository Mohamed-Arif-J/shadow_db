import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Circle,
  ChevronDown,
  ChevronUp,
  Clock
} from 'lucide-react';

export default function ProcessingTimeline({
  steps = [],
  isCompleted = false,
  hasError = false,
  totalDurationMs = null
}) {
  // If complete, default to collapsed; if running or error, expanded
  const [isExpanded, setIsExpanded] = useState(!isCompleted || hasError);

  const activeStep = steps.find(s => s.status === 'running');
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const totalSteps = steps.length;

  return (
    <div className="rounded-xl border border-theme-border bg-theme-surface/70 backdrop-blur-sm overflow-hidden text-xs font-mono transition-all">
      {/* HEADER / SUMMARY BAR */}
      <button
        type="button"
        onClick={() => setIsExpanded(prev => !prev)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-theme-elevated/60 transition text-left">
        <div className="flex items-center gap-2.5 min-w-0">
          {hasError ? (
            <AlertCircle size={15} className="text-rose-500 shrink-0" />
          ) : isCompleted ? (
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
          ) : (
            <Loader2 size={15} className="text-theme-accent animate-spin shrink-0" />
          )}

          <div className="truncate">
            {hasError ? (
              <span className="font-semibold text-rose-500">
                Pipeline Error encountered
              </span>
            ) : isCompleted ? (
              <span className="text-theme-primary font-medium">
                All {totalSteps} pipeline stages completed
                {totalDurationMs ? (
                  <span className="text-theme-muted font-normal ml-1">
                    ({totalDurationMs}ms)
                  </span>
                ) : null}
              </span>
            ) : (
              <span className="text-theme-accent font-medium flex items-center gap-1.5">
                <span>{activeStep ? activeStep.name : "Processing request"}...</span>
                <span className="text-theme-muted font-normal text-[11px]">
                  ({completedCount}/{totalSteps})
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-theme-muted text-[11px] shrink-0">
          <span>{isExpanded ? "Collapse" : "Inspect stages"}</span>
          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </button>

      {/* EXPANDED STAGES LIST */}
      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-theme-border/40 space-y-2.5">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            const isWaiting = step.status === 'waiting';
            const isRunning = step.status === 'running';
            const isDone = step.status === 'completed';
            const isFailed = step.status === 'failed';

            return (
              <div key={step.id || idx} className="flex items-start gap-3 relative group">
                {/* Connector line */}
                {!isLast && (
                  <div className={`absolute left-[9px] top-[20px] bottom-[-10px] w-px ${isDone ? 'bg-emerald-500/30' : isRunning ? 'bg-theme-accent/30' : 'bg-theme-border/40'}`} />
                )}

                {/* Status Icon */}
                <div className="mt-0.5 shrink-0 z-10">
                  {isDone && <CheckCircle2 size={16} className="text-emerald-500" />}
                  {isRunning && <Loader2 size={16} className="text-theme-accent animate-spin" />}
                  {isFailed && <AlertCircle size={16} className="text-rose-500" />}
                  {isWaiting && <Circle size={16} className="text-theme-muted/50" />}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${isDone ? 'text-theme-primary' : isRunning ? 'text-theme-accent font-semibold' : isFailed ? 'text-rose-500' : 'text-theme-muted'}`}>
                      {step.name}
                    </span>
                    {step.durationMs ? (
                      <span className="text-[10px] text-theme-muted flex items-center gap-1">
                        <Clock size={10} /> {step.durationMs}ms
                      </span>
                    ) : null}
                  </div>

                  <p className={`text-[11px] mt-0.5 ${isRunning ? 'text-theme-secondary' : isWaiting ? 'text-theme-muted/70' : 'text-theme-muted'}`}>
                    {step.desc}
                  </p>

                  {/* Step Details if available */}
                  {step.detail && (
                    <div className={`mt-1.5 p-2 rounded-md text-[11px] font-mono ${isFailed ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-theme-elevated text-theme-secondary border border-theme-border/50'}`}>
                      {step.detail}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
