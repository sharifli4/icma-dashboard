import { NextRequest, NextResponse } from "next/server";
import { verifyHackathonAdmin, readHackathonAdminHeader } from "@/services/hackathon/authService";
import { HackathonServiceError } from "@/services/hackathon/errors";
import { getSession, deleteSession } from "@/services/hackathon/sessionService";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ token: string }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  try {
    verifyHackathonAdmin(readHackathonAdminHeader(request));

    const { token } = await params;
    const data = await getSession(token);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof HackathonServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    verifyHackathonAdmin(readHackathonAdminHeader(request));

    const { token } = await params;
    const session = await getSession(token);
    await deleteSession(session.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof HackathonServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
