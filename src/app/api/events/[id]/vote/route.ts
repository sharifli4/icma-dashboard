import { NextRequest, NextResponse } from "next/server";
import { getORM } from "@/db";
import type { CommunityEvent } from "@/db/entities/Event";
import type { EventVote } from "@/db/entities/EventVote";
import { getClientIp } from "@/lib/ip";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

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

  const vote = await em.findOne<EventVote>("EventVote", { event: { id: eventId }, ipAddress: ip });

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

  const event = await em.findOne<CommunityEvent>("CommunityEvent", { id: eventId });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const existing = await em.findOne<EventVote>("EventVote", { event: { id: eventId }, ipAddress: ip });

  try {
    if (existing) {
      em.remove(existing);
      event.upvotes = Math.max(0, (event.upvotes ?? 0) - 1);
      await em.flush();
      return NextResponse.json({ hasVoted: false, upvotes: event.upvotes });
    }

    const vote = em.create<EventVote>("EventVote", { event, ipAddress: ip });
    event.upvotes = (event.upvotes ?? 0) + 1;
    await em.persistAndFlush(vote);

    return NextResponse.json({ hasVoted: true, upvotes: event.upvotes });
  } catch {
    // Unique constraint violation from concurrent request — re-read state
    const freshEm = orm.em.fork();
    const freshEvent = await freshEm.findOne<CommunityEvent>("CommunityEvent", { id: eventId });
    const vote = await freshEm.findOne<EventVote>("EventVote", { event: { id: eventId }, ipAddress: ip });
    return NextResponse.json({
      hasVoted: !!vote,
      upvotes: freshEvent?.upvotes ?? 0,
    });
  }
}
