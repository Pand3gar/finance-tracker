-- ============================================================
-- BAGIAN 1: Auth & Profiles (dari issue #3 sebelumnya)
-- ============================================================

-- 1. Buat tabel profiles yang terhubung ke tabel auth.users milik Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email     TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policy: User hanya bisa melihat data miliknya sendiri
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 4. Policy: User hanya bisa mengupdate data miliknya sendiri
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 5. Function yang akan dipanggil setiap kali user baru dibuat
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  RETURN NEW;
END;
$$;

-- 6. Trigger: jalankan function di atas setiap kali ada INSERT ke auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- BAGIAN 2: Fitur Keuangan (expenses, income, transfer)
-- ============================================================

-- -------------------------------------------------------
-- Tabel: accounts (rekening / dompet user)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.accounts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'general', -- 'cash', 'bank', 'e-wallet', 'general'
  balance    NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency   TEXT NOT NULL DEFAULT 'IDR',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own accounts" ON public.accounts;
CREATE POLICY "Users can view own accounts"
  ON public.accounts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own accounts" ON public.accounts;
CREATE POLICY "Users can insert own accounts"
  ON public.accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own accounts" ON public.accounts;
CREATE POLICY "Users can update own accounts"
  ON public.accounts FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own accounts" ON public.accounts;
CREATE POLICY "Users can delete own accounts"
  ON public.accounts FOR DELETE
  USING (auth.uid() = user_id);


-- -------------------------------------------------------
-- Tabel: categories (kategori transaksi)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = default/global
  name       TEXT NOT NULL,
  type       TEXT NOT NULL, -- 'expense' | 'income' | 'both'
  icon       TEXT DEFAULT '📁',
  color      TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own and default categories" ON public.categories;
CREATE POLICY "Users can view own and default categories"
  ON public.categories FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
CREATE POLICY "Users can insert own categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
CREATE POLICY "Users can update own categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
CREATE POLICY "Users can delete own categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id);

-- Hapus default categories yang lama jika script dijalankan ulang untuk menghindari duplikat
DELETE FROM public.categories WHERE user_id IS NULL;

-- Seed: kategori default (user_id NULL = tersedia untuk semua user)
INSERT INTO public.categories (name, type, icon, color) VALUES
  ('Makanan & Minuman', 'expense', '🍔', '#ef4444'),
  ('Transportasi',      'expense', '🚗', '#f97316'),
  ('Belanja',           'expense', '🛍️', '#a855f7'),
  ('Hiburan',           'expense', '🎮', '#3b82f6'),
  ('Kesehatan',         'expense', '💊', '#22c55e'),
  ('Pendidikan',        'expense', '📚', '#06b6d4'),
  ('Tagihan',           'expense', '🧾', '#f59e0b'),
  ('Lainnya',           'expense', '📦', '#64748b'),
  ('Gaji',              'income',  '💼', '#22c55e'),
  ('Bisnis',            'income',  '📈', '#06b6d4'),
  ('Investasi',         'income',  '💹', '#a855f7'),
  ('Hadiah',            'income',  '🎁', '#f97316'),
  ('Pendapatan Lain',   'income',  '💰', '#64748b');


-- -------------------------------------------------------
-- Tabel: transactions (transaksi utama)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
  amount        NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  account_id    UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL, -- hanya untuk transfer
  category_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL, -- null untuk transfer
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  note          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);


-- -------------------------------------------------------
-- Function: Buat akun default saat user baru register
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user_accounts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Buat akun "Kas" dan "Bank" default untuk user baru
  INSERT INTO public.accounts (user_id, name, type, balance) VALUES
    (NEW.id, 'Kas',  'cash', 0),
    (NEW.id, 'Bank', 'bank', 0);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_accounts ON auth.users;
CREATE TRIGGER on_auth_user_created_accounts
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_accounts();


-- -------------------------------------------------------
-- Backfill: Buat akun default untuk user yang SUDAH ada
-- tapi belum punya akun (karena register sebelum trigger)
-- -------------------------------------------------------
INSERT INTO public.accounts (user_id, name, type, balance)
SELECT u.id, 'Kas', 'cash', 0
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.accounts a WHERE a.user_id = u.id
);

INSERT INTO public.accounts (user_id, name, type, balance)
SELECT u.id, 'Bank', 'bank', 0
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.accounts a WHERE a.user_id = u.id AND a.name = 'Bank'
);

-- -------------------------------------------------------
-- BAGIAN 3: Triggers untuk Update Saldo Otomatis
-- -------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_transaction_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- 1. Undo saldo lama jika aksi UPDATE atau DELETE
  IF (TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
    -- Kurangi saldo jika income lama, tambah jika expense lama
    IF OLD.type = 'income' THEN
      UPDATE public.accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE public.accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'transfer' THEN
      UPDATE public.accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
      UPDATE public.accounts SET balance = balance - OLD.amount WHERE id = OLD.to_account_id;
    END IF;
  END IF;

  -- 2. Terapkan saldo baru jika aksi INSERT atau UPDATE
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    IF NEW.type = 'income' THEN
      UPDATE public.accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE public.accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'transfer' THEN
      UPDATE public.accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
      UPDATE public.accounts SET balance = balance + NEW.amount WHERE id = NEW.to_account_id;
    END IF;
  END IF;

  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_transaction_change ON public.transactions;
CREATE TRIGGER on_transaction_change
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_transaction_balance();
