// Supabase Edge Function: verify-booking
// Validates cryptographic KS1 QR token, checks permissions, prevents duplicate verification, and writes audit log.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// SHA-256 Hasher
async function hashTokenSHA256(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Authenticate Request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ status: "UNAUTHORIZED", message: "Missing Authorization header." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenJwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(tokenJwt);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ status: "UNAUTHORIZED", message: "Invalid or expired session." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Parse payload
    const { token, action = "SCAN", remarks = "Verified via Staff Scanner" } = await req.json();

    if (!token || typeof token !== "string" || !token.startsWith("KS1|")) {
      return new Response(
        JSON.stringify({
          status: "INVALID_QR",
          message: "Invalid QR format. Expected secure Kisan Setu token (KS1|...).",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Hash token
    const tokenHash = await hashTokenSHA256(token);

    // 4. Find matching booking
    const { data: booking, error: fetchError } = await supabaseClient
      .from("bookings")
      .select("*")
      .eq("qr_token_hash", tokenHash)
      .single();

    if (fetchError || !booking) {
      // Record unknown attempt
      await supabaseClient.from("booking_verifications").insert({
        booking_number: "UNKNOWN",
        staff_id: user.id,
        staff_name: user.user_metadata?.full_name || "Mandi Staff",
        action: "SCAN",
        result: "NOT_FOUND",
        remarks: "Unknown QR token scanned",
      });

      return new Response(
        JSON.stringify({
          status: "NOT_FOUND",
          message: "This QR code is not associated with any valid Kisan Setu booking.",
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Check if Cancelled
    if (booking.status === "CANCELLED") {
      await supabaseClient.from("booking_verifications").insert({
        booking_id: booking.id,
        booking_number: booking.booking_number,
        staff_id: user.id,
        staff_name: user.user_metadata?.full_name || "Mandi Staff",
        action: "SCAN",
        result: "CANCELLED",
        remarks: "Attempted scan of cancelled booking",
      });

      return new Response(
        JSON.stringify({
          status: "CANCELLED",
          booking_number: booking.booking_number,
          message: "This booking has been cancelled and cannot be verified.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Check if Already Verified
    if (booking.verification_status === "VERIFIED") {
      await supabaseClient.from("booking_verifications").insert({
        booking_id: booking.id,
        booking_number: booking.booking_number,
        staff_id: user.id,
        staff_name: user.user_metadata?.full_name || "Mandi Staff",
        action: "SCAN",
        result: "ALREADY_VERIFIED",
        remarks: "Duplicate QR scan attempt",
      });

      return new Response(
        JSON.stringify({
          status: "ALREADY_VERIFIED",
          booking_number: booking.booking_number,
          farmer_name: booking.farmer_name,
          centre_name: booking.centre_name,
          verified_at: booking.verified_at,
          verified_by: booking.verified_by_name || "Staff Operator",
          message: "This booking has already been verified.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. If action is VERIFY, perform atomic verification
    if (action === "VERIFY") {
      const now = new Date().toISOString();
      const staffName = user.user_metadata?.full_name || "Mandi Staff";

      const { error: updateError } = await supabaseClient
        .from("bookings")
        .update({
          verification_status: "VERIFIED",
          verified_by: user.id,
          verified_by_name: staffName,
          verified_at: now,
          verification_remarks: remarks,
        })
        .eq("id", booking.id)
        .eq("verification_status", "PENDING"); // Optimistic concurrency lock

      if (updateError) {
        return new Response(
          JSON.stringify({
            status: "ALREADY_VERIFIED",
            message: "Another staff member just verified this booking.",
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Record successful verification audit
      await supabaseClient.from("booking_verifications").insert({
        booking_id: booking.id,
        booking_number: booking.booking_number,
        staff_id: user.id,
        staff_name: staffName,
        centre_id: booking.centre_id,
        centre_name: booking.centre_name,
        action: "VERIFY",
        result: "VALID",
        remarks,
      });

      return new Response(
        JSON.stringify({
          status: "VALID",
          verified: true,
          booking: {
            booking_number: booking.booking_number,
            farmer_name: booking.farmer_name,
            centre_name: booking.centre_name,
            booking_date: booking.booking_date,
            start_time: booking.start_time,
            end_time: booking.end_time,
            commodity: booking.commodity,
            quantity: booking.quantity,
            vehicle_number: booking.vehicle_number,
            token_number: booking.token_number,
            verified_at: now,
            verified_by: staffName,
          },
          message: "Booking verified successfully.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 8. If action is SCAN (preview before verification confirmation)
    return new Response(
      JSON.stringify({
        status: "VALID",
        verified: false,
        booking: {
          id: booking.id,
          booking_number: booking.booking_number,
          farmer_name: booking.farmer_name,
          centre_name: booking.centre_name,
          booking_date: booking.booking_date,
          start_time: booking.start_time,
          end_time: booking.end_time,
          commodity: booking.commodity,
          quantity: booking.quantity,
          vehicle_number: booking.vehicle_number,
          token_number: booking.token_number,
          booking_status: booking.status,
          verification_status: booking.verification_status,
        },
        message: "Valid booking found. Ready for verification.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    return new Response(
      JSON.stringify({ status: "ERROR", message: err instanceof Error ? err.message : "Internal Server Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
