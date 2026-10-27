import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Download,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from '../theme/themeContextInstance';
import ShadowLogo from './ShadowLogo';

export default function Header({
  currentDbName,
  ollamaActive,
  onImportClick,
  onExportClick
}) {
  const { theme, toggleTheme } = useTheme();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 border-b border-theme-border bg-theme-surface/95 backdrop-blur-md px-5 flex items-center justify-between sticky top-0 z-30 transition-colors shrink-0 shadow-xs">
      {/* Brand & Active DB */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <ShadowLogo size={34} withGlow={true} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold tracking-wider bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 dark:from-cyan-300 dark:via-indigo-300 dark:to-fuchsia-400 bg-clip-text text-transparent">
                SHADOW_DB
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/25 dark:border-cyan-500/30 font-semibold shadow-xs">
                v2.0
              </span>
            </div>
            <p className="text-[10px] font-mono text-theme-secondary flex items-center gap-1.5 hidden sm:flex">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
              <span>AI Text-to-SQL Engine</span>
              <span className="text-theme-muted">•</span>
              <span className="text-purple-600 dark:text-purple-400 font-semibold">Qwen 2.5 Coder 7B</span>
            </p>
          </div>
        </div>

        <div className="h-4 w-px bg-theme-border mx-1 hidden sm:block" />

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-theme-elevated/80 border border-theme-border text-xs font-mono shadow-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-theme-muted text-[10px] uppercase font-semibold">ACTIVE:</span>
          <span className="font-bold text-theme-primary">{currentDbName}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Import */}
        <button
          onClick={onImportClick}
          title="Import SQLite database or SQL dump"
          className="px-2.5 py-1.5 rounded-md bg-theme-elevated hover:bg-theme-border/50 border border-theme-border text-xs font-mono text-theme-secondary hover:text-theme-primary flex items-center gap-1.5 transition">
          <Upload size={13} className="text-theme-accent" />
          <span className="hidden md:inline">Import</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu(prev => !prev)}
            className="px-2.5 py-1.5 rounded-md bg-theme-elevated hover:bg-theme-border/50 border border-theme-border text-xs font-mono text-theme-secondary hover:text-theme-primary flex items-center gap-1.5 transition">
            <Download size={13} className="text-emerald-500" />
            <span className="hidden md:inline">Export</span>
            <ChevronDown size={11} className="text-theme-muted" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#1f293d] shadow-2xl py-1 z-50 text-xs font-mono">
              <button
                onClick={() => {
                  onExportClick('sqlite');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between transition">
                <span>Export .sqlite binary</span>
                <span className="text-[10px] text-slate-400">WASM</span>
              </button>
              <button
                onClick={() => {
                  onExportClick('sql');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between transition">
                <span>Export .sql script</span>
                <span className="text-[10px] text-slate-400">DDL+Data</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 rounded-md bg-theme-elevated hover:bg-theme-border/50 border border-theme-border text-theme-secondary hover:text-theme-primary transition">
          {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-600" />}
        </button>

        {/* Ollama Status Badge */}
        <div className="h-4 w-px bg-theme-border mx-1" />
        <div
          title={ollamaActive ? "Ollama model server is running on http://127.0.0.1:11434" : "Ollama server is offline or unreachable"}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition ${ollamaActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' : 'bg-amber-500/10 text-amber-500 border-amber-500/25'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${ollamaActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="hidden sm:inline font-medium">{ollamaActive ? "OLLAMA ACTIVE" : "OLLAMA OFFLINE"}</span>
        </div>
      </div>
    </header>
  );
}
