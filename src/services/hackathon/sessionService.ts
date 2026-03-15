import { randomBytes } from "crypto";
import { getORM } from "@/db";
import { HackathonSubmissionSession } from "@/db/entities/HackathonSubmissionSession";
import type {
  CreateHackathonSessionInput,
  CreateHackathonSessionResult,
  HackathonSessionData,
  HackathonSessionStatus,
} from "@/shared/hackathon/contracts";
import { HACKATHON_SUBMIT_PATH_PREFIX } from "@/shared/hackathon/constants";
import { toQrSvg } from "@/lib/qr";
import { nonEmptyString, parseDate } from "@/lib/validation";
import { HackathonServiceError } from "./errors";

function createToken(): string {
  return randomBytes(24).toString("hex");
}

function toSessionData(session: HackathonSubmissionSession): HackathonSessionData {
  return {
    id: session.id,
    eventName: session.eventName,
    token: session.token,
    submitPath: session.submitPath,
    startDate: session.startDate.toISOString(),
    endDate: session.endDate.toISOString(),
    createdAt: session.createdAt.toISOString(),
  };
}

export async function createSession(input: CreateHackathonSessionInput): Promise<CreateHackathonSessionResult> {
  if (!nonEmptyString(input.eventName)) {
    throw new HackathonServiceError("eventName is required", 400);
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
    eventName: input.eventName.trim(),
    token,
    submitPath,
    startDate,
    endDate,
  });

  await em.persist(session).flush();
  const qrCodeSvg = await toQrSvg(submitPath);

  return {
    ...toSessionData(session),
    qrCodeSvg,
  };
}

export async function listSessions(): Promise<HackathonSessionData[]> {
  const orm = await getORM();
  const em = orm.em.fork();
  const sessions = await em.findAll(HackathonSubmissionSession, { orderBy: { createdAt: "DESC" } });
  return sessions.map(toSessionData);
}

export async function getSession(idOrToken: string): Promise<HackathonSessionData> {
  if (!nonEmptyString(idOrToken)) {
    throw new HackathonServiceError("Session id or token is required", 400);
  }

  const orm = await getORM();
  const em = orm.em.fork();

  const numericId = Number(idOrToken);
  const where =
    Number.isInteger(numericId) && numericId > 0
      ? { id: numericId }
      : { token: idOrToken };

  const session = await em.findOne(HackathonSubmissionSession, where);
  if (!session) {
    throw new HackathonServiceError("Session not found", 404);
  }

  return toSessionData(session);
}

export async function getSessionStatus(token: string): Promise<HackathonSessionStatus> {
  if (!nonEmptyString(token)) {
    throw new HackathonServiceError("Token is required", 400);
  }

  const orm = await getORM();
  const em = orm.em.fork();

  const session = await em.findOne(HackathonSubmissionSession, { token });
  if (!session) {
    throw new HackathonServiceError("Session not found", 404);
  }

  const now = new Date();
  const isActive = now >= session.startDate && now <= session.endDate;

  return {
    eventName: session.eventName,
    startDate: session.startDate.toISOString(),
    endDate: session.endDate.toISOString(),
    isActive,
  };
}
