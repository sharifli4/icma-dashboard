import { randomUUID } from "crypto";
import { putObject } from "@/lib/s3";
import { HACKATHON_ALLOWED_VIDEO_TYPES, HACKATHON_DEFAULT_VIDEO_MAX_BYTES } from "@/shared/hackathon/constants";

const allowedVideoTypes = new Set<string>(HACKATHON_ALLOWED_VIDEO_TYPES);

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function validateVideoFile(file: File): { ok: true } | { ok: false; message: string; status: number } {
  const maxBytes = Number(process.env.HACKATHON_DEMO_VIDEO_MAX_BYTES ?? HACKATHON_DEFAULT_VIDEO_MAX_BYTES);

  if (!allowedVideoTypes.has(file.type)) {
    return { ok: false, message: "Unsupported demo video type", status: 400 };
  }

  if (Number.isFinite(maxBytes) && file.size > maxBytes) {
    return { ok: false, message: "Demo video exceeds size limit", status: 400 };
  }

  return { ok: true };
}

export async function uploadDemoVideo(params: {
  token: string;
  file: File;
}): Promise<{ objectKey: string; publicUrl: string }> {
  const safeName = sanitizeFileName(params.file.name || "demo-video");
  const objectKey = `hackathon/${params.token}/${randomUUID()}-${safeName}`;
  const body = Buffer.from(await params.file.arrayBuffer());

  return putObject({
    objectKey,
    body,
    contentType: params.file.type || "application/octet-stream",
  });
}
