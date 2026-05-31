-- ============================================================
-- MIGRASI: Update Kategori Default (Lucide icon names)
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Langkah 1: Hapus semua kategori default lama (user_id IS NULL)
DELETE FROM public.categories WHERE user_id IS NULL;

-- Langkah 2: Insert kategori default dengan Lucide icon names
INSERT INTO public.categories (name, type, icon, color) VALUES
  -- ── Pengeluaran ──────────────────────────────────────────
  ('Makanan & Minuman',              'expense', 'UtensilsCrossed', '#ef4444'),
  ('Transportasi',                   'expense', 'Car',             '#f97316'),
  ('Tempat Tinggal',                 'expense', 'Home',            '#eab308'),
  ('Tagihan & Utilitas',             'expense', 'Zap',             '#f59e0b'),
  ('Kesehatan',                      'expense', 'HeartPulse',      '#22c55e'),
  ('Belanja / Kebutuhan Pribadi',    'expense', 'ShoppingBag',     '#a855f7'),
  ('Pendidikan & Pengembangan Diri', 'expense', 'GraduationCap',   '#06b6d4'),
  ('Hiburan & Rekreasi',             'expense', 'Gamepad2',        '#3b82f6'),
  ('Kerja & Produktivitas',          'expense', 'Briefcase',       '#0ea5e9'),
  ('Cicilan & Hutang',               'expense', 'CreditCard',      '#f43f5e'),
  ('Sosial, Keluarga & Amal',        'expense', 'Users',           '#ec4899'),
  ('Hewan Peliharaan',               'expense', 'PawPrint',        '#84cc16'),
  ('Pajak & Administrasi',           'expense', 'Landmark',        '#94a3b8'),
  ('Tabungan & Investasi',           'expense', 'PiggyBank',       '#10b981'),
  ('Darurat & Tak Terduga',          'expense', 'AlertTriangle',   '#dc2626'),
  ('Lainnya',                        'expense', 'MoreHorizontal',  '#64748b'),
  -- ── Pemasukan ────────────────────────────────────────────
  ('Gaji',                           'income',  'Wallet',          '#22c55e'),
  ('Bisnis',                         'income',  'TrendingUp',      '#06b6d4'),
  ('Investasi',                      'income',  'BarChart2',       '#a855f7'),
  ('Hadiah',                         'income',  'Gift',            '#f97316'),
  ('Pendapatan Lain',                'income',  'Coins',           '#64748b');
