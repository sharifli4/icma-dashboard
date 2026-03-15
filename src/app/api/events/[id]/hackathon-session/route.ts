import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getORM } from "@/db";
import type { CommunityEvent } from "@/db/entities/Event";
import type { HackathonSubmissionSession } from "@/db/entities/HackathonSubmissionSession";
import type { HackathonProjectSubmission } from "@/db/entities/HackathonProjectSubmission";
import { toQrSvg } from "@/lib/qr";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId) || eventId < 1) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  const orm = await getORM();
  const em = orm.em.fork();

  const event = await em.findOne<CommunityEvent>("CommunityEvent", { 
    id: eventId, 
    user: { id: Number(session.user.id) } 
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found or not authorized" }, { status: 404 });
  }

  if (!event.hackathonEnabled) {
    return NextResponse.json({ error: "Hackathon not enabled for this event" }, { status: 400 });
  }

  const hackathonSession = await em.findOne<HackathonSubmissionSession>(
    "HackathonSubmissionSession", 
    { eventName: event.title },
    { orderBy: { createdAt: "DESC" } }
  );

  if (!hackathonSession) {
    return NextResponse.json({ data: null });
  }

  const submissionCount = await em.count<HackathonProjectSubmission>(
    "HackathonProjectSubmission",
    { session: hackathonSession.id }
  );

  const qrCodeSvg = await toQrSvg(hackathonSession.submitPath);

  return NextResponse.json({
    data: {
      id: hackathonSession.id,
      eventName: hackathonSession.eventName,
      token: hackathonSession.token,
      submitPath: hackathonSession.submitPath,
      startDate: hackathonSession.startDate.toISOString(),
      endDate: hackathonSession.endDate.toISOString(),
      qrCodeSvg,
      submissionCount,
    },
  });
}
