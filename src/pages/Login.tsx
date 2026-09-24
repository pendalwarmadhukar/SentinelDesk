import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('alex.vance@sentineldesk.internal');
  const [password, setPassword] = useState('SentinelSecure#2026');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Authentication failed. Verify SOC analyst credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('SentinelSecure#2026');
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-base font-bold text-white uppercase font-mono tracking-wider">
          Analyst Authentication
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Provide your enterprise security badge credentials
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
            Analyst Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="analyst@sentineldesk.internal"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-cyan-500/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
              Security Token / Password
            </label>
            <span className="text-[10px] font-mono text-cyan-400 hover:underline cursor-pointer">
              Hardware Key?
            </span>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-cyan-500/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 py-2.5 px-4 text-xs font-semibold text-white tracking-wide shadow-md shadow-cyan-950/50 transition-colors disabled:opacity-50 mt-2 cursor-pointer"
        >
          {isSubmitting ? (
            'Validating Credentials...'
          ) : (
            <>
              Sign In to SOC Console <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick credential fills for rapid demonstration */}
      <div className="mt-6 border-t border-slate-800/80 pt-4">
        <p className="text-[11px] font-mono text-slate-500 mb-2">QUICK DEMO CREDENTIALS:</p>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickLogin('alex.vance@sentineldesk.internal')}
            className="text-left text-xs font-mono text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 rounded px-2 py-1 border border-slate-800/60 transition-colors flex items-center justify-between"
          >
            <span>alex.vance@sentineldesk.internal</span>
            <span className="text-[10px] text-cyan-400">Tier 2 Lead</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('sarah.c@sentineldesk.internal')}
            className="text-left text-xs font-mono text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 rounded px-2 py-1 border border-slate-800/60 transition-colors flex items-center justify-between"
          >
            <span>sarah.c@sentineldesk.internal</span>
            <span className="text-[10px] text-purple-400">Incident Responder</span>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-400">
        New analyst onboarding?{' '}
        <Link to="/register" className="font-semibold text-cyan-400 hover:underline">
          Register SOC Access
        </Link>
      </div>
    </div>
  );
};

export default Login;
