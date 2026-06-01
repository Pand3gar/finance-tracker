import { useEffect, useState, useCallback, useMemo } from 'react'
import { getTransactions, type Transaction } from '@/lib/transactions'
import AddTransactionModal from '@/components/AddTransactionModal'
import { Wallet, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react'
import { CategoryIcon } from '@/lib/categoryIcons'
import { formatRp, formatDate } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { TYPE_META } from '@/lib/constants'

const AUTHOR_PHOTOS: Record<string, string> = {
  "Warren Buffett": "/authors/warren_buffett.png",
  "Chris Rock": "/authors/chris_rock.png",
  "Will Rogers": "/authors/will_rogers.png",
  "Benjamin Franklin": "/authors/benjamin_franklin.png",
  "Robert Kiyosaki": "/authors/robert_kiyosaki.png",
  "Ayn Rand": "/authors/ayn_rand.png",
  "P.T. Barnum": "/authors/pt_barnum.png",
  "Zig Ziglar": "/authors/zig_ziglar.png",
  "John D. Rockefeller": "/authors/john_d_rockefeller.png",
  "Jim Rohn": "/authors/jim_rohn.png",
  "Henry David Thoreau": "/authors/henry_david_thoreau.png",
  "Jonathan Swift": "/authors/jonathan_swift.png",
  "Nathan W. Morris": "/authors/nathan_w_morris.png",
  "Naval Ravikant": "/authors/naval_ravikant.png",
  "C. Northcote Parkinson": "/authors/c_northcote_parkinson.png",
  "Kin Hubbard": "/authors/kin_hubbard.png",
  "Joe Biden": "/authors/joe_biden.png",
}

const FINANCIAL_QUOTES = [
  { text: "Jangan menabung apa yang tersisa setelah belanja, tapi belanjakan apa yang tersisa setelah menabung.", author: "Warren Buffett" },
  { text: "Kekayaan bukan tentang memiliki banyak uang, ini tentang memiliki banyak pilihan.", author: "Chris Rock" },
  { text: "Terlalu banyak orang menghabiskan uang yang belum mereka hasilkan, untuk membeli barang yang tidak mereka inginkan, untuk mengesankan orang yang tidak mereka sukai.", author: "Will Rogers" },
  { text: "Investasi dalam pengetahuan selalu memberikan bunga terbaik.", author: "Benjamin Franklin" },
  { text: "Kebebasan finansial tersedia bagi mereka yang mempelajarinya dan bekerja untuk itu.", author: "Robert Kiyosaki" },
  { text: "Uang hanyalah alat. Itu akan membawamu ke mana pun kamu mau, tetapi itu tidak akan menggantikanmu sebagai pengemudi.", author: "Ayn Rand" },
  { text: "Aturan No. 1: Jangan pernah kehilangan uang. Aturan No. 2: Jangan pernah lupakan Aturan No. 1.", author: "Warren Buffett" },
  { text: "Uang adalah tuan yang mengerikan, tetapi pelayan yang sangat baik.", author: "P.T. Barnum" },
  { text: "Jika kamu tidak menemukan cara untuk menghasilkan uang saat kamu tidur, kamu akan bekerja sampai kamu mati.", author: "Warren Buffett" },
  { text: "Orang kaya memiliki TV kecil dan perpustakaan besar, sedangkan orang miskin memiliki perpustakaan kecil dan TV besar.", author: "Zig Ziglar" },
  { text: "Jangan takut untuk melepaskan yang baik untuk mengejar yang hebat.", author: "John D. Rockefeller" },
  { text: "Seseorang duduk di tempat teduh hari ini karena seseorang menanam pohon di sana sudah lama sekali.", author: "Warren Buffett" },
  { text: "Bukan seberapa banyak uang yang kamu hasilkan, tapi seberapa banyak uang yang kamu simpan.", author: "Robert Kiyosaki" },
  { text: "Pendidikan formal akan membuatmu mencari nafkah; pendidikan mandiri akan membuatmu mendapatkan kekayaan.", author: "Jim Rohn" },
  { text: "Jangan berinvestasi pada apa pun yang tidak Anda pahami.", author: "Warren Buffett" },
  { text: "Kekayaan adalah kemampuan untuk sepenuhnya mengalami kehidupan.", author: "Henry David Thoreau" },
  { text: "Lebih baik Anda membeli perusahaan yang luar biasa dengan harga yang pantas, daripada perusahaan yang pantas dengan harga yang luar biasa.", author: "Warren Buffett" },
  { text: "Investasi sukses membutuhkan waktu, disiplin, dan kesabaran.", author: "Warren Buffett" },
  { text: "Orang bijak harus menyimpan uang di kepalanya, bukan di hatinya.", author: "Jonathan Swift" },
  { text: "Setiap kali Anda meminjam uang, Anda sedang merampok masa depan Anda sendiri.", author: "Nathan W. Morris" },
  { text: "Kekayaan adalah memiliki aset yang menghasilkan uang saat Anda tidur.", author: "Naval Ravikant" },
  { text: "Rahasia menuju kekayaan adalah menjadi takut ketika orang lain serakah, dan serakah ketika orang lain takut.", author: "Warren Buffett" },
  { text: "Jangan bekerja untuk uang; biarkan uang bekerja untuk Anda.", author: "Robert Kiyosaki" },
  { text: "Pengeluaran akan selalu naik untuk menyesuaikan dengan pendapatan Anda, kecuali jika Anda mencegahnya.", author: "C. Northcote Parkinson" },
  { text: "Cara termudah untuk melipatgandakan uang Anda adalah dengan melipatnya menjadi dua dan memasukkannya kembali ke saku Anda.", author: "Kin Hubbard" },
  { text: "Jangan beritahu saya apa yang Anda hargai, tunjukkan pada saya anggaran Anda, dan saya akan memberitahu Anda apa yang Anda hargai.", author: "Joe Biden" },
]

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

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx)
    setModalOpen(true)
  }

  const randomQuote = useMemo(() => FINANCIAL_QUOTES[Math.floor(Math.random() * FINANCIAL_QUOTES.length)], [])

  useEffect(() => {
    const handler = () => fetchTransactions()
    window.addEventListener('transactionAdded', handler)
    return () => window.removeEventListener('transactionAdded', handler)
  }, [fetchTransactions])

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 flex shrink-0 h-10 items-center justify-between border-b border-border bg-background/80 px-4 sm:px-6 backdrop-blur-md animate-fade-in">
        <h1 className="font-neuton text-base sm:text-xl font-bold tracking-wide text-foreground">Dashboard</h1>
      </header>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">

        {/* Quote Section */}
        <div className="animate-slide-up px-1 sm:px-2 pb-3 sm:pb-4 pt-2">
          {/* Top line with opening quotes */}
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <span className="text-[44px] sm:text-[70px] font-black font-neuton text-primary leading-[0] translate-y-2 sm:translate-y-3">
              “
            </span>
            <div className="border-t-[1px] border-primary flex-1 opacity-70" />
          </div>

          {/* Quote Text */}
          <p className="font-neuton font-medium text-foreground/90 leading-relaxed text-base sm:text-lg md:text-xl px-1">
            {randomQuote.text}
          </p>

          {/* Bottom line with author and closing quotes */}
          <div className="flex items-center gap-3 sm:gap-4 mt-5 sm:mt-8">
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden bg-primary/10">
                {AUTHOR_PHOTOS[randomQuote.author] ? (
                  <img
                    src={AUTHOR_PHOTOS[randomQuote.author]}
                    alt={randomQuote.author}
                    className="h-full w-full object-cover object-top"
                    onError={(e) => {
                      const target = e.currentTarget
                      target.style.display = 'none'
                      const fallback = target.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                ) : null}
                <span
                  className="font-neuton font-bold text-lg sm:text-xl text-primary"
                  style={{ display: AUTHOR_PHOTOS[randomQuote.author] ? 'none' : 'flex' }}
                >
                  {randomQuote.author.charAt(0)}
                </span>
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-neuton text-sm sm:text-base font-bold text-foreground">— {randomQuote.author}</p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Financial Wisdom</p>
              </div>
            </div>
            <div className="border-t-[1px] border-primary flex-1 opacity-70" />
            <span className="text-[44px] sm:text-[70px] font-black font-neuton text-primary leading-[0] translate-y-2 sm:translate-y-3 shrink-0">
              ”
            </span>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="animate-slide-up mt-2 sm:mt-4">
          <div className="flex flex-row items-center justify-between pb-2 sm:pb-4 px-2">
            <h2 className="font-neuton text-sm sm:text-base font-semibold">Transaksi Terbaru</h2>
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
                      className="animate-slide-up group relative flex cursor-pointer items-center gap-3 py-2.5 px-3 -mx-3 rounded-xl transition-all duration-200 overflow-hidden hover:bg-accent/20"
                    >
                      {/* Icon */}
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${meta.bg}`}>
                        {tx.category?.icon
                          ? <CategoryIcon name={tx.category.icon} className="h-4 w-4" style={{ color: tx.category.color ?? undefined }} />
                          : tx.type === 'expense' ? <ArrowUpRight className="h-4 w-4 text-rose-400" />
                            : tx.type === 'income' ? <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
                              : <ArrowLeftRight className="h-4 w-4 text-blue-400" />}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-neuton truncate text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors leading-tight">
                          {tx.type === 'transfer'
                            ? `${tx.account?.name ?? '?'} → ${tx.to_account?.name ?? '?'}`
                            : tx.category?.name ?? meta.label}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-muted-foreground">{tx.account?.name}</span>
                          <span className="text-muted-foreground/40 text-[11px]">·</span>
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">{formatDate(tx.date)}</span>
                          {tx.note && (
                            <>
                              <span className="text-muted-foreground/40 text-[11px]">·</span>
                              <span className="truncate text-[11px] text-muted-foreground italic">{tx.note}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <p className={`font-neuton flex-shrink-0 text-sm font-semibold ${meta.color}`}>
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
        onSuccess={fetchTransactions}
        initialData={editingTransaction}
      />
    </>
  )
}
