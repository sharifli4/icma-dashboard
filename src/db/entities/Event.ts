import { EntitySchema } from "@mikro-orm/core";
import type { User } from "./User";

export interface CommunityEvent {
  id: number;
  user: User;
  title: string;
  description?: string;
  bannerUrl?: string;
  dateTime: Date;
  eventType: string;
  category: string;
  location?: string;
  registrationUrl?: string;
  hackathonEnabled?: boolean;
  upvotes?: number;
  status?: string;
  createdAt?: Date;
}

export const CommunityEventSchema = new EntitySchema<CommunityEvent>({
  name: "CommunityEvent",
  tableName: "event",
  properties: {
    id: { type: "int", primary: true },
    user: { kind: "m:1", entity: "User" },
    title: { type: "string" },
    description: { type: "text", default: "" },
    bannerUrl: { type: "string", nullable: true },
    dateTime: { type: "Date" },
    eventType: { type: "string" },
    category: { type: "string" },
    location: { type: "string", nullable: true },
    registrationUrl: { type: "string", nullable: true },
    hackathonEnabled: { type: "boolean", default: false },
    upvotes: { type: "int", default: 0 },
    status: { type: "string", default: "DRAFT" },
    createdAt: { type: "Date", onCreate: () => new Date() },
  },
});
