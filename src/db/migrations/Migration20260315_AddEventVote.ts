import { Migration } from "@mikro-orm/migrations";

export class Migration20260315_AddEventVote extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "event_vote" (
        "id" SERIAL PRIMARY KEY,
        "event_id" INT NOT NULL REFERENCES "event"("id") ON DELETE CASCADE,
        "ip_address" VARCHAR(45) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE ("event_id", "ip_address")
      );
    `);

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "idx_event_vote_event_id" ON "event_vote"("event_id");
      CREATE INDEX IF NOT EXISTS "idx_event_vote_ip_address" ON "event_vote"("ip_address");
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "event_vote" CASCADE;`);
  }
}
