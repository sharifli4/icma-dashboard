import { NextRequest, NextResponse } from "next/server";
import { getORM } from "@/db";
import { CommunityEvent } from "@/db/entities/Event";
import { EventVote } from "@/db/entities/EventVote";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "127.0.0.1";
}

// GET vote status for this event
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId) || eventId < 1) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  const ip = getClientIp(request);
  const orm = await getORM();
  const em = orm.em.fork();

  const vote = await em.findOne(EventVote, { event: { id: eventId }, ipAddress: ip });

  return NextResponse.json({ hasVoted: !!vote });
}

// POST toggle vote for this event
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId) || eventId < 1) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  const ip = getClientIp(request);
  const orm = await getORM();
  const em = orm.em.fork();

  const event = await em.findOne(CommunityEvent, { id: eventId });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const existing = await em.findOne(EventVote, { event: { id: eventId }, ipAddress: ip });

  if (existing) {
    em.remove(existing);
    event.upvotes = Math.max(0, event.upvotes - 1);
    await em.flush();
    return NextResponse.json({ hasVoted: false, upvotes: event.upvotes });
  }

  const vote = em.create(EventVote, { event, ipAddress: ip });
  event.upvotes += 1;
  await em.persistAndFlush(vote);

  return NextResponse.json({ hasVoted: true, upvotes: event.upvotes });
}
