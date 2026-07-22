import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Stethoscope, Eye, EyeOff, AlertCircle, Lock, Mail, User, IdCard } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [workId, setWorkId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signUp(email, password, workId, fullName)
    
    if (error) {
      let msg = error.message || 'Failed to sign up. Please try again.'
      if (msg === '{}' || msg === '[object Object]') {
        msg = 'Failed to create account. That Work ID or Email might already be taken.'
      }
      setError(msg)
    } else {
      setSuccess(true)
      // Usually, if email confirmation is required, the user stays on a "Check your email" screen.
      // If email confirmation is disabled, Supabase automatically logs them in, which our AuthProvider
      // will catch and redirect them to the dashboard via PublicRoute.
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-efm-bg-100 flex items-center justify-center relative overflow-hidden py-12">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-efm-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl" />
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

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-efm-primary-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-efm-primary-500/30">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Create an Account
          </h1>
          <p className="text-efm-text-500 text-sm mt-1">BMEU Ticketing System</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-7 shadow-2xl shadow-black/50 animate-slide-up">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-efm-text-900">Check your email</h2>
              <p className="text-sm text-efm-text-500">
                We sent a confirmation link to <strong>{email}</strong>. Please click the link to activate your account.
              </p>
              <p className="text-xs text-efm-text-400 mt-4">
                (Note: If your admin disabled email confirmation, you might already be logged in and redirected momentarily.)
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary w-full justify-center mt-6"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-400 text-sm animate-fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="label-field">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-efm-text-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Work ID */}
                <div>
                  <label htmlFor="workId" className="label-field">Work ID Number</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-efm-text-500">
                      <IdCard className="w-4 h-4" />
                    </span>
                    <input
                      id="workId"
                      type="text"
                      value={workId}
                      onChange={(e) => setWorkId(e.target.value)}
                      placeholder="e.g. 2024-001"
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

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
                      placeholder="Minimum 6 characters"
                      className="input-field pl-10 pr-11"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-efm-text-500 hover:text-efm-text-800 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !password || !fullName || !workId}
                  className="w-full mt-2 bg-gradient-to-r from-efm-primary-500 to-blue-600 hover:from-efm-primary-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-efm-primary-500/20 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </button>

                <div className="text-center mt-4 pt-4 border-t border-efm-bg-400/50">
                  <p className="text-sm text-efm-text-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-efm-primary-500 hover:text-efm-primary-400 font-semibold transition-colors">
                      Sign in instead
                    </Link>
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
