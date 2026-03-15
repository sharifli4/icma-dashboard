import { timingSafeEqual } from "crypto";
import { HACKATHON_ADMIN_HEADER } from "@/shared/hackathon/constants";
import { HackathonServiceError } from "./errors";

export function verifyHackathonAdmin(providedApiKey: string | null): void {
  const configuredKey = process.env.HACKATHON_ADMIN_API_KEY;
  if (!configuredKey) {
    throw new HackathonServiceError("Admin API key is not configured", 500);
  }

  if (!providedApiKey) {
    throw new HackathonServiceError("Unauthorized", 401);
  }

  const a = Buffer.from(providedApiKey);
  const b = Buffer.from(configuredKey);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new HackathonServiceError("Unauthorized", 401);
  }
}

export function readHackathonAdminHeader(request: Request): string | null {
  return request.headers.get(HACKATHON_ADMIN_HEADER);
}
