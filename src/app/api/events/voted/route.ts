import { NextRequest, NextResponse } from "next/server";
import { getORM } from "@/db";
import type { EventVote } from "@/db/entities/EventVote";
import { getClientIp } from "@/lib/ip";

export const runtime = "nodejs";

// GET which event IDs the current IP has voted for
// Usage: GET /api/events/voted?ids=1,2,3
export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids");
  if (!idsParam) {
    return NextResponse.json({ votedIds: [] });
  }

  const ids = idsParam
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);

  if (ids.length === 0) {
    return NextResponse.json({ votedIds: [] });
  }

  const ip = getClientIp(request);
  const orm = await getORM();
  const em = orm.em.fork();

  const votes = await em.find<EventVote>("EventVote", {
    event: { id: { $in: ids } },
    ipAddress: ip,
  });

  const votedIds = votes.map((v) => v.event.id);

  return NextResponse.json({ votedIds });
}
