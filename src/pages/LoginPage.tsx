import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Stethoscope, Eye, EyeOff, AlertCircle, Lock, Mail } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      setError('Invalid email or password. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-efm-bg-100 flex items-center justify-center relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-efm-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-efm-primary-500/3 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-efm-primary-500 to-blue-600 rounded-2xl mb-5 shadow-lg shadow-efm-primary-500/30">
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-efm-text-900 tracking-tight">
            BMEU <span className="text-gradient">Ticketing</span>
          </h1>
          <p className="text-efm-text-500 text-sm mt-1">Zamboanga City Medical Center</p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-efm-primary-500/30" />
            <p className="text-[10px] text-efm-text-400 tracking-widest uppercase whitespace-nowrap">
              Biomedical Equipment Unit
            </p>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-efm-primary-500/30" />
          </div>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-7 shadow-2xl shadow-black/5 animate-slide-up">
          <h2 className="text-base font-semibold text-efm-text-800 mb-5">Sign in to your account</h2>

          {error && (
            <div className="mb-4 flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-400 text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="label-field">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-efm-text-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-field pl-10"
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label-field">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-efm-text-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-10 pr-11"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-efm-text-500 hover:text-efm-text-800 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading || !email || !password}
              className="w-full mt-1 bg-gradient-to-r from-efm-primary-500 to-blue-600 hover:from-efm-primary-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-efm-primary-500/20 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center mt-4">
              <p className="text-sm text-efm-text-500">
                Don't have an account?{' '}
                <Link to="/signup" className="text-efm-primary-500 hover:text-efm-primary-400 font-semibold transition-colors">
                  Sign up here
                </Link>
              </p>
            </div>
          </form>

          <p className="text-center text-xs text-efm-text-400 mt-5 pt-5 border-t border-efm-bg-400/50">
            Access restricted to authorized BMEU personnel only
          </p>
        </div>

        <p className="text-center text-xs text-efm-text-400 mt-5">
          ZCMC BMEU Ticketing System v1.0 &middot; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}