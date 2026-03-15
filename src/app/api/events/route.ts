import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getORM } from "@/db";
import type { CommunityEvent } from "@/db/entities/Event";
import type { User } from "@/db/entities/User";
import type { HackathonSubmissionSession } from "@/db/entities/HackathonSubmissionSession";
import { randomBytes } from "crypto";
import { HACKATHON_SUBMIT_PATH_PREFIX } from "@/shared/hackathon/constants";
import { toQrSvg } from "@/lib/qr";

export const runtime = "nodejs";

function formatEvent(event: CommunityEvent) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    bannerUrl: event.bannerUrl || null,
    dateTime: event.dateTime.toISOString(),
    eventType: event.eventType,
    category: event.category,
    location: event.location || null,
    registrationUrl: event.registrationUrl || null,
    hackathonEnabled: event.hackathonEnabled,
    upvotes: event.upvotes,
    status: event.status,
    createdAt: event.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

// GET all events (public) or user's events (?mine=true)
export async function GET(request: NextRequest) {
  try {
    const orm = await getORM();
    const em = orm.em.fork();
    const mine = request.nextUrl.searchParams.get("mine");

    if (mine === "true") {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const events = await em.find<CommunityEvent>("CommunityEvent", { user: { id: Number(session.user.id) } }, { orderBy: { createdAt: "DESC" } });
      return NextResponse.json({ data: events.map(formatEvent) });
    }

    const events = await em.find<CommunityEvent>("CommunityEvent", { status: "LIVE" }, { orderBy: { createdAt: "DESC" } });
    return NextResponse.json({ data: events.map(formatEvent) });
  } catch (error) {
    console.error("[GET /api/events] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST create event (auth required)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, bannerUrl, dateTime, eventType, category, location, registrationUrl, hackathonEnabled, submissionDeadline } = body;

  if (!title || !dateTime || !eventType || !category) {
    return NextResponse.json({ error: "Title, date, event type, and category are required" }, { status: 400 });
  }

  const orm = await getORM();
  const em = orm.em.fork();
  const user = await em.findOneOrFail<User>("User", { id: Number(session.user.id) });

  const event = em.create<CommunityEvent>("CommunityEvent", {
    user,
    title,
    description: description || "",
    bannerUrl: bannerUrl || undefined,
    dateTime: new Date(dateTime),
    eventType,
    category,
    location: location || undefined,
    registrationUrl: registrationUrl || undefined,
    hackathonEnabled: hackathonEnabled || false,
    status: "LIVE",
  });

  await em.persistAndFlush(event);

  let hackathonSession = null;

  if (hackathonEnabled && eventType === "Hackathon") {
    const token = randomBytes(24).toString("hex");
    const submitPath = `${HACKATHON_SUBMIT_PATH_PREFIX}/${token}`;
    const startDate = new Date(dateTime);
    const endDate = submissionDeadline ? new Date(submissionDeadline) : new Date(new Date(dateTime).getTime() + 24 * 60 * 60 * 1000);

    const hackathonSessionEntity = em.create<HackathonSubmissionSession>("HackathonSubmissionSession", {
      eventName: title,
      token,
      submitPath,
      startDate,
      endDate,
    });

    await em.persistAndFlush(hackathonSessionEntity);

    const qrCodeSvg = await toQrSvg(submitPath);

    hackathonSession = {
      id: hackathonSessionEntity.id,
      eventName: hackathonSessionEntity.eventName,
      token: hackathonSessionEntity.token,
      submitPath: hackathonSessionEntity.submitPath,
      startDate: hackathonSessionEntity.startDate.toISOString(),
      endDate: hackathonSessionEntity.endDate.toISOString(),
      qrCodeSvg,
    };
  }

  return NextResponse.json({ 
    data: formatEvent(event),
    hackathonSession,
  }, { status: 201 });
}
