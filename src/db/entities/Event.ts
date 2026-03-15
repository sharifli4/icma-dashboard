import { Entity, ManyToOne, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { User } from "./User";

@Entity({ tableName: "event" })
export class CommunityEvent {
  [OptionalProps]?: "createdAt" | "description" | "bannerUrl" | "registrationUrl" | "hackathonEnabled" | "upvotes" | "status" | "location";

  @PrimaryKey()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @Property()
  title!: string;

  @Property({ type: "text", default: "" })
  description: string = "";

  @Property({ nullable: true })
  bannerUrl?: string;

  @Property()
  dateTime!: Date;

  @Property()
  eventType!: string;

  @Property()
  category!: string;

  @Property({ nullable: true })
  location?: string;

  @Property({ nullable: true })
  registrationUrl?: string;

  @Property({ default: false })
  hackathonEnabled: boolean = false;

  @Property({ default: 0 })
  upvotes: number = 0;

  @Property({ default: "DRAFT" })
  status: string = "DRAFT";

  @Property()
  createdAt: Date = new Date();
}
