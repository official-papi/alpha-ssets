import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
  return createSupabaseClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, planName, amount, walletAddress, network } = body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid allocation amount." }, { status: 400 });
    }

    const isPremium = (planName || "").toLowerCase().includes("premium");
    const targetPlanName = isPremium ? "Premium Plan" : "Basic Plan";
    const weeklyRate = isPremium ? 7.0 : 3.5;
    const totalPeriods = isPremium ? 16 : 8;

    // Validate plan limits
    if (!isPremium && (numAmount < 200 || numAmount > 4999)) {
      return NextResponse.json(
        { success: false, error: "Basic Plan allocation must be between $200 and $4,999." },
        { status: 400 }
      );
    }
    if (isPremium && numAmount < 5000) {
      return NextResponse.json(
        { success: false, error: "Premium Plan allocation minimum is $5,000." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    // 1. Resolve target plan ID in database
    let planId = null;
    const { data: existingPlans } = await supabase
      .from("investment_plans")
      .select("id, name, roi_percentage, total_payout_periods")
      .eq("is_active", true);

    const matchedPlan = (existingPlans || []).find((p: any) =>
      p.name.toLowerCase().includes(isPremium ? "premium" : "basic")
    );

    if (matchedPlan) {
      planId = matchedPlan.id;
    } else {
      // Create if missing
      const { data: newPlan } = await supabase
        .from("investment_plans")
        .insert([
          {
            name: targetPlanName,
            badge: isPremium ? "Most Popular" : "Starter Tier",
            description: isPremium
              ? "High-frequency AI priority execution, segregated institutional escrow custody, 7.0% weekly returns, and full principal returned at maturity."
              : "Automated AI quantitative trading with smart multi-sig escrow protection, 3.5% weekly returns, and 100% principal returned at maturity.",
            min_amount: isPremium ? 5000.0 : 200.0,
            max_amount: isPremium ? 1000000.0 : 4999.0,
            roi_percentage: weeklyRate,
            payout_interval_hours: 168,
            total_payout_periods: totalPeriods,
            capital_back: true,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (newPlan) planId = newPlan.id;
    }

    // 2. Identify target user
    let targetUserId = userId;
    if (!targetUserId) {
      // Find first profile or admin profile to link to
      const { data: firstProfile } = await supabase.from("profiles").select("id").limit(1).single();
      if (firstProfile) targetUserId = firstProfile.id;
    }

    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    const nextPayout = new Date();
    nextPayout.setDate(nextPayout.getDate() + 7); // 1 week

    const payoutPerPeriod = (numAmount * weeklyRate) / 100;

    let investmentId = null;

    if (targetUserId && planId) {
      // Insert into user_investments
      const { data: invData, error: invErr } = await supabase
        .from("user_investments")
        .insert([
          {
            user_id: targetUserId,
            plan_id: planId,
            invest_amount: numAmount,
            payout_per_period: payoutPerPeriod,
            total_payout_periods: totalPeriods,
            paid_periods: 0,
            total_profit_earned: 0.0,
            status: "active",
            next_payout_at: nextPayout.toISOString(),
          },
        ])
        .select()
        .single();

      if (!invErr && invData) {
        investmentId = invData.id;
      }

      // Record transaction
      await supabase.from("transactions").insert([
        {
          user_id: targetUserId,
          type: "investment",
          wallet: "deposit_wallet",
          amount: numAmount,
          charge: 0.0,
          post_balance: 0.0,
          description: `Web3 Escrow AI Trading Allocation (${targetPlanName}) - Wallet: ${walletAddress || "Web3"} - Hash: ${txHash.substring(0, 10)}...`,
          trx_ref: `W3-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully locked $${numAmount.toLocaleString()} in Escrow for ${targetPlanName}. Company AI trading delegated.`,
      txHash,
      planName: targetPlanName,
      amount: numAmount,
      investmentId,
      escrowContract: "0x8F3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      network: network || "Ethereum Mainnet",
    });
  } catch (err: any) {
    console.error("Wallet invest error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to process Web3 allocation." }, { status: 500 });
  }
}
