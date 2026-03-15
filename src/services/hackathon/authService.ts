import { timingSafeEqual } from "crypto";
import { HACKATHON_ADMIN_HEADER } from "@/shared/hackathon/constants";
import { HackathonServiceError } from "./errors";

export function verifyHackathonAdmin(providedApiKey: string | null): void {
  const configuredKey = process.env.HACKATHON_ADMIN_API_KEY;
  if (!configuredKey) {
    return;
  }

  if (!providedApiKey || providedApiKey.length !== configuredKey.length || 
      !timingSafeEqual(Buffer.from(providedApiKey), Buffer.from(configuredKey))) {
    throw new HackathonServiceError("Unauthorized", 401);
  }
}

export function readHackathonAdminHeader(request: Request): string | null {
  return request.headers.get(HACKATHON_ADMIN_HEADER);
}
