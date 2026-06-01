import { useState } from 'react'
import { registerUser, loginUser, resetPassword } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

type Mode = 'login' | 'register' | 'forgot'

/* ─── Decorative SVG arcs for the left panel ─────────────────── */
function DecorativeArcs() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 500 700"
      fill="none"
      preserveAspectRatio="xMaxYMid slice"
    >
      {/* Concentric arcs emanating from the right-center */}
      {[140, 210, 290, 370, 450, 530].map((r, i) => (
        <circle
          key={i}
          cx="500"
          cy="350"
          r={r}
          stroke="currentColor"
          strokeOpacity={0.09 - i * 0.012}
          strokeWidth="1.2"
          fill="none"
        />
      ))}
    </svg>
  )
}

/* ─── Left branding panel ─────────────────────────────────────── */
function LeftPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-[60%] flex-col justify-between p-8 bg-primary text-primary-foreground overflow-hidden select-none">
      <DecorativeArcs />

      {/* App name branding */}
      <div className="relative z-10">
        <span className="font-neuton text-lg font-bold text-primary-foreground tracking-wide">
          Finance Tracker
        </span>
      </div>

      {/* Headline + tagline */}
      <div className="relative z-10 space-y-5">
        <h1 className="text-3xl font-black font-neuton leading-[1.15] tracking-tight">
          Kelola<br />Keuangan<br />Kamu<br />dengan<br />Cerdas ✦
        </h1>
        <p className="text-primary-foreground/60 text-xs leading-relaxed max-w-[220px] font-sans">
          Catat pemasukan &amp; pengeluaran, pantau kondisi keuangan secara real-time dalam satu platform yang elegan.
        </p>
      </div>

      {/* Copyright */}
      <div className="relative z-10">
        <p className="text-primary-foreground/30 text-xs font-sans">
          © 2025 Finance Tracker. All rights reserved.
        </p>
      </div>
    </div>
  )
}

/* ─── Underline-style input component ────────────────────────── */
function UnderlineInput({
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
  disabled,
  minLength,
  autoComplete,
}: {
  id: string
  type?: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  disabled?: boolean
  minLength?: number
  autoComplete?: string
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      minLength={minLength}
      autoComplete={autoComplete}
      className={[
        'w-full bg-transparent border-0 border-b border-foreground/20',
        'py-2.5 px-0 text-sm text-foreground placeholder:text-muted-foreground/50',
        'outline-none focus:border-foreground transition-colors duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'font-sans',
      ].join(' ')}
    />
  )
}

