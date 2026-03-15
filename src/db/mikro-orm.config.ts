import { defineConfig } from "@mikro-orm/postgresql";
import { Migrator } from "@mikro-orm/migrations";
import { UserSchema } from "./entities/User";
import { HackathonSubmissionSessionSchema } from "./entities/HackathonSubmissionSession";
import { HackathonProjectSubmissionSchema } from "./entities/HackathonProjectSubmission";
import { CommunityProfileSchema } from "./entities/CommunityProfile";
import { CommunityEventSchema } from "./entities/Event";
import { migrations } from "./migrations";

export default defineConfig({
  entities: [UserSchema, HackathonSubmissionSessionSchema, HackathonProjectSubmissionSchema, CommunityProfileSchema, CommunityEventSchema],
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
