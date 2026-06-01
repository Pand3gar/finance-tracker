import { useEffect, useState, useCallback } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import {
  getCategoryBreakdown,
  getIncomeExpenseHistory,
  type CategoryBreakdownItem,
  type BarChartDataPoint,
  type WealthRange,
} from '@/lib/transactions'
import { CategoryIcon } from '@/lib/categoryIcons'
import { formatRp } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import { MONTH_NAMES } from '@/lib/constants'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRpShort(amount: number) {
  if (Math.abs(amount) >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`
  if (Math.abs(amount) >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`
  if (Math.abs(amount) >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}rb`
  return `Rp ${amount}`
}

const FALLBACK_COLORS = [
  '#7C3AED', '#2563EB', '#059669', '#D97706', '#DC2626',
  '#9333EA', '#0891B2', '#16A34A', '#CA8A04', '#DB2777',
]

function getColor(item: CategoryBreakdownItem, index: number): string {
  if (item.categoryColor && item.categoryColor.startsWith('#')) return item.categoryColor
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

// ─── Pie Tooltip ──────────────────────────────────────────────────────────────

interface PieTooltipPayload { payload: CategoryBreakdownItem & { fill: string } }

function PieTooltip({ active, payload }: { active?: boolean; payload?: PieTooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="rounded-xl border border-border/60 bg-popover px-4 py-3 shadow-xl text-sm">
      <div className="flex items-center gap-2 font-semibold mb-1">
        <CategoryIcon name={item.categoryIcon} className="h-4 w-4" style={{ color: item.categoryColor ?? undefined }} />
        <span>{item.categoryName}</span>
      </div>
      <p className="text-muted-foreground">{formatRp(item.total)}</p>
      <p className="text-xs text-muted-foreground">{item.percentage}% dari total</p>
    </div>
  )
}

// ─── Bar Tooltip ──────────────────────────────────────────────────────────────

interface BarTooltipEntry { name: string; value: number; color: string }

function BarTooltip({ active, payload, label }: {
  active?: boolean
  payload?: BarTooltipEntry[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const income = payload.find(p => p.name === 'Pendapatan')?.value ?? 0
  const expense = payload.find(p => p.name === 'Pengeluaran')?.value ?? 0
  const net = income - expense
  return (
    <div className="rounded-xl border border-border/60 bg-popover px-4 py-3 shadow-xl text-sm min-w-40">
      <p className="text-xs text-muted-foreground mb-2 font-medium">{label}</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-muted-foreground">Pendapatan</span>
          </div>
          <span className="text-xs font-semibold text-emerald-400">{formatRp(income)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-rose-400" />
            <span className="text-xs text-muted-foreground">Pengeluaran</span>
          </div>
          <span className="text-xs font-semibold text-rose-400">{formatRp(expense)}</span>
        </div>
        <div className="border-t border-border/40 pt-1.5 flex items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">Selisih</span>
          <span className={`text-xs font-bold ${net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {net >= 0 ? '+' : ''}{formatRp(net)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Category Legend ──────────────────────────────────────────────────────────

function CategoryLegend({ data, colors }: { data: CategoryBreakdownItem[]; colors: string[] }) {
  if (!data.length) return null
  return (
    <div className="mt-4 space-y-3 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
      {data.map((item, i) => (
        <div key={item.categoryId} className="group relative overflow-hidden rounded-lg p-2 transition-colors hover:bg-accent/30">
          {/* Subtle background progress bar */}
          <div
            className="absolute left-0 top-0 bottom-0 opacity-10 transition-all duration-500"
            style={{ width: `${item.percentage}%`, backgroundColor: colors[i] }}
          />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <CategoryIcon name={item.categoryIcon} className="h-3 w-3 flex-shrink-0" style={{ color: colors[i] }} />
              <span className="text-xs truncate text-foreground/90 font-medium group-hover:text-foreground transition-colors">{item.categoryName}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] font-medium text-muted-foreground w-8 text-right">{item.percentage}%</span>
              <span className="text-xs font-semibold font-playfair">{formatRp(item.total)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Donut Section ────────────────────────────────────────────────────────────

function DonutSection({ title, emoji, data, total, loading, accentColor, year, month, onChange }: {
  title: string; emoji: string; data: CategoryBreakdownItem[]
  total: number; loading: boolean; accentColor: string
  year: number; month: number; onChange: (year: number, month: number) => void
}) {
  const colors = data.map(getColor)
  return (
    <div className="flex flex-col relative group">
      <div className="pb-2 flex flex-row items-center justify-between gap-2 space-y-0 relative z-10">
        <h2 className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground/90 group-hover:text-foreground transition-colors min-w-0">
          {emoji && (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg text-lg bg-background/50 shadow-sm border border-border/40 flex-shrink-0">
              {emoji}
            </span>
          )}
          <span className="truncate">{title}</span>
        </h2>
        <div className="scale-[0.8] sm:scale-90 origin-right flex-shrink-0">
          <MonthPicker year={year} month={month} onChange={onChange} />
        </div>
      </div>
      <div className="flex flex-col flex-1 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <Skeleton className="h-64 w-64 rounded-full" />
            <div className="w-full space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}</div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
            <span className="text-4xl opacity-30">{emoji}</span>
            <p className="text-sm text-muted-foreground">Tidak ada data untuk bulan ini</p>
          </div>
        ) : (
          <>
            <div className="relative h-60 sm:h-72 my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius="70%" outerRadius="95%"
                    paddingAngle={2} dataKey="total" strokeWidth={0} animationBegin={0} animationDuration={600}>
                    {data.map((entry, index) => (
                      <Cell key={entry.categoryId} fill={colors[index]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs text-muted-foreground">{data.length} kategori</p>
                <p className="font-playfair text-sm font-bold" style={{ color: accentColor }}>{formatRp(total)}</p>
              </div>
            </div>
            <CategoryLegend data={data} colors={colors} />
          </>
        )}
      </div>
    </div>
  )
}

// ─── Income/Expense Bar Chart ──────────────────────────────────────────────────

const RANGE_OPTIONS: { value: WealthRange; label: string }[] = [
  { value: '7D', label: '7 Hari' },
  { value: '3M', label: '3 Bulan' },
  { value: '1Y', label: '1 Tahun' },
]

function IncomeExpenseChart() {
  const [range, setRange] = useState<WealthRange>('7D')
  const [data, setData] = useState<BarChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const pts = await getIncomeExpenseHistory(range)
      setData(pts)
    } catch {
      // noop
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => { fetchData() }, [fetchData])

  // Refresh when a transaction is added from anywhere in the app
  useEffect(() => {
    const handler = () => fetchData()
    window.addEventListener('transactionAdded', handler)
    return () => window.removeEventListener('transactionAdded', handler)
  }, [fetchData])

  const totalIncome = data.reduce((s, d) => s + d.income, 0)
  const totalExpense = data.reduce((s, d) => s + d.expense, 0)
  const netBalance = totalIncome - totalExpense

  // Determine bar width dynamically — fewer bars = wider bars
  const barSize = data.length <= 7 ? 28 : data.length <= 15 ? 18 : data.length <= 30 ? 10 : 6

  return (
    <div className="animate-slide-up relative group">

      <div className="pb-4 relative z-10 space-y-4 sm:space-y-6">
        <h2 className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground/90 group-hover:text-foreground transition-colors">
          Arus Kas
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Summary stats */}
          <div>
            {loading ? (
              <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-4"><Skeleton className="h-10 w-full sm:w-32" /><Skeleton className="h-10 w-full sm:w-32" /><Skeleton className="h-10 w-full sm:w-32" /></div>
            ) : (
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-baseline justify-between gap-3 sm:block">
                  <p className="text-xs sm:text-xs text-muted-foreground sm:mb-1">Pendapatan</p>
                  <p className="font-playfair text-base sm:text-xl font-bold text-emerald-400">{formatRp(totalIncome)}</p>
                </div>
                <div className="hidden sm:block w-px h-10 bg-gradient-to-b from-transparent via-border to-transparent" />
                <div className="flex items-baseline justify-between gap-3 sm:block">
                  <p className="text-xs sm:text-xs text-muted-foreground sm:mb-1">Pengeluaran</p>
                  <p className="font-playfair text-base sm:text-xl font-bold text-rose-400">{formatRp(totalExpense)}</p>
                </div>
                <div className="hidden sm:block w-px h-10 bg-gradient-to-b from-transparent via-border to-transparent" />
                <div className="flex items-baseline justify-between gap-3 sm:block">
                  <p className="text-xs sm:text-xs text-muted-foreground sm:mb-1">Selisih</p>
                  <div className="flex items-center gap-1.5">
                    <p className={`font-playfair text-base sm:text-xl font-bold ${netBalance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                      {netBalance >= 0 ? '+' : ''}{formatRp(netBalance)}
                    </p>
                    {netBalance !== 0 && (
                      <span className={`hidden sm:inline text-[10px] ${netBalance > 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                        {netBalance > 0 ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Range filter pills */}
          <div className="flex items-center gap-1 rounded-xl border border-border/40 bg-black/20 p-1 backdrop-blur-sm shadow-inner self-start sm:self-auto">
            {RANGE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`flex-1 sm:flex-none rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 ${range === opt.value
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6">
        {loading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center gap-2">
            <span className="text-4xl opacity-30">📊</span>
            <p className="text-sm text-muted-foreground">Belum ada transaksi dalam periode ini</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={formatRpShort}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={72}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar
                  name="Pendapatan"
                  dataKey="income"
                  fill="#4ade80"
                  radius={[4, 4, 0, 0]}
                  barSize={barSize}
                  fillOpacity={0.9}
                />
                <Bar
                  name="Pengeluaran"
                  dataKey="expense"
                  fill="#f87171"
                  radius={[4, 4, 0, 0]}
                  barSize={barSize}
                  fillOpacity={0.9}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Month Picker ──────────────────────────────────────────────────────────────

function MonthPicker({ year, month, onChange }: {
  year: number; month: number; onChange: (year: number, month: number) => void
}) {
  const now = new Date()
  const go = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1)
    onChange(d.getFullYear(), d.getMonth() + 1)
  }
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => go(-1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card/40 text-muted-foreground hover:bg-accent hover:text-foreground transition-all hover:scale-105 shadow-sm">‹</button>
      <span className="min-w-28 text-center text-sm font-semibold">{MONTH_NAMES[month - 1]} {year}</span>
      <button onClick={() => go(1)} disabled={isCurrentMonth}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card/40 text-muted-foreground hover:bg-accent hover:text-foreground transition-all hover:scale-105 shadow-sm disabled:pointer-events-none disabled:opacity-30">›</button>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const now = new Date()
  const [expenseYear, setExpenseYear] = useState(now.getFullYear())
  const [expenseMonth, setExpenseMonth] = useState(now.getMonth() + 1)

  const [incomeYear, setIncomeYear] = useState(now.getFullYear())
  const [incomeMonth, setIncomeMonth] = useState(now.getMonth() + 1)

  const [expenseData, setExpenseData] = useState<CategoryBreakdownItem[]>([])
  const [incomeData, setIncomeData] = useState<CategoryBreakdownItem[]>([])
  const [loadingExpense, setLoadingExpense] = useState(true)
  const [loadingIncome, setLoadingIncome] = useState(true)

  const fetchExpense = useCallback(async () => {
    setLoadingExpense(true)
    try {
      const data = await getCategoryBreakdown('expense', expenseYear, expenseMonth)
      setExpenseData(data)
    } catch {
      // noop
    } finally {
      setLoadingExpense(false)
    }
  }, [expenseYear, expenseMonth])

  const fetchIncome = useCallback(async () => {
    setLoadingIncome(true)
    try {
      const data = await getCategoryBreakdown('income', incomeYear, incomeMonth)
      setIncomeData(data)
    } catch {
      // noop
    } finally {
      setLoadingIncome(false)
    }
  }, [incomeYear, incomeMonth])

  useEffect(() => { fetchExpense() }, [fetchExpense])
  useEffect(() => { fetchIncome() }, [fetchIncome])

  // Refresh when a transaction is added from anywhere in the app
  useEffect(() => {
    const handler = () => { fetchExpense(); fetchIncome() }
    window.addEventListener('transactionAdded', handler)
    return () => window.removeEventListener('transactionAdded', handler)
  }, [fetchExpense, fetchIncome])

  const totalExpense = expenseData.reduce((s, i) => s + i.total, 0)
  const totalIncome = incomeData.reduce((s, i) => s + i.total, 0)

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-20 flex shrink-0 h-14 sm:h-16 items-center justify-between border-b border-border bg-background/80 px-4 sm:px-6 backdrop-blur-md animate-fade-in">
        <h1 className="font-playfair text-sm sm:text-[19px] font-bold tracking-wide text-foreground">Laporan</h1>
      </header>

      <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
        {/* Income vs Expense bar chart — has its own range filter */}
        <div className="stagger">
          <IncomeExpenseChart />
        </div>

        {/* Donut charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 stagger">
          <DonutSection
            title="Pengeluaran per Kategori"
            emoji=""
            data={expenseData}
            total={totalExpense}
            loading={loadingExpense}
            accentColor="#f87171"
            year={expenseYear}
            month={expenseMonth}
            onChange={(y, m) => { setExpenseYear(y); setExpenseMonth(m) }}
          />
          <DonutSection
            title="Pemasukan per Kategori"
            emoji=""
            data={incomeData}
            total={totalIncome}
            loading={loadingIncome}
            accentColor="#4ade80"
            year={incomeYear}
            month={incomeMonth}
            onChange={(y, m) => { setIncomeYear(y); setIncomeMonth(m) }}
          />
        </div>
      </div>
    </>
  )
}
