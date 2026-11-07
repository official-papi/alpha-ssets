import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { userId, targetWallet, action, amount, remark } = await req.json();

    if (!userId || !targetWallet || !amount || Number(amount) <= 0) {
      return NextResponse.json({ success: false, error: "Missing required parameters." }, { status: 400 });
    }

    const numAmount = Number(amount);
    const isSubtract = action === "subtract";
    const supabase = getAdminSupabase();

    // Check if target is fiat wallet or crypto
    const isFiat = targetWallet === "deposit_wallet" || targetWallet === "interest_wallet";

    if (isFiat) {
      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("id, deposit_wallet, interest_wallet, email, full_name")
        .eq("id", userId)
        .single();

      if (profErr || !profile) {
        return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
      }

      const currentBal = Number(profile[targetWallet as "deposit_wallet" | "interest_wallet"] || 0);
      if (isSubtract && currentBal < numAmount) {
        return NextResponse.json(
          { success: false, error: `Insufficient balance. Current balance is $${currentBal.toFixed(2)}` },
          { status: 400 }
        );
      }

      const newBal = isSubtract ? currentBal - numAmount : currentBal + numAmount;

      const { error: updErr } = await supabase
        .from("profiles")
        .update({
          [targetWallet]: newBal,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updErr) {
        return NextResponse.json({ success: false, error: updErr.message }, { status: 500 });
      }

      const trxRef = `ADM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      await supabase.from("transactions").insert({
        user_id: userId,
        type: "admin_adjustment",
        wallet: targetWallet,
        amount: numAmount,
        charge: 0,
        post_balance: newBal,
        description: remark || `Admin balance adjustment (${action})`,
        trx_ref: trxRef,
      });

      // Send in-app notification
      if (!isSubtract) {
        try {
          await supabase.from("notifications").insert({
            user_id: userId,
            title: "Funds Credited",
            message: `An administrator credited $${numAmount.toFixed(2)} USD to your ${
              targetWallet === "deposit_wallet" ? "Platform Cash Wallet" : "Interest Earnings Wallet"
            }.`,
            type: "success",
            is_read: false,
          });
        } catch {}
      }

      return NextResponse.json({
        success: true,
        message: `Successfully ${isSubtract ? "subtracted" : "added"} $${numAmount.toFixed(2)} to ${targetWallet}! New balance: $${newBal.toFixed(2)}`,
        newBalance: newBal,
      });
    } else {
      // CRYPTO ASSET ADJUSTMENT: ATFC, XRP, BTC, ETH, USDT, SOL
      const symbol = String(targetWallet).toUpperCase().trim();

      const { data: existingBal } = await supabase
        .from("user_crypto_balances")
        .select("balance")
        .eq("user_id", userId)
        .eq("symbol", symbol)
        .maybeSingle();

      const currentCryptoBal = Number(existingBal?.balance || 0);
      if (isSubtract && currentCryptoBal < numAmount) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient ${symbol} balance. User only has ${currentCryptoBal} ${symbol}.`,
          },
          { status: 400 }
        );
      }

      const newCryptoBal = isSubtract ? currentCryptoBal - numAmount : currentCryptoBal + numAmount;

      const { error: upsertErr } = await supabase
        .from("user_crypto_balances")
        .upsert(
          {
            user_id: userId,
            symbol,
            balance: newCryptoBal,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,symbol" }
        );

      if (upsertErr) {
        return NextResponse.json({ success: false, error: upsertErr.message }, { status: 500 });
      }

      const trxRef = `ADM-${symbol}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      await supabase.from("transactions").insert({
        user_id: userId,
        type: "admin_crypto_adjustment",
        wallet: "deposit_wallet",
        amount: numAmount,
        charge: 0,
        post_balance: newCryptoBal,
        description: remark || `Admin ${action} of ${numAmount} ${symbol}`,
        trx_ref: trxRef,
      });

      // Send in-app notification
      if (!isSubtract) {
        try {
          await supabase.from("notifications").insert({
            user_id: userId,
            title: `${symbol} Funds Credited`,
            message: `An administrator has credited ${numAmount} ${symbol} directly to your dedicated custody account!`,
            type: "success",
            is_read: false,
          });
        } catch {}
      }

      return NextResponse.json({
        success: true,
        message: `Successfully ${isSubtract ? "subtracted" : "credited"} ${numAmount} ${symbol}! New ${symbol} balance: ${newCryptoBal}`,
        newBalance: newCryptoBal,
        symbol,
      });
    }
  } catch (err: any) {
    console.error("Admin balance adjustment error:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}

