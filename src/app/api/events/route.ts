import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getORM } from "@/db";
import { CommunityEvent } from "@/db/entities/Event";
import { User } from "@/db/entities/User";

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
    createdAt: event.createdAt.toISOString(),
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
      const events = await em.find(CommunityEvent, { user: { id: Number(session.user.id) } }, { orderBy: { createdAt: "DESC" } });
      return NextResponse.json({ data: events.map(formatEvent) });
    }

    const events = await em.find(CommunityEvent, { status: "LIVE" }, { orderBy: { createdAt: "DESC" } });
    return NextResponse.json({ data: events.map(formatEvent) });
  } catch (error) {
    console.error("[GET /api/events] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({ error: message, stack }, { status: 500 });
  }
}

// POST create event (auth required)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, bannerUrl, dateTime, eventType, category, location, registrationUrl, hackathonEnabled } = body;

  if (!title || !dateTime || !eventType || !category) {
    return NextResponse.json({ error: "Title, date, event type, and category are required" }, { status: 400 });
  }

  const orm = await getORM();
  const em = orm.em.fork();
  const user = await em.findOneOrFail(User, { id: Number(session.user.id) });

  const event = em.create(CommunityEvent, {
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

  return NextResponse.json({ data: formatEvent(event) }, { status: 201 });
}
