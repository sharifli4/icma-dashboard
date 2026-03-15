import { MikroORM } from "@mikro-orm/postgresql";
import config from "./mikro-orm.config";

let ormPromise: Promise<MikroORM> | null = null;

async function initORM(): Promise<MikroORM> {
  console.log("[db] Initializing ORM...");

  let orm: MikroORM;
  try {
    orm = await MikroORM.init(config);
    console.log("[db] ORM initialized");
  } catch (error) {
    console.error("[db] Failed to initialize ORM:", error);
    throw error;
  }

  try {
    const migrator = orm.getMigrator();
    const pending = await migrator.getPendingMigrations();

    if (pending.length > 0) {
      console.log(`[db] Running ${pending.length} pending migration(s):`, pending.map((m) => m.name));
      await migrator.up();
      console.log("[db] Migrations complete");
    } else {
      console.log("[db] No pending migrations");
    }
  } catch (error) {
    console.error("[db] Migration failed:", error);
    throw error;
  }

  return orm;
}

export function getORM(): Promise<MikroORM> {
  if (!ormPromise) {
    ormPromise = initORM();
  }
  return ormPromise;
}

