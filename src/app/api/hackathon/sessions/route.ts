import { NextRequest, NextResponse } from "next/server";
import { verifyHackathonAdmin, readHackathonAdminHeader } from "@/services/hackathon/authService";
import { HackathonServiceError } from "@/services/hackathon/errors";
import { createSession, listSessions } from "@/services/hackathon/sessionService";
import type { CreateHackathonSessionInput } from "@/shared/hackathon/contracts";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    verifyHackathonAdmin(readHackathonAdminHeader(request));
    const data = await listSessions();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/hackathon/sessions]", error);
    if (error instanceof HackathonServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    verifyHackathonAdmin(readHackathonAdminHeader(request));

    const body = (await request.json()) as Partial<CreateHackathonSessionInput>;
    const data = await createSession({
      eventName: body.eventName ?? "",
      startDate: body.startDate ?? "",
      endDate: body.endDate ?? "",
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/hackathon/sessions]", error);
    if (error instanceof HackathonServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
