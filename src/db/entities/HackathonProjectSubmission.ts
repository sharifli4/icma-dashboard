import { Entity, ManyToOne, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { HackathonSubmissionSession } from "./HackathonSubmissionSession";

@Entity()
export class HackathonProjectSubmission {
  [OptionalProps]?: "createdAt";

  @PrimaryKey({ type: "number" })
  id!: number;

  @ManyToOne(() => HackathonSubmissionSession)
  session!: HackathonSubmissionSession;

  @Property({ type: "string" })
  projectName!: string;

  @Property({ type: "string" })
  team!: string;

  @Property({ type: "string" })
  demoUrl!: string;

  @Property({ type: "string" })
  demoVideoObjectKey!: string;

  @Property({ type: "string" })
  demoVideoPublicUrl!: string;

  @Property({ type: "string" })
  githubUrl!: string;

  @Property({ type: "Date", onCreate: () => new Date() })
  createdAt!: Date;
}
