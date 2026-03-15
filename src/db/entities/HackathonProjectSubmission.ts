import { EntitySchema } from "@mikro-orm/core";
import type { HackathonSubmissionSession } from "./HackathonSubmissionSession";

export interface HackathonProjectSubmission {
  id: number;
  session: HackathonSubmissionSession;
  projectName: string;
  team: string;
  demoUrl: string;
  demoVideoObjectKey: string;
  demoVideoPublicUrl: string;
  githubUrl: string;
  createdAt?: Date;
}

export const HackathonProjectSubmissionSchema = new EntitySchema<HackathonProjectSubmission>({
  name: "HackathonProjectSubmission",
  tableName: "hackathon_project_submission",
  properties: {
    id: { type: "int", primary: true },
    session: { kind: "m:1", entity: "HackathonSubmissionSession" },
    projectName: { type: "string" },
    team: { type: "string" },
    demoUrl: { type: "string" },
    demoVideoObjectKey: { type: "string" },
    demoVideoPublicUrl: { type: "string" },
    githubUrl: { type: "string" },
    createdAt: { type: "Date", onCreate: () => new Date() },
  },
});
