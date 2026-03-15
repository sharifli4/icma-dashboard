import { Entity, ManyToOne, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class HackathonProjectSubmission {
  [OptionalProps]?: "createdAt";

  @PrimaryKey()
  id!: number;

  @ManyToOne("HackathonSubmissionSession")
  session!: unknown;

  @Property()
  projectName!: string;

  @Property()
  team!: string;

  @Property()
  demoUrl!: string;

  @Property()
  demoVideoObjectKey!: string;

  @Property()
  demoVideoPublicUrl!: string;

  @Property()
  githubUrl!: string;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;
}
