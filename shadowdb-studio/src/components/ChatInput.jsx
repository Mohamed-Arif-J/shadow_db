import React, { useState, useRef, useEffect } from 'react';
import {
  Database,
  ChevronDown,
  ArrowUp,
  Plus,
  Check,
  Sparkles,
  Trash2
} from 'lucide-react';
import DeleteDbModal from './Modals/DeleteDbModal';

export default function ChatInput({
  prompt,
  setPrompt,
  onSubmit,
  loading,
  currentDbName,
  databasesList,
  onSelectDatabase,
  onRemoveDatabase,
  onOpenCreateDbModal,
  tablesCount = 0
}) {
  const [showDbDropdown, setShowDbDropdown] = useState(false);
  const [dbToDelete, setDbToDelete] = useState(null);
  const dropdownRef = useRef(null);
  const textareaRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDbDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-resize textarea height as content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 44), 160);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [prompt]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !loading) {
        onSubmit();
      }
    }
  };

  const isSubmitDisabled = !prompt.trim() || loading;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Container with rounded border, shadow and backdrop blur */}
      <div className="relative rounded-2xl bg-theme-surface/95 border border-theme-border shadow-lg backdrop-blur-xl transition-all focus-within:border-theme-accent/50 focus-within:ring-2 focus-within:ring-theme-accent/15">
        
        {/* TOP BAR: Database Selector */}
        <div className="px-3.5 pt-3 pb-1.5 flex items-center justify-between border-b border-theme-border/50">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowDbDropdown(prev => !prev)}
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-theme-elevated hover:bg-theme-border/60 border border-theme-border text-xs font-mono text-theme-primary transition group shadow-sm">
              <Database size={13} className="text-theme-accent group-hover:scale-105 transition-transform" />
              <span className="font-semibold text-theme-primary">
                {currentDbName ? currentDbName : "Select Database"}
              </span>
              <span className="text-[10px] text-theme-muted font-normal">
                ({tablesCount} {tablesCount === 1 ? 'table' : 'tables'})
              </span>
              <ChevronDown
                size={12}
                className={`text-theme-muted transition-transform duration-150 ${showDbDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Floating Database Dropdown with 100% Solid Background */}
            {showDbDropdown && (
              <div className="absolute left-0 bottom-full mb-2 w-64 rounded-xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#1f293d] shadow-2xl p-2 z-50 text-xs font-mono">
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Available Databases</span>
                  <span className="text-[10px] lowercase text-slate-400">{databasesList.length} total</span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-0.5 my-1">
                  {databasesList.map(name => {
                    const isSelected = name === currentDbName;
                    return (
                      <div
                        key={name}
                        onClick={() => {
                          onSelectDatabase(name);
                          setShowDbDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition text-left cursor-pointer group ${isSelected
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border border-slate-300 dark:border-slate-700'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent'
                        }`}>
                        <div className="flex items-center gap-2 truncate">
                          <Database size={12} className={isSelected ? 'text-theme-accent' : 'text-slate-400'} />
                          <span className="truncate">{name}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSelected && <Check size={12} className="text-emerald-500" />}
                          {databasesList.length > 1 && onRemoveDatabase && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDbToDelete(name);
                              }}
                              title={`Delete database '${name}'`}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/10 text-rose-500/70 hover:text-rose-500 transition">
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDbDropdown(false);
                      onOpenCreateDbModal();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-theme-accent hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium">
                    <Plus size={13} />
                    <span>Create New Database</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-theme-muted">
            <span className="hidden sm:inline">Text-to-SQL</span>
            <Sparkles size={11} className="text-theme-accent" />
          </div>
        </div>

        {/* MIDDLE: Text Input Area */}
        <div className="p-3 flex items-end gap-2.5">
          <textarea
            ref={textareaRef}
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about the database..."
            className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm text-theme-primary placeholder-theme-muted font-sans resize-none py-1.5 px-1 leading-relaxed max-h-40 min-h-[44px]"
          />

          {/* SEND BUTTON */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitDisabled}
            title={isSubmitDisabled ? "Enter a query to submit" : "Execute query (Enter)"}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150 ${isSubmitDisabled
              ? 'bg-theme-elevated text-theme-muted cursor-not-allowed border border-theme-border/60 opacity-60'
              : 'bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 text-white font-bold hover:brightness-110 shadow-md hover:shadow-cyan-500/25 active:scale-95'
            }`}>
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* BOTTOM HELPER HINT */}
        <div className="px-3.5 pb-2 pt-0 flex items-center justify-between text-[10px] font-mono text-theme-muted">
          <div className="flex items-center gap-1.5">
            <kbd className="px-1 py-0.5 rounded bg-theme-elevated border border-theme-border text-[9px] text-theme-secondary flex items-center gap-0.5">
              <span>↵</span>
            </kbd>
            <span>submit</span>
            <span className="text-theme-border">•</span>
            <kbd className="px-1 py-0.5 rounded bg-theme-elevated border border-theme-border text-[9px] text-theme-secondary">
              Shift + ↵
            </kbd>
            <span>newline</span>
          </div>

          <span className="text-[10px] text-theme-muted hidden sm:inline">
            Sandbox dry-run enabled
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal for ChatInput dropdown */}
      <DeleteDbModal
        isOpen={Boolean(dbToDelete)}
        onClose={() => setDbToDelete(null)}
        onConfirm={(name) => {
          if (onRemoveDatabase) onRemoveDatabase(name);
        }}
        dbName={dbToDelete}
      />
    </div>
  );
}
