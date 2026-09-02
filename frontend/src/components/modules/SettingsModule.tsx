import React, { useState } from 'react';
import { Settings, Shield, Server, RefreshCw, Download, Upload, CheckCircle2, Sun, Moon } from 'lucide-react';
import { ERPConfig } from '../../types';
import { exportBackupJSON, readJSONFile } from '../../services/storageService';

interface SettingsModuleProps {
  config: ERPConfig;
  onUpdateConfig: (conf: ERPConfig) => void;
  onRefreshData: () => void;
  onExportBackup: () => void;
  onImportBackup: (data: any) => Promise<void> | void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  config,
  onUpdateConfig,
  onRefreshData,
  onExportBackup,
  onImportBackup
}) => {
  const [formData, setFormData] = useState({ ...config });
  const [savedNotice, setSavedNotice] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleExportJSON = () => {
    onExportBackup();
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    setImporting(true);
    try {
      const json = await readJSONFile(file);
      await onImportBackup(json);
      alert('Backup data imported successfully!');
    } catch (err) {
      setImportError('Failed to parse or import backup file.');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            <span>ERP System Configuration & Integrations</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Customize enterprise parameters, Python REST API targets, and database backups</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          {savedNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>ERP Settings successfully saved!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Organization / Enterprise Name</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  required
                  value={formData.currencySymbol}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Default GST / Tax Rate (%)</label>
                <input
                  type="number"
                  required
                  value={formData.defaultTaxRate}
                  onChange={(e) => setFormData({ ...formData, defaultTaxRate: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Low Stock Safety Buffer</label>
                <input
                  type="number"
                  required
                  value={formData.lowStockThresholdDefault}
                  onChange={(e) => setFormData({ ...formData, lowStockThresholdDefault: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>
            </div>

            {/* Python Backend API Target */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-sm text-slate-100">Python Backend Integration Target</h4>
              </div>
              <p className="text-xs text-slate-400">
                Connected to the Flask ERP REST API. Changing this and saving will point new requests
                at a different backend base URL (takes effect after reload).
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Python Backend Base Endpoint URL</label>
                <input
                  type="text"
                  value={formData.pythonBackendUrl}
                  onChange={(e) => setFormData({ ...formData, pythonBackendUrl: e.target.value })}
                  placeholder="http://localhost:5000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20"
              >
                Save ERP Preferences
              </button>
            </div>
          </form>
        </div>

        {/* Database Backup & Seed Controls */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-100 mb-1">Database Backup & Sync</h3>
            <p className="text-xs text-slate-400">Back up the live ERP database to a file, restore from a backup, or refresh from the server</p>
          </div>

          {importError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {importError}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleExportJSON}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-semibold text-xs flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Full Database JSON</span>
            </button>

            <label className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center space-x-2 cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>{importing ? 'Importing…' : 'Restore Database from File'}</span>
              <input type="file" accept=".json" onChange={handleImportJSON} disabled={importing} className="hidden" />
            </label>

            <button
              onClick={() => {
                onRefreshData();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Data from Server</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
