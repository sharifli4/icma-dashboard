import { NextResponse } from "next/server";
import { fetchCommunities } from "@/lib/luhive";

export async function GET() {
  try {
    const result = await fetchCommunities();
    console.log("[luhive/communities] API result:", JSON.stringify(result, null, 2));
    return NextResponse.json(result, { status: result.success ? 200 : 502 });
  } catch (error) {
    console.error("[luhive/communities] Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
