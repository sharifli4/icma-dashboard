import { MikroORM } from "@mikro-orm/postgresql";
import config from "./mikro-orm.config";

let ormPromise: Promise<MikroORM> | null = null;

async function initORM(): Promise<MikroORM> {
  const orm = await MikroORM.init(config);

  const migrator = orm.getMigrator();
  const pending = await migrator.getPendingMigrations();

  if (pending.length > 0) {
    console.log(`[db] Running ${pending.length} pending migration(s)...`);
    await migrator.up();
    console.log("[db] Migrations complete");
  }

  return orm;
}

export function getORM(): Promise<MikroORM> {
  if (!ormPromise) {
    ormPromise = initORM();
  }
  return ormPromise;
}

