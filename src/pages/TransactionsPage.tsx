import { useState, useEffect, useCallback } from 'react'
import { getDailyCalendarData, type DayData, type Transaction } from '@/lib/transactions'
import AddTransactionModal from '@/components/AddTransactionModal'
import { Wallet, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react'
import { CategoryIcon } from '@/lib/categoryIcons'
import { formatRp, formatDate } from '@/lib/format'
import { TYPE_META, MONTH_NAMES } from '@/lib/constants'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function formatRpCompact(amount: number): string {
  if (amount === 0) return ''
  return new Intl.NumberFormat('id-ID').format(Math.abs(amount))
}

function padIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// ─── Calendar Grid ────────────────────────────────────────────────────────────

interface CalendarProps {
  year: number
  month: number
  dayData: Record<string, DayData>
  today: string
  onDayClick: (iso: string) => void
  selectedDay: string | null
}

function CalendarGrid({ year, month, dayData, today, onDayClick, selectedDay }: CalendarProps) {
  // Days in month, first weekday (0=Sun)
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const daysInMonth  = new Date(year, month, 0).getDate()
  const daysInPrev   = new Date(year, month - 1, 0).getDate()

  // Total cells = enough rows to fit the month, always 6 rows for stable height
  const totalCells = 42

  const cells: { day: number; iso: string; currentMonth: boolean }[] = []

  // Prev month tail
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const d = daysInPrev - i
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear  = month === 1 ? year - 1 : year
    cells.push({ day: d, iso: padIso(prevYear, prevMonth, d), currentMonth: false })
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, iso: padIso(year, month, d), currentMonth: true })
  }

  // Next month head
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear  = month === 12 ? year + 1 : year
  let nextDay = 1
  while (cells.length < totalCells) {
    cells.push({ day: nextDay, iso: padIso(nextYear, nextMonth, nextDay), currentMonth: false })
    nextDay++
  }



  return (
    <div className="grid grid-cols-7 gap-px bg-border/20 rounded-xl overflow-hidden shadow-sm border border-border/40">
      {/* Day headers */}
      {DAY_NAMES.map((d) => (
        <div
          key={d}
          className="bg-card/60 py-3 text-center text-[11px] uppercase font-bold tracking-wider text-foreground"
        >
          {d}
        </div>
      ))}

      {/* Day cells */}
      {cells.map((cell, idx) => {
        const data = cell.currentMonth ? dayData[cell.iso] : null
        const hasIncome  = data && data.income  > 0
        const hasExpense = data && data.expense > 0
        const isToday    = cell.iso === today
        const isSelected = cell.iso === selectedDay
        const colIdx     = idx % 7

        return (
          <button
            key={cell.iso + idx}
            onClick={() => cell.currentMonth && onDayClick(cell.iso)}
            className={`
              relative min-h-[72px] sm:min-h-[85px] flex flex-col items-start gap-1 p-1.5 sm:p-2 text-left transition-all duration-200
              ${cell.currentMonth
                ? `bg-card/30 hover:bg-accent/40 hover:shadow-md hover:scale-[1.02] hover:z-10 cursor-pointer`
                : 'bg-background/20 opacity-50 cursor-default'}
              ${isSelected ? 'ring-2 ring-inset ring-primary bg-primary/10 shadow-inner z-10' : ''}
              ${isToday ? 'ring-1 ring-inset ring-primary/30' : ''}
            `}
          >
            {/* Day number */}
            <span
              className={`
                flex-shrink-0 inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold
                ${isToday ? 'bg-primary text-primary-foreground shadow-sm' : ''}
                ${!isToday && cell.currentMonth
                  ? colIdx === 0 || colIdx === 6 ? 'text-foreground' : 'text-foreground/80'
                  : 'text-muted-foreground/40'}
              `}
            >
              {cell.day}
            </span>

            {/* Mobile: colored dots only */}
            {(hasIncome || hasExpense) && (
              <div className="mt-auto w-full">
                <div className="flex gap-0.5 justify-end sm:hidden">
                  {hasIncome  && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                  {hasExpense && <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />}
                </div>
                {/* Desktop: amounts */}
                <div className="hidden sm:flex flex-col gap-[2px]">
                  {hasIncome && (
                    <span className="font-neuton text-sm leading-none font-semibold text-emerald-400 truncate w-full text-right">
                      +{formatRpCompact(data!.income)}
                    </span>
                  )}
                  {hasExpense && (
                    <span className="font-neuton text-sm leading-none font-semibold text-rose-400 truncate w-full text-right">
                      -{formatRpCompact(data!.expense)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const now   = new Date()
  const todayIso = padIso(now.getFullYear(), now.getMonth() + 1, now.getDate())

  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const [dayData, setDayData]       = useState<Record<string, DayData>>({})
  const [loading, setLoading]       = useState(true)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDailyCalendarData(year, month)
      setDayData(data)
    } catch {
      // noop
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => { fetchData() }, [fetchData])

  // Refresh when a transaction is added from anywhere in the app (e.g., global FAB)
  useEffect(() => {
    const handler = () => fetchData()
    window.addEventListener('transactionAdded', handler)
    return () => window.removeEventListener('transactionAdded', handler)
  }, [fetchData])

  const navigate = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
    setSelectedDay(null)
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  // Monthly totals
  const monthlyIncome  = Object.values(dayData).reduce((s, d) => s + d.income,  0)
  const monthlyExpense = Object.values(dayData).reduce((s, d) => s + d.expense, 0)

  // Selected day info
  const selectedData = selectedDay ? dayData[selectedDay] : null

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 flex shrink-0 h-14 sm:h-16 items-center justify-between border-b border-border bg-background/80 px-4 sm:px-6 backdrop-blur-md animate-fade-in">
        <h1 className="font-neuton text-sm sm:text-[19px] font-bold tracking-wide text-foreground">Transaksi</h1>
        {/* Month navigation */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-border bg-card/50 text-foreground hover:bg-accent hover:text-foreground transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-24 sm:min-w-32 text-center text-xs sm:text-sm font-semibold transition-transform">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button
            onClick={() => navigate(1)}
            disabled={isCurrentMonth}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-border bg-card/50 text-foreground hover:bg-accent hover:text-foreground transition-all hover:scale-105 active:scale-95 shadow-sm disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
        {/* Monthly Summary Bar */}
        <div className="flex flex-col gap-1.5 sm:grid sm:grid-cols-3 sm:gap-6 stagger">
          <div className="animate-slide-up flex items-baseline justify-between gap-3 sm:block sm:py-4 sm:px-2">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground sm:mb-2">Pemasukan</p>
            {loading ? (
              <div className="h-6 sm:h-8 w-28 sm:w-32 animate-shimmer rounded bg-muted/50" />
            ) : (
              <p className="font-neuton text-base sm:text-3xl font-bold text-emerald-400">{formatRp(monthlyIncome)}</p>
            )}
          </div>

          <div className="animate-slide-up flex items-baseline justify-between gap-3 sm:block sm:py-4 sm:px-2">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground sm:mb-2">Pengeluaran</p>
            {loading ? (
              <div className="h-6 sm:h-8 w-28 sm:w-32 animate-shimmer rounded bg-muted/50" />
            ) : (
              <p className="font-neuton text-base sm:text-3xl font-bold text-rose-400">{formatRp(monthlyExpense)}</p>
            )}
          </div>

          <div className="animate-slide-up flex items-baseline justify-between gap-3 sm:block sm:py-4 sm:px-2">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground sm:mb-2">Selisih</p>
            {loading ? (
              <div className="h-6 sm:h-8 w-28 sm:w-32 animate-shimmer rounded bg-muted/50" />
            ) : (
              <p className={`font-neuton text-base sm:text-3xl font-bold ${
                monthlyIncome - monthlyExpense >= 0 ? 'text-blue-400' : 'text-orange-400'
              }`}>
                {monthlyIncome - monthlyExpense >= 0 ? '+' : ''}{formatRp(monthlyIncome - monthlyExpense)}
              </p>
            )}
          </div>
        </div>

        {/* Calendar */}
        {loading ? (
          <div className="h-[360px] sm:h-[500px] w-full animate-shimmer rounded-xl bg-muted/20 border border-border/40" />
        ) : (
          <div className="animate-slide-up">
            <CalendarGrid
              year={year}
              month={month}
              dayData={dayData}
              today={todayIso}
              onDayClick={setSelectedDay}
              selectedDay={selectedDay}
            />
          </div>
        )}

        {/* Selected Day Detail */}
        {selectedDay && (
          <div className="animate-slide-up mt-4 space-y-4 px-2">
            <p className="text-sm font-semibold text-primary pb-2">
              {new Date(selectedDay + 'T00:00:00').toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
            {selectedData && selectedData.transactions && selectedData.transactions.length > 0 ? (
              <div className="space-y-1 stagger">
                {selectedData.transactions.map((tx) => {
                  const meta = TYPE_META[tx.type]
                  const isExpense = tx.type === 'expense'
                  return (
                    <div
                      key={tx.id}
                      onClick={() => {
                        setEditingTransaction(tx)
                        setModalOpen(true)
                      }}
                      className="animate-slide-up group relative flex cursor-pointer items-center gap-3 py-2.5 px-3 -mx-3 rounded-xl transition-all duration-200 overflow-hidden hover:bg-accent/20"
                    >
                      {/* Icon */}
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${meta.bg}`}>
                        {tx.category?.icon
                          ? <CategoryIcon name={tx.category.icon} className="h-4 w-4" style={{ color: tx.category.color ?? undefined }} />
                          : tx.type === 'expense' ? <ArrowUpRight className="h-4 w-4 text-rose-400" />
                          : tx.type === 'income'  ? <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
                          : <ArrowLeftRight className="h-4 w-4 text-blue-400" />}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors leading-tight">
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
                      <p className={`flex-shrink-0 font-neuton text-sm font-semibold ${meta.color}`}>
                        {isExpense ? '−' : tx.type === 'income' ? '+' : ''}{formatRp(tx.amount)}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                  <Wallet className="h-6 w-6 opacity-80" />
                </div>
                <p className="text-sm font-medium text-foreground">Tidak ada transaksi</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Tidak ada pengeluaran atau pemasukan pada hari ini</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Transaction Modal */}
      <AddTransactionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingTransaction(null)
        }}
        onSuccess={() => {
          setModalOpen(false)
          setEditingTransaction(null)
          fetchData()
          window.dispatchEvent(new Event('transactionAdded'))
        }}
        initialData={editingTransaction}
      />
    </>
  )
}
