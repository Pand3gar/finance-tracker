import type { TransactionType } from './transactions'

export interface TypeMeta {
  label: string
  color: string
  bg: string
}

export const TYPE_META: Record<TransactionType, TypeMeta> = {
  expense:  { label: 'Pengeluaran', color: 'text-rose-400',    bg: 'bg-rose-400/10'    },
  income:   { label: 'Pemasukan',   color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  transfer: { label: 'Transfer',    color: 'text-blue-400',    bg: 'bg-blue-400/10'    },
}

export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
