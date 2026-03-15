import { Collection, EntitySchema } from "@mikro-orm/core";
import type { HackathonProjectSubmission } from "./HackathonProjectSubmission";

export interface HackathonSubmissionSession {
  id: number;
  eventName: string;
  token: string;
  submitPath: string;
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
  submissions?: Collection<HackathonProjectSubmission>;
}

export const HackathonSubmissionSessionSchema = new EntitySchema<HackathonSubmissionSession>({
  name: "HackathonSubmissionSession",
  tableName: "hackathon_submission_session",
  properties: {
    id: { type: "int", primary: true },
    eventName: { type: "string" },
    token: { type: "string", unique: true, length: 64 },
    submitPath: { type: "string", unique: true },
    startDate: { type: "Date" },
    endDate: { type: "Date" },
    createdAt: { type: "Date", onCreate: () => new Date() },
    submissions: { kind: "1:m", entity: "HackathonProjectSubmission", mappedBy: "session" },
  },
});
