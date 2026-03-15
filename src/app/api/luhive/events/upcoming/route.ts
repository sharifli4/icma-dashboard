import { NextResponse } from "next/server";
import { fetchUpcomingEvents } from "@/lib/luhive";

export async function GET() {
  try {
    const result = await fetchUpcomingEvents();
    return NextResponse.json(result, { status: result.success ? 200 : 502 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
