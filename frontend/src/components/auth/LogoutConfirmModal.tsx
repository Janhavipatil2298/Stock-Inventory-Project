import React from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Decorative Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mt-1 mb-4">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Confirm Log Out</h3>
            <p className="text-xs text-slate-400">End your current working session</p>
          </div>
        </div>

        {/* Content */}
        <div className="py-2 text-sm text-slate-300 space-y-2">
          <p>
            Are you sure you want to log out{userName ? `, ${userName}` : ''}?
          </p>
          <p className="text-xs text-slate-400 bg-slate-800/50 p-3 rounded-xl border border-slate-800 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Your local changes and session state will be safely saved in your browser storage.</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
