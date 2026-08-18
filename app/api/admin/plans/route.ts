import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Helper for privileged admin operations
function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
  return createSupabaseClient(supabaseUrl, supabaseServiceKey);
}

// GET all investment plans
export async function GET() {
  try {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("investment_plans")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST create or update investment plan
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...planData } = body;
    const supabase = getAdminSupabase();

    if (id) {
      // Update existing
      const { data, error } = await supabase
        .from("investment_plans")
        .update(planData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data, message: "Plan updated successfully." });
    } else {
      // Create new
      const { data, error } = await supabase
        .from("investment_plans")
        .insert([planData])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data, message: "Plan created successfully." });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE investment plan
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Plan ID is required." }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // Check if any user investments exist for this plan
    const { count, error: countErr } = await supabase
      .from("user_investments")
      .select("id", { count: "exact", head: true })
      .eq("plan_id", id);

    if (count && count > 0) {
      // If active investments exist, disable the plan instead of hard deleting to prevent data corruption
      await supabase
        .from("investment_plans")
        .update({ is_active: false })
        .eq("id", id);

      return NextResponse.json({
        success: true,
        disabledInstead: true,
        message: `Plan has ${count} existing investor deposit(s). It has been disabled so new investors cannot join, while preserving historical payout records.`,
      });
    }

    // Hard delete
    const { error: delErr } = await supabase
      .from("investment_plans")
      .delete()
      .eq("id", id);

    if (delErr) throw delErr;

    return NextResponse.json({ success: true, message: "Plan deleted successfully." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
