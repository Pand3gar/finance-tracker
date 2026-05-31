import { useEffect, useState, useCallback, useMemo } from 'react'
import { getTransactions, type Transaction } from '@/lib/transactions'
import { Card } from '@/components/ui/card'
import AddTransactionModal from '@/components/AddTransactionModal'
import { Wallet, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRp(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const TYPE_META = {
  expense: { label: 'Pengeluaran', color: 'text-rose-400', bg: 'bg-rose-400/10', emoji: '📤', bar: 'bg-rose-500' },
  income: { label: 'Pemasukan', color: 'text-emerald-400', bg: 'bg-emerald-400/10', emoji: '📥', bar: 'bg-emerald-500' },
  transfer: { label: 'Transfer', color: 'text-blue-400', bg: 'bg-blue-400/10', emoji: '🔁', bar: 'bg-blue-500' },
}

const FINANCIAL_QUOTES = [
  { text: "Jangan menabung apa yang tersisa setelah belanja, tapi belanjakan apa yang tersisa setelah menabung.", author: "Warren Buffett" },
  { text: "Kekayaan bukan tentang memiliki banyak uang, ini tentang memiliki banyak pilihan.", author: "Chris Rock" },
  { text: "Terlalu banyak orang menghabiskan uang yang belum mereka hasilkan, untuk membeli barang yang tidak mereka inginkan, untuk mengesankan orang yang tidak mereka sukai.", author: "Will Rogers" },
  { text: "Investasi dalam pengetahuan selalu memberikan bunga terbaik.", author: "Benjamin Franklin" },
  { text: "Kebebasan finansial tersedia bagi mereka yang mempelajarinya dan bekerja untuk itu.", author: "Robert Kiyosaki" },
  { text: "Uang hanyalah alat. Itu akan membawamu ke mana pun kamu mau, tetapi itu tidak akan menggantikanmu sebagai pengemudi.", author: "Ayn Rand" },
]

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-shimmer rounded-md bg-muted/50 ${className}`} />
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTx, setLoadingTx] = useState(true)

  const fetchTransactions = useCallback(async () => {
    setLoadingTx(true)
    try { setTransactions(await getTransactions(15)) } catch { /* noop */ }
    finally { setLoadingTx(false) }
  }, [])

  const refresh = useCallback(() => {
    fetchTransactions()
  }, [fetchTransactions])

  useEffect(() => { refresh() }, [refresh])

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx)
    setModalOpen(true)
  }

  const randomQuote = useMemo(() => FINANCIAL_QUOTES[Math.floor(Math.random() * FINANCIAL_QUOTES.length)], [])

  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener('transactionAdded', handler)
    return () => window.removeEventListener('transactionAdded', handler)
  }, [refresh])

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 flex shrink-0 h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md animate-fade-in">
        <div>
          <h1 className="font-playfair text-[19px] font-bold tracking-wide text-foreground">Dashboard</h1>
        </div>
      </header>

      <div className="p-6 space-y-6 animate-fade-in">
        

        {/* Quote Section */}
        <Card className="glass-card animate-slide-up relative overflow-hidden flex flex-col justify-center p-6 min-h-[100px] border-l-4 border-l-primary/60">
          <div className="absolute right-[-5%] top-[-20%] text-[120px] font-playfair font-black text-primary/5 pointer-events-none leading-none">
            "
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-30 pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <p className="font-playfair font-medium italic text-foreground/90 leading-relaxed text-base md:text-lg">
              "{randomQuote.text}"
            </p>
            <p className="font-playfair text-sm font-semibold text-primary">— {randomQuote.author}</p>
          </div>
        </Card>

        {/* Recent Transactions */}
        <div className="animate-slide-up mt-4">
          <div className="flex flex-row items-center justify-between pb-4 px-2">
            <h2 className="text-base font-semibold">Transaksi Terbaru</h2>
            <Link to="/transactions" className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-2">
            {loadingTx ? (
              <div className="space-y-4 stagger">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-slide-up">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  <Wallet className="h-8 w-8 opacity-80" />
                </div>
                <p className="text-sm font-medium text-foreground">Belum ada transaksi</p>
                <p className="mt-1 text-xs text-muted-foreground">Klik tombol "+" untuk memulai pencatatan keuangan Anda</p>
              </div>
            ) : (
              <div className="space-y-1 stagger">
                {transactions.map((tx) => {
                  const meta = TYPE_META[tx.type]
                  const isExpense = tx.type === 'expense'
                  return (
                    <div
                      key={tx.id}
                      onClick={() => handleEditTransaction(tx)}
                      className="animate-slide-up group relative flex cursor-pointer items-center gap-4 py-3 px-3 -mx-3 rounded-xl transition-all duration-200 hover:bg-accent/40 hover:shadow-sm hover:scale-[1.005] overflow-hidden"
                    >
                      {/* Left color bar indicator removed as requested */}
                      
                      {/* Icon */}
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg ${meta.bg}`}>
                        {tx.category?.icon ?? meta.emoji}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                            {tx.type === 'transfer'
                              ? `${tx.account?.name ?? '?'} → ${tx.to_account?.name ?? '?'}`
                              : tx.category?.name ?? meta.label}
                          </p>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground font-medium bg-background px-1.5 py-0.5 rounded shadow-sm border border-border/50">EDIT</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{tx.account?.name}</span>
                          <span className="text-muted-foreground/40">·</span>
                          <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
                          {tx.note && (
                            <>
                              <span className="text-muted-foreground/40">·</span>
                              <span className="truncate text-xs text-muted-foreground italic">{tx.note}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <p className={`font-playfair flex-shrink-0 text-sm font-bold ${meta.color}`}>
                        {isExpense ? '−' : tx.type === 'income' ? '+' : ''}{formatRp(tx.amount)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AddTransactionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingTransaction(null)
        }}
        onSuccess={refresh}
        initialData={editingTransaction}
      />
    </>
  )
}
