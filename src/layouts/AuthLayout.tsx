import React from 'react';
import { Outlet } from 'react-router-dom';
import { ShieldCheck, Lock, Terminal, Activity } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#070b14] py-12 px-4 sm:px-6 lg:px-8 text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-950/50">
            <ShieldCheck className="h-7 w-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-xl font-bold tracking-wider text-slate-100 uppercase font-mono">
          SentinelDesk
        </h2>
        <p className="mt-1 text-center text-xs font-mono text-slate-400 tracking-wide">
          SOC Monitoring &amp; Incident Response Platform
        </p>

        {/* Security badges */}
        <div className="mt-3 flex items-center justify-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-cyan-400" /> AES-256 Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-emerald-400" /> Tier 1-3 Dispatch
          </span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="rounded-2xl border border-slate-800/90 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-md">
          <Outlet />
        </div>

        <div className="mt-6 text-center text-[11px] text-slate-400 font-mono">
          <span>SentinelDesk Cyber Defense Console • Internal Access Only</span>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
