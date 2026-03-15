import { randomBytes } from "crypto";
import { getORM } from "@/db";
import { HackathonSubmissionSession } from "@/db/entities/HackathonSubmissionSession";
import type {
  CreateHackathonSessionInput,
  CreateHackathonSessionResult,
  HackathonSessionData,
} from "@/shared/hackathon/contracts";
import { HACKATHON_SUBMIT_PATH_PREFIX } from "@/shared/hackathon/constants";
import { toQrSvg } from "@/lib/hackathon/qr";
import { nonEmptyString, parseDate } from "@/lib/hackathon/validation";
import { HackathonServiceError } from "./errors";

function createToken(): string {
  return randomBytes(24).toString("hex");
}

function toSessionData(session: HackathonSubmissionSession): HackathonSessionData {
  return {
    id: session.id,
    eventId: session.eventId,
    token: session.token,
    submitPath: session.submitPath,
    startDate: session.startDate.toISOString(),
    endDate: session.endDate.toISOString(),
    createdAt: session.createdAt.toISOString(),
  };
}

export async function createSession(input: CreateHackathonSessionInput): Promise<CreateHackathonSessionResult> {
  if (!nonEmptyString(input.eventId)) {
    throw new HackathonServiceError("eventId is required", 400);
  }

  const startDate = parseDate(input.startDate);
  const endDate = parseDate(input.endDate);
  if (!startDate || !endDate) {
    throw new HackathonServiceError("startDate and endDate must be valid dates", 400);
  }

  if (endDate <= startDate) {
    throw new HackathonServiceError("endDate must be after startDate", 400);
  }

  const token = createToken();
  const submitPath = `${HACKATHON_SUBMIT_PATH_PREFIX}/${token}`;

  const orm = await getORM();
  const em = orm.em.fork();
  const session = em.create(HackathonSubmissionSession, {
    eventId: input.eventId.trim(),
    token,
    submitPath,
    startDate,
    endDate,
  });

  await em.persistAndFlush(session);
  const qrCodeSvg = await toQrSvg(submitPath);

  return {
    ...toSessionData(session),
    qrCodeSvg,
  };
}

export async function getSessionById(idRaw: string): Promise<HackathonSessionData> {
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id < 1) {
    throw new HackathonServiceError("Invalid session id", 400);
  }

  const orm = await getORM();
  const em = orm.em.fork();
  const session = await em.findOne(HackathonSubmissionSession, { id });
  if (!session) {
    throw new HackathonServiceError("Session not found", 404);
  }

  return toSessionData(session);
}
