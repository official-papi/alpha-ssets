-- ==============================================================================
-- MIGRATION V10: MULTI-CURRENCY CRYPTO WALLETS & PORTFOLIO ARCHITECTURE
-- Removes reliance on generic USD investment plans and introduces dedicated
-- per-cryptocurrency balances (XRP, BTC, ETH, USDT, SOL, etc.)
-- ==============================================================================

-- 1. SUPPORTED CRYPTOCURRENCIES TABLE
CREATE TABLE IF NOT EXISTS public.crypto_currencies (
    symbol TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    network TEXT NOT NULL,
    decimals INT NOT NULL DEFAULT 8,
    icon_svg TEXT,
    wallet_address TEXT,
    requires_tag BOOLEAN DEFAULT false,
    tag_value TEXT,
    qr_code_url TEXT,
    min_deposit NUMERIC(28, 8) DEFAULT 0.0001,
    min_withdraw NUMERIC(28, 8) DEFAULT 0.0001,
    withdraw_fee NUMERIC(28, 8) DEFAULT 0.00005,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Currencies (XRP, BTC, ETH, USDT, SOL)
INSERT INTO public.crypto_currencies (symbol, name, network, decimals, wallet_address, requires_tag, tag_value, min_deposit, min_withdraw, withdraw_fee, sort_order)
VALUES
('XRP', 'Ripple', 'XRPL (Ripple Ledger)', 6, 'rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh', true, '583921', 10.000000, 15.000000, 0.250000, 1),
('BTC', 'Bitcoin', 'Bitcoin Network', 8, 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', false, NULL, 0.000500, 0.001000, 0.000200, 2),
('ETH', 'Ethereum', 'ERC-20', 8, '0x71C83d3b7da5F23e098a5F38A88950d81745Fe1e', false, NULL, 0.010000, 0.020000, 0.003000, 3),
('USDT', 'Tether USD', 'TRC-20 / TRON', 6, 'T9yD14Nj9j7x8kL2m1n0PqRsTuVwXyZ3aB', false, NULL, 20.000000, 25.000000, 1.000000, 4),
('SOL', 'Solana', 'Solana Mainnet', 8, '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', false, NULL, 0.100000, 0.200000, 0.010000, 5)
ON CONFLICT (symbol) DO UPDATE SET
    wallet_address = EXCLUDED.wallet_address,
    requires_tag = EXCLUDED.requires_tag,
    tag_value = EXCLUDED.tag_value,
    network = EXCLUDED.network;

-- 2. USER CRYPTO BALANCES TABLE
CREATE TABLE IF NOT EXISTS public.user_crypto_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL REFERENCES public.crypto_currencies(symbol) ON DELETE RESTRICT,
    balance NUMERIC(28, 8) NOT NULL DEFAULT 0.00000000 CHECK (balance >= 0),
    locked_balance NUMERIC(28, 8) NOT NULL DEFAULT 0.00000000 CHECK (locked_balance >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_user_crypto_balances_user ON public.user_crypto_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_crypto_balances_symbol ON public.user_crypto_balances(symbol);

-- 3. EXPAND DEPOSITS & WITHDRAWALS WITH CRYPTO FIELDS
ALTER TABLE public.deposits 
  ADD COLUMN IF NOT EXISTS crypto_symbol TEXT,
  ADD COLUMN IF NOT EXISTS crypto_amount NUMERIC(28, 8),
  ADD COLUMN IF NOT EXISTS tx_hash TEXT;

ALTER TABLE public.withdrawals
  ADD COLUMN IF NOT EXISTS crypto_symbol TEXT,
  ADD COLUMN IF NOT EXISTS crypto_amount NUMERIC(28, 8),
  ADD COLUMN IF NOT EXISTS destination_address TEXT,
  ADD COLUMN IF NOT EXISTS destination_tag TEXT;

-- 4. FUNCTION TO INITIALIZE WALLETS FOR A USER
CREATE OR REPLACE FUNCTION public.initialize_user_crypto_wallets(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_crypto_balances (user_id, symbol, balance, locked_balance)
    SELECT p_user_id, c.symbol, 0.00000000, 0.00000000
    FROM public.crypto_currencies c
    WHERE c.is_active = true
    ON CONFLICT (user_id, symbol) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-initialize wallets for new users
CREATE OR REPLACE FUNCTION public.trg_init_user_wallets()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.initialize_user_crypto_wallets(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_init_crypto_wallets ON public.profiles;
CREATE TRIGGER trg_auto_init_crypto_wallets
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.trg_init_user_wallets();

-- Initialize wallets for all currently existing profiles
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM public.profiles LOOP
        PERFORM public.initialize_user_crypto_wallets(r.id);
    END LOOP;
END;
$$;

-- 5. FUNCTION TO ATOMICALLY CREDIT A USER'S CRYPTO BALANCE
CREATE OR REPLACE FUNCTION public.credit_user_crypto_balance(
    p_user_id UUID,
    p_symbol TEXT,
    p_amount NUMERIC(28, 8)
) RETURNS JSONB AS $$
DECLARE
    v_new_bal NUMERIC(28, 8);
BEGIN
    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid deposit amount.');
    END IF;

    INSERT INTO public.user_crypto_balances (user_id, symbol, balance, locked_balance)
    VALUES (p_user_id, p_symbol, p_amount, 0)
    ON CONFLICT (user_id, symbol)
    DO UPDATE SET 
        balance = public.user_crypto_balances.balance + EXCLUDED.balance,
        updated_at = NOW()
    RETURNING balance INTO v_new_bal;

    RETURN jsonb_build_object('success', true, 'symbol', p_symbol, 'new_balance', v_new_bal);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. UPDATED ATOMIC DEPOSIT APPROVAL RPC
CREATE OR REPLACE FUNCTION public.approve_crypto_deposit_rpc(
    p_deposit_id UUID,
    p_admin_id UUID,
    p_feedback TEXT DEFAULT 'Deposit confirmed & credited'
) RETURNS JSONB AS $$
DECLARE
    v_dep RECORD;
    v_sym TEXT;
    v_amt NUMERIC(28, 8);
    v_new_bal NUMERIC(28, 8);
    v_trx_ref TEXT;
BEGIN
    SELECT * INTO v_dep FROM public.deposits WHERE id = p_deposit_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Deposit record not found.');
    END IF;

    IF v_dep.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Deposit is already processed.');
    END IF;

    v_sym := COALESCE(v_dep.crypto_symbol, 'USDT');
    v_amt := COALESCE(v_dep.crypto_amount, v_dep.final_amount, v_dep.amount);

    -- Mark approved
    UPDATE public.deposits
    SET status = 'approved',
        admin_feedback = p_feedback,
        updated_at = NOW()
    WHERE id = p_deposit_id;

    -- Credit user crypto wallet
    INSERT INTO public.user_crypto_balances (user_id, symbol, balance)
    VALUES (v_dep.user_id, v_sym, v_amt)
    ON CONFLICT (user_id, symbol)
    DO UPDATE SET 
        balance = public.user_crypto_balances.balance + EXCLUDED.balance,
        updated_at = NOW()
    RETURNING balance INTO v_new_bal;

    -- Also keep legacy deposit_wallet in profiles in sync for compatibility
    UPDATE public.profiles
    SET deposit_wallet = deposit_wallet + COALESCE(v_dep.final_amount, v_dep.amount),
        updated_at = NOW()
    WHERE id = v_dep.user_id;

    -- Insert into transactions ledger
    v_trx_ref := 'DEP-' || UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 10));
    INSERT INTO public.transactions (
        user_id, type, wallet, amount, charge, post_balance, description, trx_ref
    ) VALUES (
        v_dep.user_id, 'deposit', 'deposit_wallet', v_amt, COALESCE(v_dep.charge, 0),
        v_new_bal, 'Deposit approved for ' || v_amt || ' ' || v_sym, v_trx_ref
    );

    -- Notify user
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
        v_dep.user_id,
        'Crypto Deposit Credited',
        'Your deposit of ' || v_amt || ' ' || v_sym || ' has been approved and credited to your account.',
        'success'
    );

    RETURN jsonb_build_object('success', true, 'symbol', v_sym, 'amount', v_amt, 'new_balance', v_new_bal);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.crypto_currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_crypto_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public crypto currencies read" ON public.crypto_currencies;
CREATE POLICY "Public crypto currencies read" ON public.crypto_currencies
    FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Users can read own crypto balances" ON public.user_crypto_balances;
CREATE POLICY "Users can read own crypto balances" ON public.user_crypto_balances
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage currencies" ON public.crypto_currencies;
CREATE POLICY "Admins manage currencies" ON public.crypto_currencies
    FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage user crypto balances" ON public.user_crypto_balances;
CREATE POLICY "Admins manage user crypto balances" ON public.user_crypto_balances
    FOR ALL USING (public.is_admin());
