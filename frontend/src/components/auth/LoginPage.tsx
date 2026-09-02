import React, { useState } from 'react';
import { Building2, Lock, Mail, ShieldAlert, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { UserRole, User } from '../../types';
import { login } from '../../services/api';
import { ApiError } from '../../services/apiClient';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onGoToRegister: () => void;
  onOpenForgotPassword: () => void;
}

// Seeded demo accounts (see backend/seed.py) — the quick-role picker just
// prefills these credentials so reviewers can sign in without knowing them.
const DEMO_CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  super_admin: { email: 'alexander.vance@inventorypro.ai', password: 'Passw0rd!' },
  admin: { email: 'admin@inventorypro.ai', password: 'Passw0rd!' },
  employee: { email: 'employee@inventorypro.ai', password: 'Passw0rd!' },
};

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onGoToRegister,
  onOpenForgotPassword
}) => {
  const [email, setEmail] = useState(DEMO_CREDENTIALS.super_admin.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.super_admin.password);
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(DEMO_CREDENTIALS[role].email);
    setPassword(DEMO_CREDENTIALS[role].password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email address and password');
      return;
    }
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-500/20 mb-3">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            InventoryPro AI
          </h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Inventory & Stock Management System</p>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Quick Demo Role Picker */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2 flex items-center justify-between">
              <span>Select Enterprise Role</span>
              <span className="text-cyan-400 font-semibold flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Quick Preset</span>
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('super_admin')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                  selectedRole === 'super_admin'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                  selectedRole === 'admin'
                    ? 'bg-blue-500/15 border-blue-500 text-blue-300 shadow-sm'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('employee')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                  selectedRole === 'employee'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Employee
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={onOpenForgotPassword}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-lg shadow-cyan-600/25 flex items-center justify-center space-x-2 transition-all mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In…</span>
                </>
              ) : (
                <>
                  <span>Sign In to ERP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Toggle */}
          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Don't have an organization account?{' '}
            <button
              onClick={onGoToRegister}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              Register Company
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
