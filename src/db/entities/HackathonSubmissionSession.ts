import { Collection, Entity, OneToMany, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import type { HackathonProjectSubmission } from "./HackathonProjectSubmission";

@Entity()
export class HackathonSubmissionSession {
  [OptionalProps]?: "createdAt";

  @PrimaryKey({ type: "int" })
  id!: number;

  @Property({ type: "string" })
  eventName!: string;

  @Property({ type: "string", unique: true, length: 64 })
  token!: string;

  @Property({ type: "string", unique: true })
  submitPath!: string;

  @Property({ type: "Date" })
  startDate!: Date;

  @Property({ type: "Date" })
  endDate!: Date;

  @Property({ type: "Date", onCreate: () => new Date() })
  createdAt!: Date;

  @OneToMany("HackathonProjectSubmission", "session")
  submissions = new Collection<HackathonProjectSubmission>(this);
}
