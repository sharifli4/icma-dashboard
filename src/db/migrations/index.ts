import { Migration20260315_Initial } from "./Migration20260315_Initial";
import { Migration20260315_AddEventVote } from "./Migration20260315_AddEventVote";

export const migrations = [
  { name: "Migration20260315_Initial", class: Migration20260315_Initial },
  { name: "Migration20260315_AddEventVote", class: Migration20260315_AddEventVote },
];
