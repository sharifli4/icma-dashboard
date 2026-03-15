import { Migration } from "@mikro-orm/migrations";

export class Migration20260315_Initial extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    this.addSql(`
      CREATE TABLE IF NOT EXISTS "community_profile" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INT NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
        "community_name" VARCHAR(255) NOT NULL,
        "description" TEXT NOT NULL DEFAULT '',
        "logo_url" VARCHAR(255),
        "website_url" VARCHAR(255),
        "social_url" VARCHAR(255),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    this.addSql(`
      CREATE TABLE IF NOT EXISTS "event" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT NOT NULL DEFAULT '',
        "banner_url" VARCHAR(255),
        "date_time" TIMESTAMPTZ NOT NULL,
        "event_type" VARCHAR(255) NOT NULL,
        "category" VARCHAR(255) NOT NULL,
        "location" VARCHAR(255),
        "registration_url" VARCHAR(255),
        "hackathon_enabled" BOOLEAN NOT NULL DEFAULT FALSE,
        "upvotes" INT NOT NULL DEFAULT 0,
        "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "idx_event_user_id" ON "event"("user_id");
      CREATE INDEX IF NOT EXISTS "idx_event_status" ON "event"("status");
      CREATE INDEX IF NOT EXISTS "idx_event_date_time" ON "event"("date_time");
    `);

    this.addSql(`
      CREATE TABLE IF NOT EXISTS "hackathon_submission_session" (
        "id" SERIAL PRIMARY KEY,
        "event_name" VARCHAR(255) NOT NULL,
        "token" VARCHAR(64) NOT NULL UNIQUE,
        "submit_path" VARCHAR(255) NOT NULL UNIQUE,
        "start_date" TIMESTAMPTZ NOT NULL,
        "end_date" TIMESTAMPTZ NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "idx_hackathon_session_token" ON "hackathon_submission_session"("token");
    `);

    this.addSql(`
      CREATE TABLE IF NOT EXISTS "hackathon_project_submission" (
        "id" SERIAL PRIMARY KEY,
        "session_id" INT NOT NULL REFERENCES "hackathon_submission_session"("id") ON DELETE CASCADE,
        "project_name" VARCHAR(255) NOT NULL,
        "team" VARCHAR(255) NOT NULL,
        "demo_url" VARCHAR(500) NOT NULL,
        "demo_video_object_key" VARCHAR(500) NOT NULL,
        "demo_video_public_url" VARCHAR(500) NOT NULL,
        "github_url" VARCHAR(500) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "idx_hackathon_submission_session_id" ON "hackathon_project_submission"("session_id");
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_hackathon_submission_session_team" ON "hackathon_project_submission"("session_id", "team");
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "hackathon_project_submission" CASCADE;`);
    this.addSql(`DROP TABLE IF EXISTS "hackathon_submission_session" CASCADE;`);
    this.addSql(`DROP TABLE IF EXISTS "event" CASCADE;`);
    this.addSql(`DROP TABLE IF EXISTS "community_profile" CASCADE;`);
    this.addSql(`DROP TABLE IF EXISTS "user" CASCADE;`);
  }
}
