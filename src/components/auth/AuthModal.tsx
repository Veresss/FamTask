import React, { useState } from 'react';
import { AuthUser } from '../../types/auth.ts';
import { authService } from '../../services/authService.ts';
import { FamilyMember } from '../../types/notion.ts';
import {
  Mail,
  Lock,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Globe,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: AuthUser, isNewRegistration?: boolean) => void;
  members: FamilyMember[];
  onClose?: () => void;
  canDismiss?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onSuccess,
  members,
  onClose,
  canDismiss = false,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showGoogleAccountPicker, setShowGoogleAccountPicker] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  if (!isOpen) return null;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Kérlek add meg a teljes neved!');
        return;
      }
      if (password !== confirmPassword) {
        setError('A megadott két jelszó nem egyezik meg!');
        return;
      }
      const res = authService.registerWithEmail(email, password, name);
      if (!res.success || !res.user) {
        setError(res.error || 'A regisztráció sikertelen volt.');
        return;
      }
      onSuccess(res.user, true);
    } else {
      const res = authService.loginWithEmail(email, password);
      if (!res.success || !res.user) {
        setError(res.error || 'Hibás bejelentkezési adatok.');
        return;
      }
      onSuccess(res.user, false);
    }
  };

  const handleGoogleLogin = (options?: { email: string; name: string; memberId?: string }) => {
    setError(null);
    const res = authService.loginWithGoogle(options);
    onSuccess(res.user, !res.user.linkedMemberId);
  };

  const handleQuickDemoLogin = (member: FamilyMember) => {
    const isCsabi = member.id === 'mem-csabi';
    const email = `${member.name.toLowerCase()}@csalad.hu`;
    const res = authService.loginWithGoogle({
      email,
      name: member.name,
      memberId: member.id,
    });
    onSuccess(res.user, false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        {/* Header with App Branding */}
        <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-2xl shadow-inner border border-white/15">
              🏠
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">FamTask Családi Rendszer</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                {mode === 'login'
                  ? 'Jelentkezz be a családi munkamegosztás eléréséhez'
                  : 'Hozz létre új fiókot email címmel vagy Google-lel'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-white/10 p-1 rounded-xl mt-5 border border-white/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Bejelentkezés
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Új Regisztráció
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-800">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-in Button */}
          <div>
            <button
              type="button"
              onClick={() => setShowGoogleAccountPicker(!showGoogleAccountPicker)}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs font-semibold flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Folytatás Google fiókkal</span>
            </button>

            {/* Google Quick Account Picker Dropdown / Box */}
            {showGoogleAccountPicker && (
              <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Válassz Google fiókot:
                </div>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleGoogleLogin({
                        email: 'csabi.csalad@gmail.com',
                        name: 'Csabi (Admin)',
                        memberId: 'mem-csabi',
                      })
                    }
                    className="w-full p-2 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">🧑</span>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>Csabi</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-100 text-purple-800 font-bold">
                            Admin
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">csabi.csalad@gmail.com</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleGoogleLogin({
                        email: 'anyu.csalad@gmail.com',
                        name: 'Anyu',
                        memberId: 'mem-anyu',
                      })
                    }
                    className="w-full p-2 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">👩</span>
                      <div>
                        <div className="font-bold text-slate-900">Anyu</div>
                        <div className="text-[10px] text-slate-500">anyu.csalad@gmail.com</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleGoogleLogin({
                        email: 'botond.csalad@gmail.com',
                        name: 'Botond',
                        memberId: 'mem-botond',
                      })
                    }
                    className="w-full p-2 bg-white hover:bg-amber-50 border border-slate-200 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">👦</span>
                      <div>
                        <div className="font-bold text-slate-900">Botond</div>
                        <div className="text-[10px] text-slate-500">botond.csalad@gmail.com</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>

                {/* Custom Google Email input */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex gap-1.5">
                    <input
                      type="email"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="egyeb.google@gmail.com"
                      className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customGoogleEmail.trim()) {
                          handleGoogleLogin({
                            email: customGoogleEmail.trim(),
                            name: customGoogleEmail.split('@')[0],
                          });
                        }
                      }}
                      disabled={!customGoogleEmail.trim()}
                      className="px-2.5 py-1 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 disabled:opacity-40 cursor-pointer"
                    >
                      Belépés
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              vagy email fiókkal
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Neved / Megszólításod
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="pl. Csabi, Anyu, Botond..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email cím
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pl. csabi@csalad.hu"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jelszó
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jelszó megerősítése
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>{mode === 'login' ? 'Bejelentkezés' : 'Regisztráció és folytatás'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Test Accounts Box */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Gyors tesztelés (1-kattintásos belépés):</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {members.map((m) => {
                const isCsabi = m.id === 'mem-csabi';
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleQuickDemoLogin(m)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isCsabi
                        ? 'bg-purple-50 border-purple-300 text-purple-900 hover:bg-purple-100 font-bold ring-1 ring-purple-400/30'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{m.avatarEmoji || '👤'}</span>
                    <span>{m.name}</span>
                    {isCsabi && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-purple-200 text-purple-900 font-bold">
                        Admin
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        {canDismiss && onClose && (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
            >
              Ablak bezárása
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

