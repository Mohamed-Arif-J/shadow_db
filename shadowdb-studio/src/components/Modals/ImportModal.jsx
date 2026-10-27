import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ImportModal({
  isOpen,
  onClose,
  onImport
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dbNameInput, setDbNameInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['sqlite', 'db', 'sql'].includes(ext)) {
      setErrorMsg('Please select a valid .sqlite, .db, or .sql database file.');
      return;
    }
    setErrorMsg(null);
    setSelectedFile(file);
    const defaultName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_]/g, '');
    setDbNameInput(defaultName || 'imported_db');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleLoadSample = async (samplePath, displayName) => {
    try {
      setErrorMsg(null);
      const res = await fetch(samplePath);
      if (!res.ok) throw new Error("Failed to fetch sample database");
      const blob = await res.blob();
      const file = new File([blob], displayName, { type: "application/x-sqlite3" });
      handleFileChange(file);
    } catch (err) {
      setErrorMsg("Failed to load sample database: " + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    const finalDbName = dbNameInput.trim().replace(/[^a-zA-Z0-9_]/g, '') || 'imported_db';
    onImport(selectedFile, finalDbName);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#1f293d] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Upload size={16} className="text-theme-accent" />
            <span>Import Database</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${isDragging
              ? 'border-theme-accent bg-theme-accent/10'
              : selectedFile
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-slate-300 dark:border-slate-700 hover:border-theme-accent/60 bg-slate-50 dark:bg-slate-900/50'
            }`}>
            <input
              type="file"
              id="import-file-input"
              ref={fileInputRef}
              onChange={(e) => handleFileChange(e.target.files[0])}
              accept=".sqlite,.db,.sql"
              className="hidden"
            />

            {selectedFile ? (
              <>
                <CheckCircle2 size={24} className="text-emerald-500" />
                <div className="text-xs font-mono font-semibold text-slate-900 dark:text-white">
                  {selectedFile.name}
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Click to change
                </div>
              </>
            ) : (
              <>
                <Upload size={24} className="text-theme-accent opacity-80" />
                <div className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                  Click to browse or drag & drop file
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Supports .sqlite, .db binary, and .sql dump scripts
                </div>
              </>
            )}
          </div>

          {!selectedFile && (
            <div className="flex items-center justify-between px-1 text-[11px] font-mono text-slate-500">
              <span>Need test data?</span>
              <button
                type="button"
                id="btn-load-sample-db"
                onClick={() => handleLoadSample('/test_inventory.sqlite', 'test_inventory.sqlite')}
                className="text-theme-accent hover:underline font-semibold flex items-center gap-1 transition">
                Load test_inventory.sqlite
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs font-mono flex items-center gap-1.5">
              <AlertCircle size={13} />
              <span>{errorMsg}</span>
            </div>
          )}

          {selectedFile && (
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-slate-600 dark:text-slate-400">Database Name in Studio</label>
              <input
                type="text"
                value={dbNameInput}
                onChange={(e) => setDbNameInput(e.target.value)}
                placeholder="e.g. inventory_system"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-theme-accent"
              />
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono rounded-lg transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile}
              className="px-4 py-2 bg-theme-accent text-black font-mono font-semibold text-xs rounded-lg hover:brightness-110 disabled:opacity-50 transition shadow-sm">
              Import Database
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
