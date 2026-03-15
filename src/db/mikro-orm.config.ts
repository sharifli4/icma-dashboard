import { defineConfig } from "@mikro-orm/postgresql";
import { User } from "./entities/User";
import { HackathonSubmissionSession } from "./entities/HackathonSubmissionSession";
import { HackathonProjectSubmission } from "./entities/HackathonProjectSubmission";

export default defineConfig({
  entities: [User, HackathonSubmissionSession, HackathonProjectSubmission],
  clientUrl: process.env.DATABASE_URL,
});
