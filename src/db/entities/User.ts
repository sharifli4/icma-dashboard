import { Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class User {
  [OptionalProps]?: "createdAt";

  @PrimaryKey({ type: "number" })
  id!: number;

  @Property({ type: "string" })
  name!: string;

  @Property({ type: "string", unique: true })
  email!: string;

  @Property({ type: "string" })
  password!: string;

  @Property({ type: "Date" })
  createdAt: Date = new Date();
}
