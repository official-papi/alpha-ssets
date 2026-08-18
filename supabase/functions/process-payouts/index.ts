// @ts-nocheck
// Supabase Edge Function for Automated Interest Payout Processing
// Deployed to Deno Edge runtime (Supabase Edge Functions)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date().toISOString();

    // 1. Fetch all active investments where next_payout_at <= now
    const { data: investments, error: fetchError } = await supabase
      .from("user_investments")
      .select("*, profiles(*), investment_plans(payout_interval_hours, capital_back)")
      .eq("status", "active")
      .lte("next_payout_at", now);

    if (fetchError) {
      throw fetchError;
    }

    let processedCount = 0;
    let totalYieldDistributed = 0;

    for (const inv of investments || []) {
      const periodPayout = Number(inv.payout_per_period || inv.daily_return || 0);
      const userProfile = inv.profiles;

      if (!userProfile) continue;

      const currentPaidPeriods = inv.paid_periods ?? inv.payouts_completed ?? 0;
      const totalPeriods = inv.total_payout_periods ?? inv.total_payouts ?? 30;
      const newPaidPeriods = currentPaidPeriods + 1;
      const isCompleted = newPaidPeriods >= totalPeriods;

      // Calculate next payout timestamp based on plan interval (default 24h)
      const intervalHours = inv.investment_plans?.payout_interval_hours || 24;
      const nextPayout = new Date();
      nextPayout.setHours(nextPayout.getHours() + intervalHours);

      // A. Credit User Interest Wallet
      const newInterestWallet = Number(userProfile.interest_wallet || 0) + periodPayout;
      await supabase
        .from("profiles")
        .update({ interest_wallet: newInterestWallet })
        .eq("id", inv.user_id);

      // B. Update Investment Status
      const totalProfitEarned = Number(inv.total_profit_earned || 0) + periodPayout;
      await supabase
        .from("user_investments")
        .update({
          paid_periods: newPaidPeriods,
          total_profit_earned: totalProfitEarned,
          next_payout_at: isCompleted ? null : nextPayout.toISOString(),
          status: isCompleted ? "completed" : "active",
        })
        .eq("id", inv.id);

      // C. Record Transaction Ledger Entry for Payout
      const payoutTrxRef = `PAY-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
      await supabase.from("transactions").insert({
        user_id: inv.user_id,
        type: "interest_payout",
        wallet: "interest_wallet",
        amount: periodPayout,
        charge: 0,
        post_balance: newInterestWallet,
        description: `ROI yield payout (${newPaidPeriods}/${totalPeriods}) for investment ${inv.id.substring(0, 8)}`,
        trx_ref: payoutTrxRef,
      });

      // D. Handle Capital Return (Principal Refund) if plan completed & capital_back is true
      if (isCompleted && inv.investment_plans?.capital_back) {
        const investAmount = Number(inv.invest_amount || 0);
        if (investAmount > 0) {
          const updatedDepositWallet = Number(userProfile.deposit_wallet || 0) + investAmount;
          await supabase
            .from("profiles")
            .update({ deposit_wallet: updatedDepositWallet })
            .eq("id", inv.user_id);

          const capTrxRef = `CAP-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
          await supabase.from("transactions").insert({
            user_id: inv.user_id,
            type: "admin_adjustment",
            wallet: "deposit_wallet",
            amount: investAmount,
            charge: 0,
            post_balance: updatedDepositWallet,
            description: `Principal capital returned upon investment completion (${inv.id.substring(0, 8)})`,
            trx_ref: capTrxRef,
          });
        }
      }

      processedCount++;
      totalYieldDistributed += periodPayout;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${processedCount} payouts totaling $${totalYieldDistributed.toFixed(2)}`,
        processedCount,
        totalYieldDistributed,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

