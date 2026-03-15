import { EntitySchema } from "@mikro-orm/core";
import type { User } from "./User";

export interface CommunityProfile {
  id: number;
  user: User;
  communityName: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  socialUrl?: string;
  createdAt?: Date;
}

export const CommunityProfileSchema = new EntitySchema<CommunityProfile>({
  name: "CommunityProfile",
  tableName: "community_profile",
  properties: {
    id: { type: "int", primary: true },
    user: { kind: "m:1", entity: "User", unique: true },
    communityName: { type: "string" },
    description: { type: "text", default: "" },
    logoUrl: { type: "string", nullable: true },
    websiteUrl: { type: "string", nullable: true },
    socialUrl: { type: "string", nullable: true },
    createdAt: { type: "Date", onCreate: () => new Date() },
  },
});
