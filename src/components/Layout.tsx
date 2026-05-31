import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

import AddTransactionModal from '@/components/AddTransactionModal'
import { LayoutDashboard, History, Landmark, PieChart, Settings, LogOut, Plus, ChevronsUpDown, Sun, Moon } from 'lucide-react'

export default function Layout() {
  const location = useLocation()
  const [modalOpen, setModalOpen] = useState(false)
  const [userInitial, setUserInitial] = useState('U')
  const [userEmail, setUserEmail] = useState('User')
  const [showLogoutMenu, setShowLogoutMenu] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.remove('light')
    } else {
      root.classList.add('light')
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const name = data.user.user_metadata?.full_name || data.user.email || 'User'
        setUserEmail(data.user.email || 'user@example.com')
        setUserInitial(name.charAt(0).toUpperCase())
      }
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const navItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <History className="h-5 w-5" />, label: 'Transaksi', path: '/transactions' },
    { icon: <Landmark className="h-5 w-5" />, label: 'Akun', path: '/accounts' },
    { icon: <PieChart className="h-5 w-5" />, label: 'Laporan', path: '/reports' },
  ]

  const handleTransactionSuccess = () => {
    window.dispatchEvent(new Event('transactionAdded'))
  }

  const showFab = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/transactions')

  return (
    <div className="flex h-screen overflow-hidden bg-background relative">


      {/* Desktop Sidebar */}
      <aside className="hidden w-56 flex-shrink-0 border-r border-border bg-sidebar-background/80 backdrop-blur-xl lg:flex lg:flex-col h-full overflow-y-auto relative z-20">
        <div className="flex shrink-0 h-16 items-center px-6 relative">
          <span className="font-playfair text-[19px] font-bold tracking-wide text-foreground">
            Finance <span className="text-primary italic font-medium">Tracker</span>
          </span>
          <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-6">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 overflow-hidden ${
                  isActive
                    ? 'text-primary font-medium'
                    : 'text-sidebar-foreground/70 hover:bg-white/5 hover:backdrop-blur-sm hover:text-sidebar-foreground hover:translate-x-1'
                }`}
              >
                <div className={`transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                  {item.icon}
                </div>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-sidebar-border p-4 relative">
          {showLogoutMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
              <div className="bg-card border border-border rounded-xl shadow-lg p-1.5 flex flex-col">
                {/* Theme toggle */}
                <div className="flex items-center justify-between px-3 py-2.5 mb-0.5">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    {isDark ? 'Dark' : 'Light'}
                  </div>
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                      isDark ? 'bg-primary/80' : 'bg-amber-400'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                        isDark ? 'translate-x-1' : 'translate-x-[18px]'
                      }`}
                    />
                  </button>
                </div>
                <div className="h-px bg-border -mx-1.5 mb-1" />
                <Link
                  to="/settings"
                  onClick={() => setShowLogoutMenu(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors w-full text-left mb-0.5"
                >
                  <Settings className="h-4 w-4" />
                  Pengaturan
                </Link>
                <div className="h-px bg-border my-1 -mx-1.5" />
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors w-full text-left mt-0.5"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowLogoutMenu(!showLogoutMenu)}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-colors text-left relative group ${showLogoutMenu ? 'bg-accent/50' : 'hover:bg-accent/30'}`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
              {userInitial}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-foreground truncate">Logged in</span>
              <span className="text-[10px] text-muted-foreground truncate">{userEmail}</span>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground ml-auto opacity-50 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-y-auto h-full relative z-10 pb-20 lg:pb-0">
        <Outlet />
        
        {/* Floating Add Transaction Button (Desktop only here, Mobile has it in bottom nav) */}
        {showFab && (
          <button
            onClick={() => setModalOpen(true)}
            className="hidden lg:flex fixed bottom-8 right-8 z-50 h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:bg-primary/90 active:scale-95 group"
            title="Tambah Transaksi"
          >
            <Plus className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
          </button>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-border/50 px-2 py-2 pb-safe flex justify-around items-center">
        {navItems.slice(0, 2).map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          return (
            <Link key={item.label} to={item.path} className={`flex-1 flex flex-col items-center py-2 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
              {item.icon}
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              {isActive && <div className="h-1 w-1 rounded-full bg-primary mt-0.5" />}
            </Link>
          )
        })}

        {/* Mobile FAB Center */}
        <div className="relative -top-6 flex-shrink-0">
          <button
            onClick={() => setModalOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 active:scale-95 group"
          >
            <Plus className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
          </button>
        </div>

        {navItems.slice(2, 4).map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          return (
            <Link key={item.label} to={item.path} className={`flex-1 flex flex-col items-center py-2 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
              {item.icon}
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              {isActive && <div className="h-1 w-1 rounded-full bg-primary mt-0.5" />}
            </Link>
          )
        })}
      </div>

      {/* Global Add Transaction Modal */}
      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  )
}
