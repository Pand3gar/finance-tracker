import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  getAccounts,
  getCategories,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  type Account,
  type Category,
  type Transaction,
  type TransactionType,
} from '@/lib/transactions'
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Trash2 } from 'lucide-react'

interface AddTransactionModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  initialData?: Transaction | null
}

const TYPE_TABS: { value: TransactionType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'expense', label: 'Pengeluaran', icon: <ArrowUpRight className="h-4 w-4" />, color: 'text-rose-400 border-rose-400 bg-rose-400/10' },
  { value: 'income', label: 'Pemasukan', icon: <ArrowDownLeft className="h-4 w-4" />, color: 'text-emerald-400 border-emerald-400 bg-emerald-400/10' },
  { value: 'transfer', label: 'Transfer', icon: <ArrowLeftRight className="h-4 w-4" />, color: 'text-blue-400 border-blue-400 bg-blue-400/10' },
]

function getLocalToday(): string {
  const n = new Date()
  return [
    n.getFullYear(),
    String(n.getMonth() + 1).padStart(2, '0'),
    String(n.getDate()).padStart(2, '0'),
  ].join('-')
}
const TODAY = getLocalToday()

export default function AddTransactionModal({ open, onClose, onSuccess, initialData }: AddTransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(TODAY)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [fetching, setFetching] = useState(false)



  const dialogRef = useRef<HTMLDialogElement>(null)

  const isEdit = !!initialData

  // Sync state with initialData
  useEffect(() => {
    if (open && initialData) {
      setType(initialData.type)
      setAmount(String(initialData.amount))
      setAccountId(initialData.account?.id || '')
      setToAccountId(initialData.to_account?.id || '')
      setCategoryId(initialData.category?.id || '')
      setDate(initialData.date)
      setNote(initialData.note || '')
    } else if (open) {
      resetForm()
    }
  }, [open, initialData])

  // Open/close native dialog
  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) {
      if (!el.open) {
        el.showModal()
      }
    } else {
      if (el.open) {
        el.close()
      }
    }
  }, [open])

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose()
  }

  // Fetch accounts & categories
  useEffect(() => {
    if (!open) return
    fetchData()
  }, [open, type])

  const fetchData = async () => {
    setFetching(true)
    try {
      const [accs, cats] = await Promise.all([
        getAccounts(),
        getCategories(type === 'transfer' ? undefined : type),
      ])
      setAccounts(accs)
      setCategories(cats)

      // Auto-select first account if none selected and not editing
      if (!isEdit && accs.length > 0 && !accountId) {
        setAccountId(accs[0].id)
      }
    } catch {
      setError('Gagal memuat data akun / kategori.')
    } finally {
      setFetching(false)
    }
  }

  const resetForm = () => {
    setType('expense'); setAmount(''); setAccountId(''); setToAccountId('')
    setCategoryId(''); setDate(TODAY); setNote(''); setError(null)
  }



  const handleDelete = async () => {
    if (!initialData) return
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return

    setLoading(true)
    try {
      await deleteTransaction(initialData.id)
      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus transaksi.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!amount || Number(amount) <= 0) return setError('Jumlah harus lebih dari 0.')
    if (!accountId) return setError('Pilih akun sumber.')
    if (type === 'transfer' && !toAccountId) return setError('Pilih akun tujuan.')
    if (type === 'transfer' && accountId === toAccountId) return setError('Akun sumber dan tujuan tidak boleh sama.')
    if (type !== 'transfer' && !categoryId) return setError('Pilih kategori.')

    setLoading(true)
    try {
      const payload = {
        type,
        amount: Number(amount),
        account_id: accountId,
        to_account_id: type === 'transfer' ? toAccountId : null,
        category_id: type !== 'transfer' ? categoryId : null,
        date,
        note,
      }

      if (isEdit && initialData) {
        await updateTransaction(initialData.id, payload)
      } else {
        await addTransaction(payload)
      }
      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan transaksi.')
    } finally {
      setLoading(false)
    }
  }

  const activeTab = TYPE_TABS.find(t => t.value === type)!

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      className="m-0 mt-auto w-full max-h-[92vh] rounded-t-2xl border-t border-border bg-card p-0 shadow-[0_-4px_32px_0_rgba(0,0,0,0.4)] backdrop:bg-black/50 backdrop:backdrop-blur-sm open:flex open:flex-col overflow-hidden sm:m-auto sm:mt-auto sm:max-w-md sm:rounded-2xl sm:border sm:max-h-[85vh] sm:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
    >
      <div className="flex flex-col w-full min-h-0 bg-card">
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-0 flex-shrink-0">
          <div className="h-1 w-10 rounded-full bg-border/60" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 bg-white/5 flex-shrink-0">
          <h2 className="text-sm sm:text-base font-semibold">{isEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Type tabs */}
        <div className="flex gap-2 px-4 sm:px-6 pt-3 sm:pt-5 flex-shrink-0">
          {TYPE_TABS.map(tab => (
            <button
              key={tab.value}
              type="button"
              onClick={() => { setType(tab.value); setCategoryId('') }}
              className={`flex flex-1 items-center justify-center gap-1 sm:gap-1.5 rounded-xl border py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold transition-all duration-300 ${type === tab.value
                  ? tab.color + ' shadow-sm ring-1 ring-inset ' + tab.color.split(' ')[1].replace('border-', 'ring-')
                  : 'border-white/5 bg-black/20 text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-5 overflow-y-auto px-4 sm:px-6 py-3 sm:py-5 custom-scrollbar min-h-0">
          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Jumlah (Rp)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="1"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              disabled={loading}
              className="text-xl sm:text-2xl font-bold h-11 sm:h-14 bg-black/20 border-white/10 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/50 shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {/* Account (source) */}
            <div className="space-y-1.5">
              <Label htmlFor="account" className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {type === 'transfer' ? 'Dari Akun' : 'Akun'}
              </Label>
              {fetching ? (
                <div className="h-10 animate-pulse rounded-xl bg-muted/50" />
              ) : accounts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/50 bg-black/20 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Belum ada akun.</p>
                </div>
              ) : (
                <select
                  id="account"
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  required
                  disabled={loading}
                  className="h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 shadow-inner appearance-none custom-select-arrow transition-colors"
                >
                  <option value="" className="bg-background">-- Pilih --</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id} className="bg-background">{acc.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* To Account (transfer) / Category */}
            {type === 'transfer' ? (
              <div className="space-y-1.5">
                <Label htmlFor="toAccount" className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Ke Akun</Label>
                <select
                  id="toAccount"
                  value={toAccountId}
                  onChange={e => setToAccountId(e.target.value)}
                  required
                  disabled={loading}
                  className="h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 shadow-inner appearance-none custom-select-arrow transition-colors"
                >
                  <option value="" className="bg-background">-- Pilih --</option>
                  {accounts.filter(acc => acc.id !== accountId).map(acc => (
                    <option key={acc.id} value={acc.id} className="bg-background">{acc.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Kategori</Label>
                {fetching ? (
                  <div className="h-10 animate-pulse rounded-xl bg-muted/50" />
                ) : (
                  <select
                    id="category"
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    required
                    disabled={loading}
                    className="h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 shadow-inner appearance-none custom-select-arrow transition-colors"
                  >
                    <option value="" className="bg-background">-- Pilih --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-background">{cat.name}</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                onClick={(e) => {
                  try { (e.target as HTMLInputElement).showPicker() } catch { }
                }}
                required
                disabled={loading}
                className="h-10 bg-black/20 border-white/10 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/50 shadow-inner text-sm block w-full"
              />
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <Label htmlFor="note" className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Catatan</Label>
              <Input
                id="note"
                type="text"
                placeholder="Opsional"
                value={note}
                onChange={e => setNote(e.target.value)}
                disabled={loading}
                className="h-10 bg-black/20 border-white/10 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/50 shadow-inner text-sm"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs sm:text-sm text-rose-400">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:gap-3 pt-1 sm:pt-3 pb-1">
            <div className="flex gap-2 sm:gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1 rounded-xl h-10 sm:h-11 border-white/10 bg-white/5 hover:bg-white/10 text-foreground text-sm transition-colors">
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading || fetching}
                className={`flex-1 rounded-xl h-10 sm:h-11 text-white font-bold text-sm transition-all shadow-md ${type === 'expense' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' :
                    type === 'income' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' :
                      'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Menyimpan...
                  </span>
                ) : (
                  isEdit ? 'Simpan Perubahan' : `Simpan ${activeTab.label}`
                )}
              </Button>
            </div>

            {isEdit && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                disabled={loading}
                className="text-rose-400 hover:bg-rose-400/10 hover:text-rose-400 h-9 text-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Hapus Transaksi
              </Button>
            )}
          </div>
        </form>
      </div>
    </dialog>
  )
}
