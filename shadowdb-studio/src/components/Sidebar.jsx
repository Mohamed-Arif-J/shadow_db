import React from 'react';
import {
  Terminal,
  Compass,
  Database,
  GitCommit,
  ChevronRight
} from 'lucide-react';
import ShadowLogo from './ShadowLogo';

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentDbName,
  tablesCount,
  commitsCount
}) {
  const navItems = [
    {
      id: 'studio',
      label: 'Studio',
      sublabel: 'Conversational SQL',
      icon: Terminal,
      color: 'text-sky-500 dark:text-sky-400',
      activeStyle: 'bg-gradient-to-r from-sky-500/15 to-indigo-500/10 border-sky-500/40 text-sky-600 dark:text-sky-300 shadow-[0_2px_10px_rgba(14,165,233,0.12)]'
    },
    {
      id: 'explore',
      label: 'Explore',
      sublabel: 'Query Suggestions',
      icon: Compass,
      color: 'text-purple-500 dark:text-purple-400',
      activeStyle: 'bg-gradient-to-r from-purple-500/15 to-pink-500/10 border-purple-500/40 text-purple-600 dark:text-purple-300 shadow-[0_2px_10px_rgba(168,85,247,0.12)]'
    },
    {
      id: 'explorer',
      label: 'Explorer',
      sublabel: `${tablesCount} tables`,
      icon: Database,
      color: 'text-emerald-500 dark:text-emerald-400',
      activeStyle: 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-300 shadow-[0_2px_10px_rgba(16,185,129,0.12)]'
    },
    {
      id: 'commits',
      label: 'Commits',
      sublabel: `${commitsCount} snapshots`,
      icon: GitCommit,
      color: 'text-amber-500 dark:text-amber-400',
      activeStyle: 'bg-gradient-to-r from-amber-500/15 to-orange-500/10 border-amber-500/40 text-amber-600 dark:text-amber-300 shadow-[0_2px_10px_rgba(245,158,11,0.12)]'
    }
  ];

  return (
    <aside className="w-56 h-full border-r border-theme-border bg-theme-surface/70 backdrop-blur-sm p-3 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
      <div className="space-y-1.5">
        <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-theme-muted font-semibold flex items-center justify-between">
          <span>Navigation</span>
          <span className="w-1.5 h-1.5 rounded-full bg-theme-accent" />
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono transition group text-left border ${isActive
                ? `${item.activeStyle} font-semibold`
                : 'text-theme-secondary hover:bg-theme-elevated hover:text-theme-primary border-transparent'
              }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-1 rounded-md transition ${isActive ? 'bg-white/20 dark:bg-white/10' : 'bg-transparent'}`}>
                  <Icon
                    size={15}
                    className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? item.color : 'text-theme-muted group-hover:text-theme-secondary'}`}
                  />
                </div>
                <div className="truncate">
                  <div className="truncate font-semibold">{item.label}</div>
                  <div className={`text-[10px] font-normal truncate ${isActive ? 'opacity-90' : 'text-theme-muted'}`}>
                    {item.sublabel}
                  </div>
                </div>
              </div>
              {isActive && <ChevronRight size={13} className="shrink-0 opacity-80" />}
            </button>
          );
        })}
      </div>

      {/* Database Context Widget with ShadowLogo */}
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-theme-elevated/90 to-theme-surface border border-theme-border text-xs font-mono space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShadowLogo size={18} withGlow={false} />
            <span className="text-[10px] uppercase tracking-wider text-theme-muted font-semibold">Active Sandbox</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
            WASM
          </span>
        </div>
        <div className="font-bold text-theme-primary truncate pl-0.5" title={currentDbName}>
          {currentDbName}
        </div>
        <div className="text-[11px] text-theme-secondary flex items-center justify-between pt-1.5 border-t border-theme-border/60">
          <span className="text-theme-muted">Tables in DB:</span>
          <span className="font-bold px-1.5 py-0.2 rounded bg-theme-surface border border-theme-border text-theme-primary">
            {tablesCount}
          </span>
        </div>
      </div>
    </aside>
  );
}
