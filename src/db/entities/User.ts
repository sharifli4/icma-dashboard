import { EntitySchema } from "@mikro-orm/core";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
}

export const UserSchema = new EntitySchema<User>({
  name: "User",
  tableName: "user",
  properties: {
    id: { type: "int", primary: true },
    name: { type: "string" },
    email: { type: "string", unique: true },
    password: { type: "string" },
    createdAt: { type: "Date", onCreate: () => new Date() },
  },
});
