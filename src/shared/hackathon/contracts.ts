export interface CreateHackathonSessionInput {
  eventId: string;
  startDate: string;
  endDate: string;
}

export interface HackathonSessionData {
  id: number;
  eventId: string;
  token: string;
  submitPath: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface CreateHackathonSessionResult extends HackathonSessionData {
  qrCodeSvg: string;
}

export interface CreateHackathonSubmissionInput {
  projectName: string;
  team: string;
  demoUrl: string;
  githubUrl: string;
  demoVideo: File;
}

export interface HackathonSubmissionData {
  id: number;
  sessionId: number;
  projectName: string;
  team: string;
  demoUrl: string;
  demoVideoUrl: string;
  githubUrl: string;
  createdAt: string;
}
