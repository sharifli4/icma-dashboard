import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getORM } from "@/db";
import { User } from "@/db/entities/User";
import { CommunityProfile } from "@/db/entities/CommunityProfile";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orm = await getORM();
  const em = orm.em.fork();

  const profile = await em.findOne(CommunityProfile, { user: { id: Number(session.user.id) } });

  if (!profile) {
    return NextResponse.json({ data: null });
  }

  return NextResponse.json({
    data: {
      id: profile.id,
      communityName: profile.communityName,
      description: profile.description,
      logoUrl: profile.logoUrl || null,
      websiteUrl: profile.websiteUrl || null,
      socialUrl: profile.socialUrl || null,
    },
  });
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { communityName, description, logoUrl, websiteUrl, socialUrl } = body;

  if (!communityName || typeof communityName !== "string") {
    return NextResponse.json({ error: "Community name is required" }, { status: 400 });
  }

  const orm = await getORM();
  const em = orm.em.fork();
  const userId = Number(session.user.id);

  let profile = await em.findOne(CommunityProfile, { user: { id: userId } });

  if (!profile) {
    const user = await em.findOneOrFail(User, { id: userId });
    profile = em.create(CommunityProfile, {
      user,
      communityName,
      description: description || "",
      logoUrl: logoUrl || undefined,
      websiteUrl: websiteUrl || undefined,
      socialUrl: socialUrl || undefined,
    });
  } else {
    profile.communityName = communityName;
    profile.description = description || "";
    profile.logoUrl = logoUrl || undefined;
    profile.websiteUrl = websiteUrl || undefined;
    profile.socialUrl = socialUrl || undefined;
  }

  await em.persistAndFlush(profile);

  return NextResponse.json({
    data: {
      id: profile.id,
      communityName: profile.communityName,
      description: profile.description,
      logoUrl: profile.logoUrl || null,
      websiteUrl: profile.websiteUrl || null,
      socialUrl: profile.socialUrl || null,
    },
  });
}
