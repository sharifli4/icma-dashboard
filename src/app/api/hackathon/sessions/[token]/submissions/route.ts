import { NextRequest, NextResponse } from "next/server";
import { getORM } from "@/db";
import { HackathonProjectSubmission } from "@/db/entities/HackathonProjectSubmission";
import { HackathonSubmissionSession } from "@/db/entities/HackathonSubmissionSession";
import { uploadDemoVideo, validateVideoFile } from "@/lib/hackathon/upload";
import { isValidUrl, nonEmptyString } from "@/lib/hackathon/validation";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ token: string }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  const { token } = await params;
  if (!nonEmptyString(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const orm = await getORM();
  const em = orm.em.fork();
  const session = await em.findOne(HackathonSubmissionSession, { token });

  if (!session) {
    return NextResponse.json({ error: "Submission session not found" }, { status: 404 });
  }

  const now = new Date();
  if (now < session.startDate || now > session.endDate) {
    return NextResponse.json({ error: "Submission session is not active" }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart form data" }, { status: 400 });
  }

  const projectName = formData.get("projectName");
  const team = formData.get("team");
  const demoUrl = formData.get("demoUrl");
  const githubUrl = formData.get("githubUrl");
  const demoVideo = formData.get("demoVideo");

  if (!nonEmptyString(projectName) || !nonEmptyString(team)) {
    return NextResponse.json({ error: "projectName and team are required" }, { status: 400 });
  }

  if (!isValidUrl(demoUrl) || !isValidUrl(githubUrl)) {
    return NextResponse.json({ error: "demoUrl and githubUrl must be valid URLs" }, { status: 400 });
  }

  if (!(demoVideo instanceof File)) {
    return NextResponse.json({ error: "demoVideo file is required" }, { status: 400 });
  }

  const validVideo = validateVideoFile(demoVideo);
  if (!validVideo.ok) {
    return NextResponse.json({ error: validVideo.message }, { status: validVideo.status });
  }

  let uploadedVideo: { objectKey: string; publicUrl: string };
  try {
    uploadedVideo = await uploadDemoVideo({
      token: session.token,
      file: demoVideo,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const submission = em.create(HackathonProjectSubmission, {
    session,
    projectName: projectName.trim(),
    team: team.trim(),
    demoUrl,
    demoVideoObjectKey: uploadedVideo.objectKey,
    demoVideoPublicUrl: uploadedVideo.publicUrl,
    githubUrl,
  });

  await em.persistAndFlush(submission);

  return NextResponse.json(
    {
      data: {
        id: submission.id,
        sessionId: session.id,
        projectName: submission.projectName,
        team: submission.team,
        demoUrl: submission.demoUrl,
        demoVideoUrl: submission.demoVideoPublicUrl,
        githubUrl: submission.githubUrl,
        createdAt: submission.createdAt.toISOString(),
      },
    },
    { status: 201 }
  );
}
