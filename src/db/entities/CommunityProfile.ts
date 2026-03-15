import { Entity, ManyToOne, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { User } from "./User";

@Entity()
export class CommunityProfile {
  [OptionalProps]?: "createdAt" | "description" | "logoUrl" | "websiteUrl" | "socialUrl";

  @PrimaryKey()
  id!: number;

  @ManyToOne(() => User, { unique: true })
  user!: User;

  @Property()
  communityName!: string;

  @Property({ type: "text", default: "" })
  description: string = "";

  @Property({ nullable: true })
  logoUrl?: string;

  @Property({ nullable: true })
  websiteUrl?: string;

  @Property({ nullable: true })
  socialUrl?: string;

  @Property()
  createdAt: Date = new Date();
}
