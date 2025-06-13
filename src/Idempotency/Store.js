import { GetDb, GetTimestamp, UUID } from "../Utils";

export default class IdempotencyStore {
  static async CreateKey(requestId, ttlMs) {
    const key = UUID();
    const expiresAt = ttlMs ? GetTimestamp() + ttlMs : null;
    const db = await GetDb();
    await db.put(STORE_NAME, { key, expiresAt }, `${requestId}::meta`);
    return key;
  }

  static async GetKey(requestId) {
    const db = await GetDb();
    const meta = await db.get(STORE_NAME, `${requestId}::meta`);
    if (!meta) return null;
    if (meta.expiresAt && meta.expiresAt < GetTimestamp()) {
      await this.Clear(requestId);
      return null;
    }
    return meta.key;
  }

  static async SaveResponse(requestId, responseData) {
    const db = await GetDb();
    await db.put(
      STORE_NAME,
      { responseData, savedAt: GetTimestamp() },
      `${requestId}::response`
    );
  }

  static async GetResponse(requestId) {
    const db = await GetDb();
    const data = await db.get(STORE_NAME, `${requestId}::response`);
    return data?.responseData || null;
  }

  static async Clear(requestId) {
    const db = await GetDb();
    await db.delete(STORE_NAME, `${requestId}::meta`);
    await db.delete(STORE_NAME, `${requestId}::response`);
  }

  static async ExportStore() {
    const db = await GetDb();
    const all = {};
    for await (const cursor of db.transaction(STORE_NAME).store) {
      all[cursor.key] = cursor.value;
    }
    return JSON.stringify(all);
  }

  static async ImportStore(jsonData) {
    const db = await GetDb();
    const data = JSON.parse(jsonData);
    const tx = db.transaction(STORE_NAME, "readwrite");
    for (const [key, value] of Object.entries(data)) {
      tx.store.put(value, key);
    }
    await tx.done;
  }

  static async AutoCleanup(thresholdMs = 7 * 24 * 60 * 60 * 1000) {
    const now = GetTimestamp();
    const db = await GetDb();
    const tx = db.transaction(STORE_NAME, "readwrite");
    for await (const cursor of tx.store) {
      if (cursor.key.endsWith("::meta")) {
        const { expiresAt } = cursor.value;
        if (expiresAt && expiresAt < now) cursor.delete();
      }
      if (cursor.key.endsWith("::response")) {
        const { savedAt } = cursor.value;
        if (savedAt && now - savedAt > thresholdMs) cursor.delete();
      }
    }
    await tx.done;
  }
}
