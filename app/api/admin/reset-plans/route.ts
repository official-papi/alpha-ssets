import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  return handleReset();
}

export async function POST() {
  return handleReset();
}

async function handleReset() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://umypvjptfleqyigzvolm.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // 1. Delete user investments to prevent Foreign Key reference errors
    const { error: invErr } = await supabase
      .from("user_investments")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (invErr) {
      console.warn("Notice deleting user_investments:", invErr.message);
    }

    // 2. Delete existing investment plans
    const { error: planDelErr } = await supabase
      .from("investment_plans")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (planDelErr) {
      console.warn("Notice deleting investment_plans:", planDelErr.message);
    }

    // 3. Insert Basic and Premium plans
    const { data: inserted, error: insertErr } = await supabase
      .from("investment_plans")
      .insert([
        {
          name: "Basic Plan",
          badge: "Starter Tier",
          description: "Automated AI quantitative trading with smart multi-sig escrow protection, 3.5% weekly returns, and 100% principal returned at maturity.",
          min_amount: 200.0,
          max_amount: 4999.0,
          roi_percentage: 3.5,
          payout_interval_hours: 168,
          total_payout_periods: 8,
          capital_back: true,
          is_active: true,
        },
        {
          name: "Premium Plan",
          badge: "Most Popular",
          description: "High-frequency AI priority execution, segregated institutional escrow custody, 7.0% weekly returns, and full principal returned at maturity.",
          min_amount: 5000.0,
          max_amount: 1000000.0,
          roi_percentage: 7.0,
          payout_interval_hours: 168,
          total_payout_periods: 16,
          capital_back: true,
          is_active: true,
        },
      ])
      .select();

    if (insertErr) {
      return NextResponse.json({
        success: false,
        error: insertErr.message,
        details: { invErr: invErr?.message, planDelErr: planDelErr?.message },
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully reset Supabase database to Basic Plan and Premium Plan only!",
      data: inserted,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
