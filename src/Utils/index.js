import { openDB } from "./src/utils/IDB";
const DB_NAME = "Idempotency-Db";
const STORE_NAME = "Idempotency-keys";
let Db;

/**
 * Generates a random UUID (Universally Unique Identifier) as a string.
 * @returns {string} A UUID string
 */
function UUID() {
  return crypto.randomUUID();
}

async function GetDb() {
  if (!Db) {
    Db = openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME);
      },
    });
  }
  return Db;
}

function GetTimestamp() {
  return Date.now();
}

export {
    UUID,
    GetDb,
    GetTimestamp
}
