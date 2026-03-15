import { Entity, ManyToOne, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { User } from "./User";

@Entity({ tableName: "community_profile", entityName: "CommunityProfile" })
export class CommunityProfile {
  [OptionalProps]?: "createdAt" | "description" | "logoUrl" | "websiteUrl" | "socialUrl";

  @PrimaryKey({ type: "int" })
  id!: number;

  @ManyToOne(() => User, { unique: true })
  user!: User;

  @Property({ type: "string" })
  communityName!: string;

  @Property({ type: "text", default: "" })
  description: string = "";

  @Property({ type: "string", nullable: true })
  logoUrl?: string;

  @Property({ type: "string", nullable: true })
  websiteUrl?: string;

  @Property({ type: "string", nullable: true })
  socialUrl?: string;

  @Property({ type: "Date" })
  createdAt: Date = new Date();
}
