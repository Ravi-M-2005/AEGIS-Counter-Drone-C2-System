import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { aegisApi } from '../services/api';
import { tacticalAudio } from '../services/audio';
import {
  Shield,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Terminal,
  Eye,
  EyeOff,
  Loader2,
  Zap
} from 'lucide-react';

export const LoginPage = ({ onLoginSuccess }) => {
  const { loginUser, backendStatus } = useAegis();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Operator Username / ID is required');
      return;
    }
    if (!password.trim()) {
      setError('Security Clearance Passcode is required');
      return;
    }

    setLoading(true);
    tacticalAudio.playClick();

    // Call API (checks Spring Boot backend if available or falls back to demo authentication)
    const result = await aegisApi.login(username.trim(), password);

    setLoading(false);

    if (result.success) {
      const role = result.role || 'Administrator';
      const name = result.username === 'admin' 
        ? 'Wing Cdr. R. K. Singhania' 
        : result.username === 'officer_sharma' 
        ? 'Major Vikram Sharma' 
        : 'Flight Lt. Priya Nair';
      const clearance = (role === 'Administrator' || result.username === 'admin')
        ? 'LEVEL 5 - TOP SECRET'
        : (role === 'Security Officer' || result.username === 'officer_sharma')
        ? 'LEVEL 3 - SECRET'
        : 'LEVEL 2 - CONFIDENTIAL';

      const userPayload = {
        username: result.username,
        role: role,
        token: result.token,
        name: name,
        clearance: clearance,
        source: result.source
      };
      loginUser(userPayload);
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setError(result.error || 'Authentication rejected. Verify credentials.');
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
    tacticalAudio.playClick();
  };

  return (
    <div className="min-h-screen w-full bg-[#040812] flex items-center justify-center p-4 tactical-grid relative overflow-hidden select-none">
      {/* Background Military Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-[#08101e]/95 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.18)] p-8 backdrop-blur-xl">
        {/* Military Status Bar */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-cyan-900/40 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-300 font-bold">C2 TERMINAL ONLINE</span>
          </div>
          <div>
            {backendStatus.isOnline ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SPRING BOOT ACTIVE
              </span>
            ) : (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                STANDALONE SIMULATION MODE
              </span>
            )}
          </div>
        </div>

        {/* Brand Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-950/90 border border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.4)] mb-3">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-black tracking-widest text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]">
            AEGIS
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono tracking-wide">
            AI-Powered Counter-Drone Surveillance & Threat Management
          </p>
          <div className="inline-block mt-2 px-2.5 py-0.5 rounded bg-amber-950/70 border border-amber-500/50 text-[10px] font-mono font-bold text-amber-300">
            SIMULATION MODE – DEMO DATA
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mb-5 p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-300 font-mono space-y-1.5">
          <div className="font-bold flex items-center gap-1 text-cyan-400">
            <KeyRound className="w-3.5 h-3.5" />
            <span>AUTHENTICATED DEMO CREDENTIALS</span>
          </div>
          <div className="text-slate-300 grid grid-cols-1 gap-1 text-[10.5px]">
            <div>Admin: <code className="text-cyan-300 font-bold">admin</code> / <code className="text-cyan-300 font-bold">Admin@123</code></div>
            <div>Operator: <code className="text-cyan-300 font-bold">operator1</code> / <code className="text-cyan-300 font-bold">ChangeMe123!</code></div>
            <div>Officer: <code className="text-cyan-300 font-bold">officer_sharma</code> / <code className="text-cyan-300 font-bold">Admin@123</code></div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/80 border border-red-500/70 text-red-200 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
              Operator Username / ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#050c18] border border-cyan-900/60 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono placeholder:text-slate-600"
                placeholder="Enter operator username (e.g. admin)"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase mb-1">
              Security Clearance Passcode
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#050c18] border border-cyan-900/60 rounded-lg pl-9 pr-10 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono placeholder:text-slate-600"
                placeholder="Enter passcode"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-cyan-400 transition-colors p-0.5 rounded cursor-pointer"
                title={showPassword ? 'Hide passcode' : 'Show passcode'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-900 font-bold font-mono text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                <span>AUTHENTICATING SECURE HANDSHAKE...</span>
              </>
            ) : (
              <>
                <Terminal className="w-4 h-4" />
                <span>ENTER COMMAND CONSOLE</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-400">
          <div className="mb-2 text-slate-500 text-[10px] uppercase font-bold">1-Click Fill Demo Credentials:</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'Admin@123')}
              className="px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-left transition-colors cursor-pointer"
            >
              <div className="font-bold truncate">admin</div>
              <div className="text-[9px] text-slate-500 truncate">Admin L5</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('operator1', 'ChangeMe123!')}
              className="px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-left transition-colors cursor-pointer"
            >
              <div className="font-bold truncate">operator1</div>
              <div className="text-[9px] text-slate-500 truncate">Operator L2</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('officer_sharma', 'Admin@123')}
              className="px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-left transition-colors cursor-pointer"
            >
              <div className="font-bold truncate">officer_sharma</div>
              <div className="text-[9px] text-slate-500 truncate">Officer L3</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
