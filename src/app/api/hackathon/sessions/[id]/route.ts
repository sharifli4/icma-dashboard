import { NextRequest, NextResponse } from "next/server";
import { verifyHackathonAdmin, readHackathonAdminHeader } from "@/services/hackathon/authService";
import { HackathonServiceError } from "@/services/hackathon/errors";
import { getSessionById } from "@/services/hackathon/sessionService";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  try {
    verifyHackathonAdmin(readHackathonAdminHeader(request));

    const { id } = await params;
    const data = await getSessionById(id);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof HackathonServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
