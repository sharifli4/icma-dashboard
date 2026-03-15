import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getORM } from "@/db";
import { HackathonSubmissionSession } from "@/db/entities/HackathonSubmissionSession";
import { verifyHackathonAdmin } from "@/lib/hackathon/admin";
import { toQrSvg } from "@/lib/hackathon/qr";
import { parseDate, nonEmptyString } from "@/lib/hackathon/validation";

export const runtime = "nodejs";

function createToken(): string {
  return randomBytes(24).toString("hex");
}

export async function POST(request: NextRequest) {
  const admin = verifyHackathonAdmin(request);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.message }, { status: admin.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  if (!nonEmptyString(payload.eventId)) {
    return NextResponse.json({ error: "eventId is required" }, { status: 400 });
  }

  const startDate = parseDate(payload.startDate);
  const endDate = parseDate(payload.endDate);
  if (!startDate || !endDate) {
    return NextResponse.json({ error: "startDate and endDate must be valid dates" }, { status: 400 });
  }

  if (endDate <= startDate) {
    return NextResponse.json({ error: "endDate must be after startDate" }, { status: 400 });
  }

  const token = createToken();
  const submitPath = `/hackathon/submit/${token}`;

  const orm = await getORM();
  const em = orm.em.fork();

  const session = em.create(HackathonSubmissionSession, {
    eventId: payload.eventId.trim(),
    token,
    submitPath,
    startDate,
    endDate,
  });

  await em.persistAndFlush(session);

  const qrCodeSvg = await toQrSvg(submitPath);

  return NextResponse.json(
    {
      data: {
        id: session.id,
        eventId: session.eventId,
        token: session.token,
        submitPath: session.submitPath,
        startDate: session.startDate.toISOString(),
        endDate: session.endDate.toISOString(),
        createdAt: session.createdAt.toISOString(),
        qrCodeSvg,
      },
    },
    { status: 201 }
  );
}
