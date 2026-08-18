import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const stripeSignature = request.headers.get("stripe-signature");

    if (!stripeSignature) {
      return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://placeholder-project.supabase.co";
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "placeholder-anon-key";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse event payload
    let event: any;
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: "Invalid payload JSON" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const depositId = session.client_reference_id || session.metadata?.deposit_id;

      if (depositId) {
        const { data: rpcResult, error: rpcError } = await supabase.rpc("approve_deposit_rpc", {
          p_deposit_id: depositId,
          p_admin_id: "00000000-0000-0000-0000-000000000000",
          p_feedback: "Approved automatically via Stripe Webhook",
        });

        if (rpcError) {
          console.error("Stripe Webhook RPC Error:", rpcError);
          return NextResponse.json({ error: rpcError.message }, { status: 500 });
        }

        return NextResponse.json({ received: true, rpcResult });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
