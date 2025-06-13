import IdempotencyStore  from "./Store";
export default class IdempotencySession {
  #requestId;
  /**
   * Creates a new IdempotencySession instance
   *
   * @param {string} requestId - The ID to use for this session
   */
  constructor(requestId) {
    this.#requestId = requestId;
  }

  /**
   * Creates a new idempotency key for the current session.
   *
   * @param {number} [ttlMs] - The TTL for the key in milliseconds. If not provided, the key will not expire.
   *
   * @return {Promise<string>} The new idempotency key.
   */
  async CreateKey(ttlMs) {
    return await IdempotencyStore.CreateKey(this.#requestId, ttlMs);
  }

  /**
   * Retrieves the idempotency key for the current session.
   *
   * @return {Promise<string|null>} The idempotency key if it exists, otherwise null.
   */

  async GetKey() {
    return await IdempotencyStore.GetKey(this.#requestId);
  }

  /**
   * Saves the given response data to the idempotency store.
   *
   * @param {unknown} responseData - The response data to save.
   *
   * @return {Promise<void>} A promise that resolves when the data is saved.
   */
  async SaveResponse(responseData) {
    return await IdempotencyStore.SaveResponse(this.#requestId, responseData);
  }

  /**
   * Retrieves the cached response for the current session.
   *
   * @return {Promise<unknown|null>} The cached response if it exists, otherwise null.
   */
  async GetResponse() {
    return await IdempotencyStore.GetResponse(this.#requestId);
  }

  /**
   * Clears the idempotency key and cached response for the current session.
   *
   * @return {Promise<void>} A promise that resolves when the data is cleared.
   */
  async Clear() {
    return await IdempotencyStore.Clear(this.#requestId);
  }

  /**
   * Exports the idempotency store to a JSON string.
   *
   * @return {Promise<string>} A promise that resolves to the JSON string
   *   representation of the idempotency store.
   */
  async ExportSession() {
    return await IdempotencyStore.ExportStore();
  }

  /**
   * Imports the idempotency store from a JSON string.
   *
   * @param {string} jsonData - The JSON string to import.
   *
   * @return {Promise<void>} A promise that resolves when the import is complete.
   */
  async importSession(jsonData) {
    return await IdempotencyStore.ImportStore(jsonData);
  }
}
