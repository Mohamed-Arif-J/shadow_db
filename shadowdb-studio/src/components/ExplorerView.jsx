import React, { useState, useMemo } from 'react';
import {
  Database,
  Plus,
  Trash2,
  Table2,
  Check,
  Code2,
  Search,
  Key,
  Layers,
  Copy,
  ChevronDown
} from 'lucide-react';
import DeleteDbModal from './Modals/DeleteDbModal';
import ShadowLogo from './ShadowLogo';

export default function ExplorerView({
  currentDbName,
  databasesList = [],
  tables = [],
  selectedTableName,
  onSelectTable,
  onLoadDatabase,
  onRemoveDatabase,
  onOpenCreateDbModal,
  onOpenAddTableModal,
  getTableData,
  getTableStructure
}) {
  const [tableSearch, setTableSearch] = useState('');
  const [rowSearch, setRowSearch] = useState('');
  const [activeViewMode, setActiveViewMode] = useState('data'); // 'data' | 'schema' | 'structure'
  const [showDbMenu, setShowDbMenu] = useState(false);
  const [dbToDelete, setDbToDelete] = useState(null);
  const [copiedDdl, setCopiedDdl] = useState(false);

  // Filter tables
  const filteredTables = useMemo(() => {
    return tables.filter(t =>
      t.name.toLowerCase().includes(tableSearch.toLowerCase())
    );
  }, [tables, tableSearch]);

  const selectedTableMeta = tables.find(t => t.name === selectedTableName);

  // Live table data records
  const activeTableContent = useMemo(() => {
    if (!selectedTableName || !getTableData) return { columns: [], values: [] };
    return getTableData(selectedTableName);
  }, [selectedTableName, getTableData]);

  // Column structure via PRAGMA
  const activeTableStructure = useMemo(() => {
    if (!selectedTableName || !getTableStructure) return [];
    return getTableStructure(selectedTableName);
  }, [selectedTableName, getTableStructure]);

  // Filter rows within the selected table
  const filteredRows = useMemo(() => {
    if (!rowSearch.trim() || !activeTableContent.values) return activeTableContent.values || [];
    const q = rowSearch.toLowerCase();
    return activeTableContent.values.filter(row =>
      row.some(val => String(val).toLowerCase().includes(q))
    );
  }, [activeTableContent, rowSearch]);

  const handleCopyDdl = () => {
    if (selectedTableMeta?.sql) {
      navigator.clipboard.writeText(selectedTableMeta.sql + ';');
      setCopiedDdl(true);
      setTimeout(() => setCopiedDdl(false), 2000);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* LEFT COLUMN: ORGANIZED DATABASE & TABLE SIDEBAR (w-72) */}
      <div className="w-72 border-r border-theme-border bg-theme-surface/60 flex flex-col shrink-0">
        
        {/* 1. Database Selector & Header */}
        <div className="p-3.5 border-b border-theme-border space-y-2.5 bg-theme-surface">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-theme-muted">
            <span>Database Workspace</span>
            <button
              onClick={onOpenCreateDbModal}
              title="Create New Database"
              className="text-theme-accent hover:underline flex items-center gap-1 font-semibold">
              <Plus size={11} /> New DB
            </button>
          </div>

          {/* Active Database Card with Switch Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDbMenu(prev => !prev)}
              className="w-full p-2.5 rounded-xl bg-theme-elevated hover:bg-theme-elevated/80 border border-theme-border text-left transition flex items-center justify-between group shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <ShadowLogo size={26} withGlow={false} />
                <div className="truncate">
                  <div className="font-mono text-xs font-bold text-theme-primary truncate">
                    {currentDbName}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    {tables.length} {tables.length === 1 ? 'table' : 'tables'} registered
                  </div>
                </div>
              </div>
              <ChevronDown
                size={14}
                className={`text-theme-muted transition-transform duration-150 ${showDbMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Database Switcher Popover */}
            {showDbMenu && (
              <div className="absolute left-0 top-full mt-1.5 w-full rounded-xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#1f293d] shadow-2xl p-2 z-50 text-xs font-mono">
                <div className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 px-2 py-1">
                  Switch Database
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 my-1">
                  {databasesList.map(name => {
                    const isSelected = name === currentDbName;
                    return (
                      <div
                        key={name}
                        onClick={() => {
                          onLoadDatabase(name);
                          setShowDbMenu(false);
                        }}
                        className={`p-2 rounded-lg cursor-pointer transition flex items-center justify-between group ${isSelected
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border border-slate-300 dark:border-slate-700'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
                        }`}>
                        <div className="flex items-center gap-2 truncate">
                          <Database size={13} className={isSelected ? 'text-theme-accent' : 'text-slate-400'} />
                          <span className="truncate">{name}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSelected && <Check size={12} className="text-emerald-500" />}
                          {databasesList.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDbToDelete(name);
                                setShowDbMenu(false);
                              }}
                              title={`Delete database '${name}'`}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/10 text-rose-500/70 hover:text-rose-500 transition">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Tables Section Header & Filter */}
        <div className="p-3 border-b border-theme-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-theme-primary flex items-center gap-1.5">
              <Table2 size={13} className="text-theme-accent" />
              <span>Tables</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-theme-elevated text-theme-muted font-normal">
                {tables.length}
              </span>
            </span>

            <button
              onClick={onOpenAddTableModal}
              title="Add Table to Database"
              className="px-2 py-0.5 bg-theme-accent/10 hover:bg-theme-accent/20 text-theme-accent border border-theme-accent/30 rounded text-[11px] font-mono flex items-center gap-1 transition font-medium">
              <Plus size={11} /> New Table
            </button>
          </div>

          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-theme-muted" />
            <input
              type="text"
              placeholder="Search tables..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full bg-theme-elevated border border-theme-border rounded-lg pl-7 pr-2.5 py-1 text-xs font-mono text-theme-primary placeholder-theme-muted focus:outline-none focus:border-theme-accent"
            />
          </div>
        </div>

        {/* 3. Tables List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredTables.map((t) => {
            const isSelected = t.name === selectedTableName;
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => onSelectTable(t.name)}
                className={`w-full p-2.5 rounded-xl border transition flex items-center justify-between text-left group ${isSelected
                  ? 'bg-theme-accent/15 border-theme-accent/40 text-theme-primary font-semibold shadow-sm'
                  : 'bg-theme-surface/70 border-theme-border/60 text-theme-secondary hover:bg-theme-elevated hover:text-theme-primary'
                }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${isSelected ? 'bg-theme-accent/20 text-theme-accent' : 'bg-theme-elevated text-theme-muted'}`}>
                    <Table2 size={13} />
                  </div>
                  <div className="truncate">
                    <p className="font-mono text-xs truncate leading-snug">{t.name}</p>
                    <span className="text-[10px] font-mono text-theme-muted">
                      {t.rowCount} {t.rowCount === 1 ? 'row' : 'rows'}
                    </span>
                  </div>
                </div>

                {isSelected && <Check size={13} className="text-theme-accent shrink-0" />}
              </button>
            );
          })}

          {tables.length === 0 && (
            <div className="text-center py-10 px-4 text-xs font-mono text-theme-muted space-y-2">
              <Table2 size={24} className="mx-auto text-theme-muted/50" />
              <p>No tables in this database.</p>
              <button
                onClick={onOpenAddTableModal}
                className="text-theme-accent underline text-[11px]">
                Create a table
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: MAIN TABLE WORKSPACE */}
      <div className="flex-1 flex flex-col overflow-hidden bg-theme-app">
        {selectedTableMeta ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* WORKSPACE HEADER TOOLBAR */}
            <div className="px-6 py-4 border-b border-theme-border bg-theme-surface flex flex-wrap items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-theme-accent/15 border border-theme-accent/30 flex items-center justify-center text-theme-accent shrink-0 shadow-sm">
                  <Table2 size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold font-mono text-theme-primary">
                      {selectedTableMeta.name}
                    </h2>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                      {selectedTableMeta.rowCount} {selectedTableMeta.rowCount === 1 ? 'row' : 'rows'}
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-semibold">
                      {activeTableContent.columns.length} columns
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-semibold">
                      db: {currentDbName}
                    </span>
                  </div>
                </div>
              </div>

              {/* VIEW SWITCHER TABS */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-theme-elevated border border-theme-border text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveViewMode('data')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${activeViewMode === 'data'
                    ? 'bg-theme-surface text-theme-primary font-semibold shadow-sm border border-theme-border'
                    : 'text-theme-muted hover:text-theme-primary'
                  }`}>
                  <Table2 size={13} />
                  <span>Data Records</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveViewMode('schema')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${activeViewMode === 'schema'
                    ? 'bg-theme-surface text-theme-primary font-semibold shadow-sm border border-theme-border'
                    : 'text-theme-muted hover:text-theme-primary'
                  }`}>
                  <Code2 size={13} />
                  <span>Schema DDL</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveViewMode('structure')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${activeViewMode === 'structure'
                    ? 'bg-theme-surface text-theme-primary font-semibold shadow-sm border border-theme-border'
                    : 'text-theme-muted hover:text-theme-primary'
                  }`}>
                  <Layers size={13} />
                  <span>Structure</span>
                </button>
              </div>
            </div>

            {/* TAB 1: DATA RECORDS VIEW */}
            {activeViewMode === 'data' && (
              <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
                {/* Search within data rows */}
                <div className="flex items-center justify-between gap-3 shrink-0">
                  <div className="relative max-w-xs w-full">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
                    <input
                      type="text"
                      placeholder={`Filter in '${selectedTableMeta.name}'...`}
                      value={rowSearch}
                      onChange={(e) => setRowSearch(e.target.value)}
                      className="w-full bg-theme-surface border border-theme-border rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono text-theme-primary placeholder-theme-muted focus:outline-none focus:border-theme-accent shadow-sm"
                    />
                  </div>

                  <div className="text-[11px] font-mono text-theme-muted">
                    Showing {filteredRows.length} of {activeTableContent.values.length} rows
                  </div>
                </div>

                {/* Data Grid Table */}
                <div className="flex-1 border border-theme-border rounded-xl overflow-hidden bg-theme-surface shadow-sm flex flex-col">
                  {activeTableContent.columns.length > 0 ? (
                    <div className="overflow-auto flex-1">
                      <table className="w-full text-left font-mono text-xs border-collapse">
                        <thead className="bg-theme-elevated border-b border-theme-border text-theme-secondary sticky top-0 z-10">
                          <tr>
                            <th className="px-3.5 py-2.5 font-semibold text-[10px] uppercase tracking-wider text-theme-muted w-12 border-r border-theme-border/40">
                              #
                            </th>
                            {activeTableContent.columns.map((col, idx) => (
                              <th key={idx} className="px-4 py-2.5 font-semibold border-r border-theme-border/40 last:border-r-0">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className="border-b border-theme-border/40 hover:bg-theme-elevated/60 transition">
                              <td className="px-3.5 py-2 text-[10px] text-theme-muted font-mono border-r border-theme-border/40 bg-theme-elevated/20">
                                {rIdx + 1}
                              </td>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-4 py-2 text-theme-primary border-r border-theme-border/40 last:border-r-0">
                                  {cell === null ? (
                                    <span className="text-theme-muted/60 italic text-[11px] bg-theme-elevated px-1.5 py-0.5 rounded">null</span>
                                  ) : (
                                    String(cell)
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                          {filteredRows.length === 0 && (
                            <tr>
                              <td
                                colSpan={activeTableContent.columns.length + 1}
                                className="px-4 py-12 text-center text-theme-muted font-mono">
                                {rowSearch ? "No matching records found for your filter." : "This table is currently empty."}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 text-center text-xs font-mono text-theme-muted">
                      No column definitions found for table '{selectedTableMeta.name}'.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: SCHEMA DDL VIEW */}
            {activeViewMode === 'schema' && (
              <div className="flex-1 overflow-y-auto p-6 max-w-4xl w-full mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold font-mono text-theme-primary">
                      SQL Schema Definition
                    </h3>
                    <p className="text-xs text-theme-muted font-mono">
                      Raw DDL statement stored in sqlite_master.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyDdl}
                    className="px-3 py-1.5 rounded-lg border border-theme-border hover:bg-theme-elevated text-xs font-mono text-theme-secondary hover:text-theme-primary transition flex items-center gap-1.5">
                    {copiedDdl ? (
                      <>
                        <Check size={13} className="text-emerald-500" />
                        <span className="text-emerald-500 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy DDL</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-xl border border-theme-border overflow-hidden bg-[var(--code-bg)] shadow-sm">
                  <pre className="p-5 font-mono text-xs text-[var(--code-text)] overflow-x-auto leading-relaxed">
                    <code>{selectedTableMeta.sql};</code>
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 3: STRUCTURE VIEW (COLUMNS & KEYS) */}
            {activeViewMode === 'structure' && (
              <div className="flex-1 overflow-y-auto p-6 max-w-4xl w-full mx-auto space-y-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold font-mono text-theme-primary">
                    Table Columns & Key Constraints
                  </h3>
                  <p className="text-xs text-theme-muted font-mono">
                    Column metadata and schema constraints inspected via PRAGMA table_info.
                  </p>
                </div>

                <div className="border border-theme-border rounded-xl overflow-hidden bg-theme-surface shadow-sm">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead className="bg-theme-elevated border-b border-theme-border text-theme-secondary">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Column Name</th>
                        <th className="px-4 py-3 font-semibold">Type</th>
                        <th className="px-4 py-3 font-semibold">Primary Key</th>
                        <th className="px-4 py-3 font-semibold">Nullable</th>
                        <th className="px-4 py-3 font-semibold">Default</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTableStructure.map((col, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-theme-border/40 hover:bg-theme-elevated/40 transition">
                          <td className="px-4 py-2.5 font-bold text-theme-primary flex items-center gap-2">
                            {col.isPk && <Key size={12} className="text-amber-500 shrink-0" />}
                            <span>{col.name}</span>
                          </td>
                          <td className="px-4 py-2.5 text-theme-accent font-semibold">
                            {col.type}
                          </td>
                          <td className="px-4 py-2.5">
                            {col.isPk ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px] font-semibold">
                                PRIMARY KEY
                              </span>
                            ) : (
                              <span className="text-theme-muted text-[11px]">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            {col.notnull ? (
                              <span className="text-rose-400 font-semibold text-[11px]">NOT NULL</span>
                            ) : (
                              <span className="text-emerald-500 text-[11px]">NULLABLE</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-theme-muted text-[11px]">
                            {col.defaultValue !== null ? String(col.defaultValue) : "None"}
                          </td>
                        </tr>
                      ))}
                      {activeTableStructure.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-theme-muted">
                            No column structure information available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-xs font-mono text-theme-muted space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-theme-elevated border border-theme-border flex items-center justify-center text-theme-muted">
              <Table2 size={24} />
            </div>
            <p className="text-sm font-semibold text-theme-primary">No Table Selected</p>
            <p className="max-w-xs text-theme-muted">
              Select a table from the left explorer sidebar to view its records, inspect its DDL, or examine column constraints.
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal for deleting database */}
      <DeleteDbModal
        isOpen={Boolean(dbToDelete)}
        onClose={() => setDbToDelete(null)}
        onConfirm={onRemoveDatabase}
        dbName={dbToDelete}
      />
    </div>
  );
}
