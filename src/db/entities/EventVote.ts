import { Entity, ManyToOne, OptionalProps, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import { CommunityEvent } from "./Event";

@Entity({ tableName: "event_vote" })
@Unique({ properties: ["event", "ipAddress"] })
export class EventVote {
  [OptionalProps]?: "createdAt";

  @PrimaryKey()
  id!: number;

  @ManyToOne(() => CommunityEvent)
  event!: CommunityEvent;

  @Property()
  ipAddress!: string;

  @Property()
  createdAt: Date = new Date();
}
