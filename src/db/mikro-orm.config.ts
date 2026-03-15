import { defineConfig } from "@mikro-orm/postgresql";
import { User } from "./entities/User";
import { HackathonSubmissionSession } from "./entities/HackathonSubmissionSession";
import { HackathonProjectSubmission } from "./entities/HackathonProjectSubmission";
import { CommunityProfile } from "./entities/CommunityProfile";
import { CommunityEvent } from "./entities/Event";

export default defineConfig({
  entities: [User, HackathonSubmissionSession, HackathonProjectSubmission, CommunityProfile, CommunityEvent],
  clientUrl: process.env.DATABASE_URL,
  driverOptions: {
    connection: {
      ssl: { rejectUnauthorized: false },
    },
  },
});
