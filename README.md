# Idempotency Store Frontend Guide

This document explains how to use the `IdempotencyStore` class in the frontend. This class is designed to help manage and persist idempotency keys and responses locally (e.g., in IndexedDB) to avoid duplicate submissions or calls.

---

## Languages Supported

* [عربي](https://github.com/FutureSolutionDev/idempotency-client/tree/main/docs/ar.md)
* [English](https://github.com/FutureSolutionDev/idempotency-client/tree/main/docs/en.md)

---

## What is Idempotency?

Idempotency means that repeating the same action multiple times will always result in the same outcome. In frontend applications, this ensures that retrying a request (like submitting a form) won’t cause duplication.

This utility is useful for cases like:

* Payment or checkout submissions
* Form submissions
* Offline caching of server responses

---

## Why Use Idempotency?

* Avoiding duplicate requests
* Ensuring idempotent responses
* Optimizing performance
* Enhancing user experience

---

## Backend Compatibility ?

This library is compatible with the backend Idempotency Middleware, which ensures that the same request is processed only once and returns the same result.
[Read the Backend Guide](https://github.com/FutureSolutionDev/idempotency-backend)

---

## Installation

```bash
npm install idempotency-client
```

* `UUID()` - generates a unique identifier

---

## Core Methods

### `CreateKey(requestId: string, ttlMs?: number): Promise<string>`

Creates a new idempotency key for a request, with optional TTL.

### `GetKey(requestId: string): Promise<string | null>`

Returns the stored key for the given request if it's not expired.

### `SaveResponse(requestId: string, responseData: any): Promise<void>`

Saves the response data associated with the requestId.

### `GetResponse(requestId: string): Promise<any>`

Retrieves cached response data if it exists.

### `Clear(requestId: string): Promise<void>`

Deletes the stored key and response for the given requestId.

### `ExportStore(): Promise<string>`

Exports all saved data as JSON (useful for backup).

### `ImportStore(jsonData: string): Promise<void>`

Restores data from a JSON string.

### `AutoCleanup(thresholdMs?: number): Promise<void>`

Removes expired entries automatically (default is 7 days).

---

## Example Usage

```ts
import IdempotencyStore from 'idempotency-client';

async function handleFormSubmit() {
  const requestId = 'submit::formA';
  const key = await IdempotencyStore.CreateKey(requestId, 60000);
  const existing = await IdempotencyStore.GetResponse(requestId);
  if (existing) {
    renderFromCache(existing);
    return;
  }
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Idempotency-Key': key },
    body: JSON.stringify(data)
  });
  const result = await response.json();
  await IdempotencyStore.SaveResponse(requestId, result);
  renderResponse(result);
}
```

---

## Notes

* Ensure the server supports idempotency via headers.
* `requestId` should uniquely represent the logical request.
* Run `AutoCleanup()` periodically to prevent storage bloat.

---

## Summary

This store is a reliable, frontend-safe mechanism for caching request outcomes and safely retrying operations without duplication.

