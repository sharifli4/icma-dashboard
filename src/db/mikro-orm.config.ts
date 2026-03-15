import { defineConfig } from "@mikro-orm/postgresql";
import { User } from "./entities/User";

export default defineConfig({
  entities: [User],
  clientUrl: process.env.DATABASE_URL,
});
