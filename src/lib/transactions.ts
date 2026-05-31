import { supabase } from './supabase'

// ─── Local date helper (avoids UTC timezone shift) ────────────────────────────
// Using .toISOString() converts to UTC which can shift the date for UTC+ zones.
// This helper formats dates using the browser's local timezone instead.
function localDate(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransactionType = 'expense' | 'income' | 'transfer'

export interface Account {
  id: string
  name: string
  type: string
  balance: number
  currency: string
}

export interface Category {
  id: string
  name: string
  type: string
  icon: string
  color: string
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  date: string
  note: string | null
  account: { id: string; name: string } | null
  to_account: { id: string; name: string } | null
  category: { id: string; name: string; icon: string; color: string } | null
}

export interface AddTransactionPayload {
  type: TransactionType
  amount: number
  account_id: string
  to_account_id?: string | null
  category_id?: string | null
  date: string
  note?: string
}

export interface MonthlySummary {
  income: number
  expense: number
  balance: number
  savingsRate: number
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

export async function getAccounts(): Promise<Account[]> {
  const { data, error } = await supabase
    .from('accounts')
    .select('id, name, type, balance, currency')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function addAccount(name: string, type: string = 'general'): Promise<Account> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('accounts')
    .insert({ user_id: user.id, name, type })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAccount(id: string, name: string, type: string): Promise<void> {
  const { error } = await supabase
    .from('accounts')
    .update({ name, type })
    .eq('id', id)

  if (error) throw error
}

export async function deleteAccount(id: string): Promise<void> {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(type?: 'expense' | 'income'): Promise<Category[]> {
  let query = supabase
    .from('categories')
    .select('id, name, type, icon, color')
    .order('name', { ascending: true })

  if (type) {
    query = query.or(`type.eq.${type},type.eq.both`)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function getTransactions(limit = 20): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id, type, amount, date, note,
      account:account_id ( id, name ),
      to_account:to_account_id ( id, name ),
      category:category_id ( id, name, icon, color )
    `)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as unknown as Transaction[]
}

export async function addTransaction(payload: AddTransactionPayload): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      type: payload.type,
      amount: payload.amount,
      account_id: payload.account_id,
      to_account_id: payload.to_account_id ?? null,
      category_id: payload.category_id ?? null,
      date: payload.date,
      note: payload.note ?? null,
    })

  if (error) throw error
}

export async function updateTransaction(id: string, payload: AddTransactionPayload): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .update({
      type: payload.type,
      amount: payload.amount,
      account_id: payload.account_id,
      to_account_id: payload.to_account_id ?? null,
      category_id: payload.category_id ?? null,
      date: payload.date,
      note: payload.note ?? null,
    })
    .eq('id', id)

  if (error) throw error
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─── Monthly Summary ───────────────────────────────────────────────────────────

export async function getMonthlySummary(): Promise<MonthlySummary> {
  const now = new Date()
  const firstDay = localDate(new Date(now.getFullYear(), now.getMonth(), 1))
  const lastDay  = localDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))

  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .gte('date', firstDay)
    .lte('date', lastDay)

  if (error) throw error

  const rows = data ?? []
  const income = rows.filter(r => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0)
  const expense = rows.filter(r => r.type === 'expense').reduce((s, r) => s + Number(r.amount), 0)
  const balance = income - expense
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0

  return { income, expense, balance, savingsRate }
}

// ─── Category Breakdown ────────────────────────────────────────────────────────

export interface CategoryBreakdownItem {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  total: number
  percentage: number
}

export async function getCategoryBreakdown(
  type: 'expense' | 'income',
  year: number,
  month: number // 1-indexed
): Promise<CategoryBreakdownItem[]> {
  const firstDay = localDate(new Date(year, month - 1, 1))
  const lastDay  = localDate(new Date(year, month, 0))

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      amount,
      category:category_id ( id, name, icon, color )
    `)
    .eq('type', type)
    .gte('date', firstDay)
    .lte('date', lastDay)
    .not('category_id', 'is', null)

  if (error) throw error

  const rows = (data ?? []) as unknown as {
    amount: number
    category: { id: string; name: string; icon: string; color: string } | null
  }[]

  const grouped: Record<string, { name: string; icon: string; color: string; total: number }> = {}
  for (const row of rows) {
    if (!row.category) continue
    const key = row.category.id
    if (!grouped[key]) {
      grouped[key] = { name: row.category.name, icon: row.category.icon, color: row.category.color, total: 0 }
    }
    grouped[key].total += Number(row.amount)
  }

  const grandTotal = Object.values(grouped).reduce((s, g) => s + g.total, 0)

  return Object.entries(grouped)
    .map(([id, g]) => ({
      categoryId: id,
      categoryName: g.name,
      categoryIcon: g.icon,
      categoryColor: g.color,
      total: g.total,
      percentage: grandTotal > 0 ? Math.round((g.total / grandTotal) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

// ─── Income/Expense Bar Chart History ─────────────────────────────────────────

export interface BarChartDataPoint {
  label: string
  isoDate: string
  income: number
  expense: number
}

export type WealthRange = '7D' | '3M' | '1Y'

export async function getIncomeExpenseHistory(range: WealthRange): Promise<BarChartDataPoint[]> {
  const now = new Date()

  let windowStart: Date
  switch (range) {
    case '7D':  windowStart = new Date(now); windowStart.setDate(now.getDate() - 6); break
    case '3M':  windowStart = new Date(now); windowStart.setMonth(now.getMonth() - 2, 1); break
    case '1Y':  windowStart = new Date(now); windowStart.setFullYear(now.getFullYear() - 1, now.getMonth(), 1); break
    default:    windowStart = new Date('2000-01-01')
  }
  windowStart.setHours(0, 0, 0, 0)

  const startIso = localDate(windowStart)

  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount, date')
    .in('type', ['income', 'expense'])
    .gte('date', startIso)
    .order('date', { ascending: true })

  if (error) throw error

  const rows = (data ?? []) as { type: string; amount: number; date: string }[]



  if (rows.length === 0) return []

  const byDate: Record<string, { income: number; expense: number }> = {}
  for (const row of rows) {
    if (!byDate[row.date]) byDate[row.date] = { income: 0, expense: 0 }
    if (row.type === 'income') byDate[row.date].income += Number(row.amount)
    else byDate[row.date].expense += Number(row.amount)
  }

  const windowEnd = new Date(now)
  const points: BarChartDataPoint[] = []

  if (range === '7D') {
    const cursor = new Date(windowStart)
    while (cursor <= windowEnd) {
      const iso = localDate(cursor)
      const d = byDate[iso] ?? { income: 0, expense: 0 }
      points.push({
        isoDate: iso,
        label: new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        income: d.income,
        expense: d.expense,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
  } else if (range === '3M') {
    const cursor = new Date(windowStart)
    cursor.setDate(cursor.getDate() - cursor.getDay())
    cursor.setHours(0, 0, 0, 0)
    while (cursor <= windowEnd) {
      const weekStart = new Date(cursor)
      const weekEnd   = new Date(cursor)
      weekEnd.setDate(weekEnd.getDate() + 6)
      const label = weekStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      let income = 0, expense = 0
      for (const [d, v] of Object.entries(byDate)) {
      const weekStartIso = localDate(weekStart)
        const weekEndIso   = localDate(weekEnd)
        if (d >= weekStartIso && d <= weekEndIso) {
          income  += v.income
          expense += v.expense
        }
      }
      points.push({ isoDate: localDate(weekStart), label, income, expense })
      cursor.setDate(cursor.getDate() + 7)
    }
  } else {
    const cursor = new Date(windowStart)
    cursor.setDate(1)
    cursor.setHours(0, 0, 0, 0)
    while (cursor <= windowEnd) {
      const monthStartIso = localDate(cursor)
      const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
      const monthEndIso   = localDate(new Date(nextMonth.getTime() - 86400000))
      const label = cursor.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
      let income = 0, expense = 0
      for (const [d, v] of Object.entries(byDate)) {
        if (d >= monthStartIso && d <= monthEndIso) {
          income  += v.income
          expense += v.expense
        }
      }
      points.push({ isoDate: localDate(cursor), label, income, expense })
      cursor.setMonth(cursor.getMonth() + 1)
    }
  }

  return points
}

// ─── Daily Calendar Data ───────────────────────────────────────────────────────

export interface DayData {
  income: number
  expense: number
  transactions: Transaction[]
}

export async function getDailyCalendarData(
  year: number,
  month: number // 1-indexed
): Promise<Record<string, DayData>> {
  const firstDay = localDate(new Date(year, month - 1, 1))
  const lastDay  = localDate(new Date(year, month, 0))

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id, type, amount, date, note,
      account:account_id ( id, name ),
      to_account:to_account_id ( id, name ),
      category:category_id ( id, name, icon, color )
    `)
    .in('type', ['income', 'expense'])
    .gte('date', firstDay)
    .lte('date', lastDay)
    .order('created_at', { ascending: false })

  if (error) throw error

  const result: Record<string, DayData> = {}
  for (const row of (data ?? []) as unknown as Transaction[]) {
    if (!result[row.date]) result[row.date] = { income: 0, expense: 0, transactions: [] }
    if (row.type === 'income')  result[row.date].income  += Number(row.amount)
    if (row.type === 'expense') result[row.date].expense += Number(row.amount)
    result[row.date].transactions.push(row)
  }

  return result
}
