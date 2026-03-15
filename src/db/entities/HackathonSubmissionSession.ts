import { Collection, Entity, OneToMany, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { HackathonProjectSubmission } from "./HackathonProjectSubmission";

@Entity()
export class HackathonSubmissionSession {
  [OptionalProps]?: "createdAt";

  @PrimaryKey()
  id!: number;

  @Property()
  eventId!: string;

  @Property({ unique: true, length: 64 })
  token!: string;

  @Property({ unique: true })
  submitPath!: string;

  @Property()
  startDate!: Date;

  @Property()
  endDate!: Date;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @OneToMany(() => HackathonProjectSubmission, (s) => s.session)
  submissions = new Collection<HackathonProjectSubmission>(this);
}
