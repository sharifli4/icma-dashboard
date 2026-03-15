import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getORM } from "@/db";
import { CommunityEvent } from "@/db/entities/Event";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

// GET single event (public)
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId) || eventId < 1) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  const orm = await getORM();
  const em = orm.em.fork();
  const event = await em.findOne(CommunityEvent, { id: eventId }, { populate: ["user"] });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
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
      organizer: event.user.name,
      createdAt: event.createdAt.toISOString(),
    },
  });
}

// DELETE event (auth required, owner only)
export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const orm = await getORM();
  const em = orm.em.fork();
  const event = await em.findOne(CommunityEvent, { id: Number(id), user: { id: Number(session.user.id) } });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await em.removeAndFlush(event);
  return NextResponse.json({ success: true });
}

// PATCH update event status (auth required, owner only)
export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const orm = await getORM();
  const em = orm.em.fork();
  const event = await em.findOne(CommunityEvent, { id: Number(id), user: { id: Number(session.user.id) } });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (body.status) event.status = body.status;
  if (body.title) event.title = body.title;
  if (body.description !== undefined) event.description = body.description;

  await em.persistAndFlush(event);

  return NextResponse.json({ data: { id: event.id, status: event.status } });
}
