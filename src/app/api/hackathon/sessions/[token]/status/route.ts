import { NextRequest, NextResponse } from "next/server";
import { HackathonServiceError } from "@/services/hackathon/errors";
import { getSessionStatus } from "@/services/hackathon/sessionService";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { token } = await params;
    const data = await getSessionStatus(token);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof HackathonServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
