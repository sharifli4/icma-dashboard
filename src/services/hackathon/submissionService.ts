import { getORM } from "@/db";
import { HackathonProjectSubmission } from "@/db/entities/HackathonProjectSubmission";
import { HackathonSubmissionSession } from "@/db/entities/HackathonSubmissionSession";
import { uploadDemoVideo, validateVideoFile } from "@/lib/hackathon/upload";
import { isValidUrl, nonEmptyString } from "@/lib/hackathon/validation";
import type { CreateHackathonSubmissionInput, HackathonSubmissionData } from "@/shared/hackathon/contracts";
import { HackathonServiceError } from "./errors";

export async function createSubmissionByToken(
  token: string,
  input: CreateHackathonSubmissionInput
): Promise<HackathonSubmissionData> {
  if (!nonEmptyString(token)) {
    throw new HackathonServiceError("Invalid token", 400);
  }

  if (!nonEmptyString(input.projectName) || !nonEmptyString(input.team)) {
    throw new HackathonServiceError("projectName and team are required", 400);
  }

  if (!isValidUrl(input.demoUrl) || !isValidUrl(input.githubUrl)) {
    throw new HackathonServiceError("demoUrl and githubUrl must be valid URLs", 400);
  }

  const validVideo = validateVideoFile(input.demoVideo);
  if (!validVideo.ok) {
    throw new HackathonServiceError(validVideo.message, validVideo.status);
  }

  const orm = await getORM();
  const em = orm.em.fork();
  const session = await em.findOne(HackathonSubmissionSession, { token });
  if (!session) {
    throw new HackathonServiceError("Submission session not found", 404);
  }

  const now = new Date();
  if (now < session.startDate || now > session.endDate) {
    throw new HackathonServiceError("Submission session is not active", 400);
  }

  let uploadedVideo: { objectKey: string; publicUrl: string };
  try {
    uploadedVideo = await uploadDemoVideo({
      token: session.token,
      file: input.demoVideo,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    throw new HackathonServiceError(message, 500);
  }

  const submission = em.create(HackathonProjectSubmission, {
    session,
    projectName: input.projectName.trim(),
    team: input.team.trim(),
    demoUrl: input.demoUrl,
    demoVideoObjectKey: uploadedVideo.objectKey,
    demoVideoPublicUrl: uploadedVideo.publicUrl,
    githubUrl: input.githubUrl,
  });

  await em.persistAndFlush(submission);

  return {
    id: submission.id,
    sessionId: session.id,
    projectName: submission.projectName,
    team: submission.team,
    demoUrl: submission.demoUrl,
    demoVideoUrl: submission.demoVideoPublicUrl,
    githubUrl: submission.githubUrl,
    createdAt: submission.createdAt.toISOString(),
  };
}
