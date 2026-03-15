import { EntitySchema } from "@mikro-orm/core";
import type { CommunityEvent } from "./Event";

export interface EventVote {
  id: number;
  event: CommunityEvent;
  ipAddress: string;
  createdAt?: Date;
}

export const EventVoteSchema = new EntitySchema<EventVote>({
  name: "EventVote",
  tableName: "event_vote",
  uniques: [{ properties: ["event", "ipAddress"] }],
  properties: {
    id: { type: "int", primary: true },
    event: { kind: "m:1", entity: "CommunityEvent" },
    ipAddress: { type: "string" },
    createdAt: { type: "Date", onCreate: () => new Date() },
  },
});
