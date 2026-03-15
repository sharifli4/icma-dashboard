import { MikroORM } from "@mikro-orm/postgresql";
import config from "./mikro-orm.config";

let ormPromise: Promise<MikroORM> | null = null;

export function getORM(): Promise<MikroORM> {
  if (!ormPromise) {
    ormPromise = MikroORM.init(config);
  }
  return ormPromise;
}

