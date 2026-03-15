import { Entity, ManyToOne, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { User } from "./User";

@Entity({ tableName: "event" })
export class CommunityEvent {
  [OptionalProps]?: "createdAt" | "description" | "bannerUrl" | "registrationUrl" | "hackathonEnabled" | "upvotes" | "status" | "location";

  @PrimaryKey({ type: "int" })
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @Property({ type: "string" })
  title!: string;

  @Property({ type: "text", default: "" })
  description: string = "";

  @Property({ type: "string", nullable: true })
  bannerUrl?: string;

  @Property({ type: "Date" })
  dateTime!: Date;

  @Property({ type: "string" })
  eventType!: string;

  @Property({ type: "string" })
  category!: string;

  @Property({ type: "string", nullable: true })
  location?: string;

  @Property({ type: "string", nullable: true })
  registrationUrl?: string;

  @Property({ type: "boolean", default: false })
  hackathonEnabled: boolean = false;

  @Property({ type: "int", default: 0 })
  upvotes: number = 0;

  @Property({ type: "string", default: "DRAFT" })
  status: string = "DRAFT";

  @Property({ type: "Date" })
  createdAt: Date = new Date();
}
