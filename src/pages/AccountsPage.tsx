import { useEffect, useState, useCallback } from 'react'
import { getAccounts, type Account } from '@/lib/transactions'
import AddAccountModal from '@/components/AddAccountModal'
import { Coins, Smartphone, Landmark, Wallet, Plus } from 'lucide-react'
import { formatRp } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAccounts()
      setAccounts(data)
    } catch {
      // Handle error implicitly
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const handleEdit = (acc: Account) => {
    setEditingAccount(acc)
    setModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingAccount(null)
    setModalOpen(true)
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0)

  return (
    <>
      <header className="sticky top-0 z-10 flex shrink-0 h-14 sm:h-16 items-center justify-between border-b border-border bg-background/80 px-4 sm:px-6 backdrop-blur-md animate-fade-in">
        <h1 className="font-playfair text-sm sm:text-[19px] font-bold tracking-wide text-foreground">Akun</h1>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          Tambah
        </button>
      </header>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
        {/* Total Balance Summary */}
        <div className="animate-slide-up py-2 sm:py-4 px-2">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Saldo Semua Akun</p>
          {loading ? (
            <Skeleton className="h-7 sm:h-8 w-40 sm:w-48" />
          ) : (
            <p className="font-playfair text-2xl sm:text-3xl font-bold text-primary">
              {totalBalance >= 0 ? '' : '−'}{formatRp(Math.abs(totalBalance))}
            </p>
          )}
        </div>

        {/* Accounts List */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-slide-up rounded-2xl bg-muted/20" style={{ aspectRatio: '1.586/1' }}>
                <div className="p-5 flex flex-col justify-between h-full">
                  <div className="flex items-start justify-between">
                    <Skeleton className="h-7 w-9 rounded" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                  </div>
                  <div className="flex gap-4">
                    {[0, 1, 2, 3].map(j => <Skeleton key={j} className="h-2 w-8 rounded-full" />)}
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
              </div>
            ))
          ) : accounts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-muted-foreground flex flex-col items-center justify-center animate-fade-in">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 relative">
                <Wallet className="h-10 w-10 opacity-80" />
                <div className="absolute inset-0 rounded-full ring-2 ring-primary/20 animate-ping" style={{ animationDuration: '3s' }} />
              </div>
              <p className="text-sm font-medium text-foreground">Belum ada akun</p>
              <p className="mt-1 text-xs text-muted-foreground">Silakan tambahkan akun rekening atau dompet baru</p>
            </div>
          ) : (
            accounts.map((acc) => {
              const isCash = acc.type === 'cash'
              const isEWallet = acc.type === 'e-wallet'
              const isPositive = Number(acc.balance) >= 0

              let gradientBg = 'bg-gradient-to-br from-[#1a1a3e] via-[#2d1b69] to-[#4c1d95]'
              let chipColor = 'text-amber-300'
              let Icon = Landmark

              if (isCash) {
                gradientBg = 'bg-gradient-to-br from-[#0f3d2e] via-[#1a5c3a] to-[#2d8a5e]'
                chipColor = 'text-amber-200'
                Icon = Coins
              } else if (isEWallet) {
                gradientBg = 'bg-gradient-to-br from-[#0c2d48] via-[#1a4a6e] to-[#2980b9]'
                chipColor = 'text-amber-200'
                Icon = Smartphone
              }

              return (
                <div
                  key={acc.id}
                  className={`animate-slide-up group relative overflow-hidden rounded-2xl ${gradientBg} cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 hover:scale-[1.02]`}
                  style={{ aspectRatio: '1.586/1' }}
                  onClick={() => handleEdit(acc)}
                >
                  {/* Background pattern overlay */}
                  <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                  }} />

                  {/* Top subtle shine */}
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-2xl" />

                  <div className="relative z-10 flex flex-col justify-between h-full p-4 sm:p-5">
                    {/* Top row: Chip + Type icon */}
                    <div className="flex items-start justify-between">
                      {/* Card Chip */}
                      <div className={`${chipColor}`}>
                        <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="0.5" y="0.5" width="35" height="27" rx="4" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeOpacity="0.4" />
                          <line x1="0" y1="10" x2="36" y2="10" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.5" />
                          <line x1="0" y1="18" x2="36" y2="18" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.5" />
                          <line x1="12" y1="0" x2="12" y2="28" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.5" />
                          <line x1="24" y1="0" x2="24" y2="28" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.5" />
                        </svg>
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-transform group-hover:scale-110">
                        <Icon className="h-4 w-4 text-white/80" />
                      </div>
                    </div>

                    {/* Card number dots */}
                    <div className="flex items-center gap-4 my-auto">
                      <div className="flex gap-1.5">
                        {[0, 1, 2, 3].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/40" />)}
                      </div>
                      <div className="flex gap-1.5">
                        {[0, 1, 2, 3].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/40" />)}
                      </div>
                      <div className="flex gap-1.5">
                        {[0, 1, 2, 3].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/40" />)}
                      </div>
                      <div className="flex gap-1.5">
                        {[0, 1, 2, 3].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/40" />)}
                      </div>
                    </div>

                    {/* Bottom row: Name + Balance */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">Card Holder</p>
                        <h3 className="text-sm font-semibold text-white/90 tracking-wide">{acc.name}</h3>
                        <p className="text-[10px] text-white/40 capitalize mt-0.5">{acc.type === 'e-wallet' ? 'E-Wallet' : acc.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">Saldo</p>
                        <p className={`font-playfair text-lg font-bold ${isPositive ? 'text-emerald-300' : 'text-rose-300'}`}>
                          {isPositive ? '' : '−'}{formatRp(Math.abs(Number(acc.balance)))}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Hover edit indicator removed */}
                </div>
              )
            })
          )}
        </div>
      </div>

<AddAccountModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingAccount(null)
        }}
        onSuccess={fetchAccounts}
        initialData={editingAccount}
      />
    </>
  )
}
