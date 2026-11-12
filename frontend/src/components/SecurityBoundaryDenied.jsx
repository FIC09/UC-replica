import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut, Lock, UserCheck } from 'lucide-react';

export default function SecurityBoundaryDenied({
  requiredRole = 'Restricted Dashboard',
  currentUser,
  onLogout,
  onReturn
}) {
  const userRole = (currentUser?.role || 'Customer').toUpperCase();
  const userName = currentUser?.name || currentUser?.email || 'Authenticated User';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-rose-500/30">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-inner">
            <ShieldAlert size={36} strokeWidth={2.2} />
          </div>
        </div>

        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3 tracking-wide uppercase">
            <Lock size={12} /> Access Restricted
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Role Security Boundary Enforced
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            You are attempting to access the <span className="text-rose-400 font-semibold">{requiredRole}</span>, but your active browser session is signed in with conflicting permissions.
          </p>
        </div>

        {/* Current Active Session Card */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 mb-6">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Active Browser Session
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200">{userName}</div>
                <div className="text-xs text-slate-400">{currentUser?.email || 'Registered Profile'}</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {userRole}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed mb-6">
          <strong>Security Notice:</strong> Single-session isolation is enabled to protect sensitive operational and customer data. Different roles cannot be concurrently operated across browser tabs in the same session.
        </div>

        <div className="space-y-3">
          <button
            onClick={onReturn}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.99]"
          >
            <ArrowLeft size={16} /> Return to Home
          </button>

          <button
            onClick={onLogout}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 text-slate-300 border border-slate-700 font-medium text-sm transition-all active:scale-[0.99]"
          >
            <LogOut size={16} /> Log Out & Switch Account
          </button>
        </div>
      </div>
    </div>
  );
}

