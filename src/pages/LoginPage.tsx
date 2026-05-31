import { useState } from 'react'
import { registerUser, loginUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const translateError = (err: string) => {
    if (err.includes('User already registered')) {
      return 'Email ini sudah terdaftar. Silakan login atau gunakan email lain.'
    }
    if (err.includes('Invalid login credentials')) {
      return 'Email atau password salah. Silakan coba lagi.'
    }
    if (err.includes('Password should be at least 6 characters')) {
      return 'Password minimal 6 karakter.'
    }
    if (err.includes('Unable to validate email address: invalid format')) {
      return 'Format email tidak valid.'
    }
    return err
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isSignUp) {
        // Basic validation
        if (!fullName.trim()) {
          setError('Nama lengkap tidak boleh kosong.')
          setLoading(false)
          return
        }

        await registerUser(email, password, fullName)
        setMessage('Registrasi berhasil! Cek email kamu untuk konfirmasi.')
      } else {
        await loginUser(email, password)
        // Login success will be handled by App.tsx (onAuthStateChange)
      }
    } catch (err: any) {
      setError(translateError(err.message || 'Terjadi kesalahan sistem.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Subtle dot pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      
      {/* Animated floating background shapes */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-20 left-[20%] h-96 w-96 rounded-full bg-primary/15 blur-[100px] animate-float" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[10%] right-[10%] h-80 w-80 rounded-full bg-indigo-500/15 blur-[100px] animate-float" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        <div className="absolute top-[30%] right-[20%] h-64 w-64 rounded-full bg-violet-500/10 blur-[80px] animate-float" style={{ animationDuration: '7s', animationDelay: '2s' }} />
        <div className="absolute bottom-[20%] left-[10%] h-72 w-72 rounded-full bg-cyan-500/10 blur-[90px] animate-float" style={{ animationDuration: '9s', animationDelay: '0.5s' }} />
      </div>

      <Card className="w-full max-w-md glass-card animate-slide-up relative z-10 overflow-hidden border-border/40">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-indigo-500 to-violet-500" />
        <CardHeader className="space-y-1 text-center pt-8">
          <div className="mb-2">
            <span className="font-playfair text-[22px] font-bold tracking-wide text-foreground">
              Finance <span className="text-primary italic font-medium">Tracker</span>
            </span>
          </div>

          <CardTitle className="text-2xl font-bold tracking-tight">
            {isSignUp ? 'Buat Akun Baru' : 'Selamat Datang'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="anda@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-rose-400">
                {error}
              </p>
            )}

            {message && (
              <p className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
                {message}
              </p>
            )}

            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-indigo-500 hover:from-primary/90 hover:to-indigo-500/90 shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
                  {isSignUp ? 'Mendaftarkan...' : 'Masuk...'}
                </span>
              ) : (
                isSignUp ? 'Daftar Sekarang' : 'Masuk'
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null) }}
                className="font-medium text-primary hover:underline"
              >
                {isSignUp ? 'Masuk' : 'Daftar'}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
