import { NextRequest, NextResponse } from "next/server";
import { getORM } from "@/db";
import { HackathonSubmissionSession } from "@/db/entities/HackathonSubmissionSession";
import { verifyHackathonAdmin } from "@/lib/hackathon/admin";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ token: string }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  const admin = verifyHackathonAdmin(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.message }, { status: admin.status });
  }

  const { token } = await params;
  const sessionId = Number(token);
  if (!Number.isInteger(sessionId) || sessionId < 1) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  const orm = await getORM();
  const em = orm.em.fork();

  const session = await em.findOne(HackathonSubmissionSession, { id: sessionId });
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      id: session.id,
      eventId: session.eventId,
      token: session.token,
      submitPath: session.submitPath,
      startDate: session.startDate.toISOString(),
      endDate: session.endDate.toISOString(),
      createdAt: session.createdAt.toISOString(),
    },
  });
}
