import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

// Prices fallback for funding conversion
const COIN_PRICES: Record<string, number> = {
  ATFC: 1.0,
  XRP: 0.584,
  BTC: 67850.0,
  ETH: 3480.0,
  USDT: 1.0,
  SOL: 154.5,
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const { symbol, amountUsd, impersonateUserId } = body;

    const targetUserId = impersonateUserId || user.id;

    if (!symbol || !amountUsd || Number(amountUsd) <= 0) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid cryptocurrency symbol and USD amount." },
        { status: 400 }
      );
    }

    const cleanSymbol = String(symbol).toUpperCase().trim();
    const usdToFund = Number(amountUsd);

    const admin = getAdminSupabase();

    // 1. Fetch user's deposit wallet
    const { data: profile, error: profErr } = await admin
      .from("profiles")
      .select("id, deposit_wallet, full_name, email")
      .eq("id", targetUserId)
      .single();

    if (profErr || !profile) {
      return NextResponse.json({ success: false, error: "User profile not found." }, { status: 404 });
    }

    const currentDepositWallet = Number(profile.deposit_wallet || 0);

    if (currentDepositWallet < usdToFund) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient platform wallet balance. Available: $${currentDepositWallet.toFixed(2)}, required: $${usdToFund.toFixed(2)}. Please make a deposit first.`,
        },
        { status: 400 }
      );
    }

    // 2. Fetch live price if available or fallback
    let unitPrice = COIN_PRICES[cleanSymbol] || 1.0;
    try {
      const priceRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/crypto/prices`, {
        cache: "no-store",
      });
      if (priceRes.ok) {
        const pData = await priceRes.json();
        if (pData?.prices?.[cleanSymbol]?.usd) {
          unitPrice = Number(pData.prices[cleanSymbol].usd);
        }
      }
    } catch {
      // Use fallback price
    }

    const cryptoQuantity = usdToFund / unitPrice;
    const newDepositWallet = currentDepositWallet - usdToFund;

    // 3. Deduct from deposit_wallet
    const { error: updateProfErr } = await admin
      .from("profiles")
      .update({
        deposit_wallet: newDepositWallet,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetUserId);

    if (updateProfErr) {
      return NextResponse.json({ success: false, error: updateProfErr.message }, { status: 500 });
    }

    // 4. Fetch existing crypto balance and upsert
    const { data: existingBal } = await admin
      .from("user_crypto_balances")
      .select("balance")
      .eq("user_id", targetUserId)
      .eq("symbol", cleanSymbol)
      .maybeSingle();

    const currentCrypto = Number(existingBal?.balance || 0);
    const newCryptoBalance = currentCrypto + cryptoQuantity;

    const { error: upsertErr } = await admin.from("user_crypto_balances").upsert(
      {
        user_id: targetUserId,
        symbol: cleanSymbol,
        balance: newCryptoBalance,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,symbol" }
    );

    if (upsertErr) {
      console.warn("Could not upsert user_crypto_balances, checking columns:", upsertErr);
    }

    // 5. Insert transaction record
    const trxRef = `FUND-${cleanSymbol}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    await admin.from("transactions").insert({
      user_id: targetUserId,
      type: "fund_asset",
      wallet: "deposit_wallet",
      amount: usdToFund,
      post_balance: newDepositWallet,
      description: `Funded ${cryptoQuantity.toFixed(4)} ${cleanSymbol} from Platform Deposit Wallet`,
      trx_ref: trxRef,
    });

    // 6. Notify user
    await admin.from("notifications").insert({
      user_id: targetUserId,
      title: "Asset Funded Successfully",
      message: `You successfully allocated $${usdToFund.toFixed(2)} into ${cryptoQuantity.toFixed(4)} ${cleanSymbol}.`,
      type: "success",
    });

    return NextResponse.json({
      success: true,
      message: `Successfully allocated $${usdToFund.toFixed(2)} into ${cryptoQuantity.toFixed(4)} ${cleanSymbol}!`,
      symbol: cleanSymbol,
      cryptoAmount: cryptoQuantity,
      unitPrice,
      newDepositWallet,
      newCryptoBalance,
    });
  } catch (err: any) {
    console.error("Fund crypto error:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
