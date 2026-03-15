import { defineConfig } from "@mikro-orm/postgresql";
import { Migrator } from "@mikro-orm/migrations";
import { User } from "./entities/User";
import { HackathonSubmissionSession } from "./entities/HackathonSubmissionSession";
import { HackathonProjectSubmission } from "./entities/HackathonProjectSubmission";
import { CommunityProfile } from "./entities/CommunityProfile";
import { CommunityEvent } from "./entities/Event";
import { migrations } from "./migrations";

export default defineConfig({
  entities: [User, HackathonSubmissionSession, HackathonProjectSubmission, CommunityProfile, CommunityEvent],
  clientUrl: process.env.DATABASE_URL,
  driverOptions: {
    connection: {
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : { rejectUnauthorized: false },
    },
  },
  extensions: [Migrator],
  migrations: {
    migrationsList: migrations,
    tableName: "mikro_orm_migrations",
    transactional: true,
    allOrNothing: true,
  },
});
