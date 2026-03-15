import { NextRequest, NextResponse } from "next/server";
import { verifyHackathonAdmin, readHackathonAdminHeader } from "@/services/hackathon/authService";
import { HackathonServiceError } from "@/services/hackathon/errors";
import { createSubmissionByToken, listSubmissionsByToken } from "@/services/hackathon/submissionService";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ token: string }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  try {
    verifyHackathonAdmin(readHackathonAdminHeader(request));
    const { token } = await params;
    const data = await listSubmissionsByToken(token);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof HackathonServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { token } = await params;
    const formData = await request.formData();
    const projectName = formData.get("projectName");
    const team = formData.get("team");
    const demoUrl = formData.get("demoUrl");
    const githubUrl = formData.get("githubUrl");
    const demoVideo = formData.get("demoVideo");

    if (!(demoVideo instanceof File)) {
      throw new HackathonServiceError("demoVideo file is required", 400);
    }

    const data = await createSubmissionByToken(token, {
      projectName: typeof projectName === "string" ? projectName : "",
      team: typeof team === "string" ? team : "",
      demoUrl: typeof demoUrl === "string" ? demoUrl : "",
      githubUrl: typeof githubUrl === "string" ? githubUrl : "",
      demoVideo,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof HackathonServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof TypeError) {
      return NextResponse.json({ error: "Invalid multipart form data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