/* ─── Main LoginPage ──────────────────────────────────────────── */
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const clearState = () => { setError(null); setMessage(null); setPassword(''); setConfirmPassword('') }

  const switchMode = (next: Mode) => { clearState(); setMode(next) }

  const translateError = (err: string) => {
    if (err.includes('User already registered')) return 'Email ini sudah terdaftar. Silakan login atau gunakan email lain.'
    if (err.includes('Invalid login credentials')) return 'Email atau password salah. Silakan coba lagi.'
    if (err.includes('Password should be at least 6 characters')) return 'Password minimal 6 karakter.'
    if (err.includes('Unable to validate email address: invalid format')) return 'Format email tidak valid.'
    if (err.includes('Email not confirmed')) return 'Email belum dikonfirmasi. Cek kotak masuk atau folder spam.'
    return err
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === 'register') {
        if (!fullName.trim()) { setError('Nama lengkap tidak boleh kosong.'); setLoading(false); return }
        if (password !== confirmPassword) { setError('Password dan konfirmasi password tidak cocok.'); setLoading(false); return }
        await registerUser(email, password, fullName)
        setMessage('Registrasi berhasil! Cek email kamu untuk konfirmasi.')
      } else if (mode === 'forgot') {
        if (!email.trim()) { setError('Masukkan alamat email kamu terlebih dahulu.'); setLoading(false); return }
        await resetPassword(email)
        setMessage('Link reset password telah dikirim ke email kamu. Periksa kotak masuk atau folder spam.')
      } else {
        await loginUser(email, password)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.'
      setError(translateError(msg))
    } finally {
      setLoading(false)
    }
  }

  /* ── Helpers ── */
  const headings: Record<Mode, string> = {
    login: 'Selamat Datang!',
    register: 'Buat Akun Baru',
    forgot: 'Lupa Password?',
  }

  const submitLabels: Record<Mode, string> = {
    login: 'Masuk',
    register: 'Daftar Sekarang',
    forgot: 'Kirim Link Reset',
  }

  const loadingLabels: Record<Mode, string> = {
    login: 'Masuk...',
    register: 'Mendaftarkan...',
    forgot: 'Mengirim...',
  }

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Left Panel ── */}
      <LeftPanel />

      {/* ── Right Panel ── */}
      <div className="flex flex-1 flex-col bg-background">

        {/* Top bar: mobile branding only */}
        <div className="flex items-center px-8 pt-8 pb-0 shrink-0 lg:hidden">
          <span className="font-neuton text-lg font-bold text-foreground">
            Finance <span className="italic font-medium text-primary/80">Tracker</span>
          </span>
        </div>

        {/* Main form area — vertically centered */}
        <div className="flex flex-1 items-center justify-center px-8 py-4">
          <div className="w-full max-w-sm space-y-5">

            {/* Heading */}
            <div className="space-y-1.5">
              <h2 className="text-xl font-black font-neuton text-foreground leading-tight">
                {headings[mode]}
              </h2>
              {/* Subtitle / switch link */}
              {mode === 'login' && (
                <p className="text-sm text-muted-foreground font-sans">
                  Belum punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="text-foreground underline underline-offset-2 hover:opacity-70 font-medium transition-opacity"
                  >
                    Daftar sekarang
                  </button>
                  , gratis!
                </p>
              )}
              {mode === 'register' && (
                <p className="text-sm text-muted-foreground font-sans">
                  Sudah punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-foreground underline underline-offset-2 hover:opacity-70 font-medium transition-opacity"
                  >
                    Masuk di sini
                  </button>
                </p>
              )}
              {mode === 'forgot' && (
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                  Masukkan email kamu dan kami akan mengirimkan link untuk membuat password baru.
                </p>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full name — register only */}
              {mode === 'register' && (
                <div className="space-y-1">
                  <label htmlFor="fullName" className="text-xs uppercase tracking-widest text-muted-foreground font-sans font-medium">
                    Nama Lengkap
                  </label>
                  <UnderlineInput
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>
              )}

              {/* Email — always shown */}
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground font-sans font-medium">
                  Email
                </label>
                <UnderlineInput
                  id="email"
                  type="email"
                  placeholder="anda@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              {/* Password — hidden in forgot mode */}
              {mode !== 'forgot' && (
                <div className="space-y-1">
                  <label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground font-sans font-medium">
                    Password
                  </label>
                  <UnderlineInput
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  />
                </div>
              )}

              {/* Confirm Password — register only */}
              {mode === 'register' && (
                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="text-xs uppercase tracking-widest text-muted-foreground font-sans font-medium">
                    Konfirmasi Password
                  </label>
                  <UnderlineInput
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    autoComplete="new-password"
                  />
                  {/* Real-time mismatch hint */}
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <p className="text-xs text-rose-400 font-sans pt-0.5">Password tidak cocok</p>
                  )}
                  {confirmPassword.length > 0 && password === confirmPassword && (
                    <p className="text-xs text-emerald-400 font-sans pt-0.5">Password cocok ✓</p>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-3">
                  <p className="text-sm text-rose-400 font-sans">{error}</p>
                </div>
              )}

              {/* Success */}
              {message && (
                <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3">
                  <p className="text-sm text-foreground font-sans">{message}</p>
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/85 active:bg-primary/75 font-semibold text-sm tracking-wide transition-all shadow-sm font-sans"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                    {loadingLabels[mode]}
                  </span>
                ) : (
                  submitLabels[mode]
                )}
              </Button>

              {/* Bottom links */}
              {mode === 'forgot' ? (
                /* Back to login */
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Kembali ke halaman masuk
                </button>
              ) : mode === 'login' ? (
                /* Forgot password */
                <p className="text-center text-sm text-muted-foreground font-sans">
                  Lupa password?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-foreground underline underline-offset-2 hover:opacity-70 font-medium transition-opacity"
                  >
                    Klik di sini
                  </button>
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
