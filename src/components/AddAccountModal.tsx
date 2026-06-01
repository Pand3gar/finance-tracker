import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addAccount, updateAccount, deleteAccount, type Account } from '@/lib/transactions'
import { Trash2, Landmark, Wallet } from 'lucide-react'

interface AddAccountModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  initialData?: Account | null
}

export default function AddAccountModal({ open, onClose, onSuccess, initialData }: AddAccountModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState('bank')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dialogRef = useRef<HTMLDialogElement>(null)

  const isEdit = !!initialData

  // Sync state with initialData when it changes or modal opens
  useEffect(() => {
    if (open && initialData) {
      setName(initialData.name)
      setType(initialData.type)
    } else if (open) {
      resetForm()
    }
  }, [open, initialData])

  // Open/close native dialog
  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) {
      if (!el.open) el.showModal()
    } else {
      if (el.open) el.close()
    }
  }, [open])

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose()
  }

  const resetForm = () => {
    setName('')
    setType('bank')
    setError(null)
  }

  const handleDelete = async () => {
    if (!initialData) return
    if (!confirm('Apakah Anda yakin ingin menghapus akun ini? Semua transaksi terkait mungkin akan terpengaruh.')) return

    setLoading(true)
    try {
      await deleteAccount(initialData.id)
      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus akun.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) return setError('Nama akun tidak boleh kosong.')

    setLoading(true)
    try {
      if (isEdit && initialData) {
        await updateAccount(initialData.id, name.trim(), type)
      } else {
        await addAccount(name.trim(), type)
      }
      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan akun.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="m-auto w-[calc(100%-2rem)] max-w-sm max-h-[90dvh] rounded-2xl border border-border bg-card p-0 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop:bg-black/50 backdrop:backdrop-blur-sm open:flex open:flex-col overflow-hidden"
    >
      <div className="flex flex-col w-full min-h-0 bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 px-4 sm:px-6 py-4 sm:py-5 bg-card/40">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30 shadow-inner flex-shrink-0">
              {isEdit ? <Landmark className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight">{isEdit ? 'Edit Akun' : 'Tambah Akun Baru'}</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">{isEdit ? 'Ubah informasi akun' : 'Buat dompet atau rekening baru'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors hover:rotate-90 flex-shrink-0"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 px-4 sm:px-6 py-4 sm:py-6">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="accountName" className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Nama Akun</Label>
            <Input
              id="accountName"
              type="text"
              placeholder="Misal: BCA, Mandiri, OVO"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
              className="h-10 sm:h-12 bg-black/20 border-border/50 focus:border-primary/50 transition-colors shadow-inner"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="accountType" className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Tipe Akun</Label>
            <select
              id="accountType"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={loading}
              className="h-10 sm:h-12 w-full rounded-md border border-border/50 bg-black/20 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors shadow-inner"
            >
              <option value="bank" className="bg-background">Bank</option>
              <option value="cash" className="bg-background">Kas</option>
              <option value="e-wallet" className="bg-background">E-Wallet</option>
              <option value="general" className="bg-background">Lainnya</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-rose-400 font-medium animate-fade-in flex items-center gap-2">
              <span className="flex-shrink-0">⚠️</span> {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2.5 sm:gap-3 pt-1 sm:pt-2">
            <div className="flex gap-2.5 sm:gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1 h-10 sm:h-12 border-border/50 hover:bg-accent/50 transition-colors font-semibold">
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 h-10 sm:h-12 font-semibold">
                {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Akun'}
              </Button>
            </div>

            {isEdit && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                disabled={loading}
                className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors h-10 sm:h-11 font-medium group"
              >
                <Trash2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" /> Hapus Akun
              </Button>
            )}
          </div>
        </form>
      </div>
    </dialog>
  )
}
