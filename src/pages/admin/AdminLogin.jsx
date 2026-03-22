import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { signIn } from '@/services/authService';

// ---------------------------------------------------------------------------
// Rate limiting — protection contre la force brute côté client
// ---------------------------------------------------------------------------
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes en ms
const LS_KEY = 'admin_login_attempts';

const checkRateLimit = () => {
  try {
    const stored = localStorage.getItem(LS_KEY);
    const attempts = stored ? JSON.parse(stored) : { count: 0, lastAttempt: 0 };
    const now = Date.now();

    if (attempts.count >= MAX_ATTEMPTS && (now - attempts.lastAttempt) < LOCKOUT_DURATION) {
      const remaining = Math.ceil((LOCKOUT_DURATION - (now - attempts.lastAttempt)) / 60000);
      return { locked: true, remaining };
    }

    // Réinitialiser si la durée de blocage est expirée
    if ((now - attempts.lastAttempt) > LOCKOUT_DURATION) {
      localStorage.removeItem(LS_KEY);
    }

    return { locked: false, remaining: 0 };
  } catch {
    return { locked: false, remaining: 0 };
  }
};

const recordFailedAttempt = () => {
  try {
    const stored = localStorage.getItem(LS_KEY);
    const attempts = stored ? JSON.parse(stored) : { count: 0, lastAttempt: 0 };
    localStorage.setItem(LS_KEY, JSON.stringify({
      count: attempts.count + 1,
      lastAttempt: Date.now(),
    }));
  } catch {
    // Silencieux — ne pas bloquer l'UI si localStorage est indisponible
  }
};

const clearFailedAttempts = () => {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    // Silencieux
  }
};

// ---------------------------------------------------------------------------

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  // Vérifier le rate limit au montage et toutes les 30 secondes
  useEffect(() => {
    const updateLockout = () => {
      const { locked, remaining } = checkRateLimit();
      setLockoutRemaining(locked ? remaining : 0);
    };

    updateLockout();
    const interval = setInterval(updateLockout, 30000);
    return () => clearInterval(interval);
  }, []);

  const isDisabled = loading || isSubmitting || lockoutRemaining > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Vérification du rate limit avant toute tentative
    const { locked, remaining } = checkRateLimit();
    if (locked) {
      setLockoutRemaining(remaining);
      setError(`Trop de tentatives. Réessayez dans ${remaining} minute${remaining > 1 ? 's' : ''}.`);
      return;
    }

    setLoading(true);

    try {
      const { user, error: authError } = await signIn(email, password);

      if (authError) {
        recordFailedAttempt();

        // Vérifier si on vient d'atteindre la limite après cet échec
        const { locked: nowLocked, remaining: nowRemaining } = checkRateLimit();

        // Délai progressif : 1s après 3 tentatives, 5s après 5 tentatives
        const stored = localStorage.getItem(LS_KEY);
        const count = stored ? JSON.parse(stored).count : 0;

        if (nowLocked) {
          setLockoutRemaining(nowRemaining);
          setError(`Trop de tentatives. Réessayez dans ${nowRemaining} minute${nowRemaining > 1 ? 's' : ''}.`);
        } else {
          setError(authError);

          if (count >= MAX_ATTEMPTS) {
            // Déjà géré ci-dessus
          } else if (count >= 3) {
            const delay = count >= 5 ? 5000 : 1000;
            setIsSubmitting(true);
            setTimeout(() => setIsSubmitting(false), delay);
          }
        }
        return;
      }

      if (user) {
        clearFailedAttempts();
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial-gold opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-bronze/30 rounded-xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-gold tracking-widest">
              PHILIA
            </h1>
            <p className="text-gray-500 dark:text-white/60 text-sm mt-2">Administration</p>
          </div>

          {/* Message de verrouillage */}
          {lockoutRemaining > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <p className="text-orange-400 text-sm">
                Trop de tentatives. Réessayez dans {lockoutRemaining} minute{lockoutRemaining > 1 ? 's' : ''}.
              </p>
            </motion.div>
          )}

          {/* Error message */}
          {error && lockoutRemaining === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-gray-900 dark:text-white/80 text-sm mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold focus:ring-1 focus:ring-gold/50 outline-none transition-all"
                placeholder="admin@philiastore.sn"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-900 dark:text-white/80 text-sm mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-3 pr-12 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold focus:ring-1 focus:ring-gold/50 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isDisabled}
              className="w-full btn-gold-premium py-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || isSubmitting ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : lockoutRemaining > 0 ? (
                <span>Connexion bloquée ({lockoutRemaining} min)</span>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>

          {/* Back to store link */}
          <div className="mt-8 text-center">
            <a
              href="/"
              className="text-bronze hover:text-gold transition-colors text-sm"
            >
              ← Retour à la boutique
            </a>
          </div>
        </div>

        {/* Setup hint */}
        <p className="text-center text-gray-400 dark:text-white/30 text-xs mt-6">
          Première connexion ? Créez un compte admin dans Supabase Dashboard
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
