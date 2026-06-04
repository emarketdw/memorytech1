# Security Specification: TechMemory Firewall Spec

This document details the security constraints, relational validation invariants, and defensive validation schemas designed to protect TechMemory from unauthorized access, identity spoofing, value poisoning, and Denial of Wallet (resource exhaustion) attacks.

## 1. Data Invariants & Access Restrictions
1. **User Ownership (Strict Partitioning):** All documents across all collections (`notes`, `bookmarks`, `ideas`, `projects`, `tasks`, `reminders`, `vault`, `activity`) MUST belong to an authenticated user (`userId == request.auth.uid`). No cross-user access is permitted.
2. **Schema Invariance:** Every record written into Firestore must conform strictly to the required payload structure. Unexpected "ghost fields" (shadow schemas) will be systematically rejected.
3. **Immutability Invariant:** Once a document is created, its owner ID (`userId`) is permanently locked and cannot be edited by any update operation.
4. **Verified identity requirement:** Users must be authenticated to invoke any reads or writes.

---

## 2. The "Dirty Dozen" Toxic Payloads
These 12 malicious payloads represent attempts to compromise system auth, integrity, and wallet sizing. Our ruleset guarantees that ALL these operations fail with `PERMISSION_DENIED`.

### Payload 1: Unauthenticated Write (Identity Leak)
Attempting to create a note without a valid firebase auth token.
```json
{
  "id": "item123",
  "title": "Study Hacks",
  "category": "Estudos",
  "content": "Secret tools...",
  "favorite": false,
  "date": "2026-06-04T00:00:00Z",
  "userId": "attacker_user_id"
}
```

### Payload 2: Identity Spoofing (Write as Someone Else)
Authenticated as `user_alice` but trying to insert a note belonging to `user_bob`.
```json
{
  "id": "note987",
  "title": "Alice Diary",
  "category": "Pessoal",
  "content": "I am copying bob with my auth token",
  "favorite": false,
  "date": "2026-06-04T00:00:00Z",
  "userId": "user_bob"
}
```

### Payload 3: Shadow Update (Ghost Field Injection)
Attempting to inject a privilege escalation field `isAdmin` or `isVerified` on custom fields.
```json
{
  "id": "note111",
  "title": "Clean Note",
  "category": "Estudos",
  "content": "Normal text",
  "favorite": false,
  "date": "2026-06-04T03:00:00Z",
  "userId": "current_user_uid",
  "isVerified": true,
  "system_role": "admin"
}
```

### Payload 4: Immutable Field Hijacking (Owner Transfer)
Updating an existing note and modifying the `userId` field to a different account.
```json
// Original owner: current_user_uid. Incoming:
{
  "id": "note111",
  "title": "Change Owner Note",
  "category": "Estudos",
  "content": "Overwriting metadata",
  "favorite": false,
  "date": "2026-06-04T03:30:00Z",
  "userId": "attacker_uid"
}
```

### Payload 5: Denial of Wallet (Gigantic String Injection)
Attempting to inject a 2MB title to cause resource exhaustion.
```json
{
  "id": "note222",
  "title": "[2MB toxic string padding...]",
  "category": "Estudos",
  "content": "Valid short content",
  "favorite": false,
  "date": "2026-06-04T03:00:00Z",
  "userId": "current_user_uid"
}
```

### Payload 6: Missing Mandatorily Required Fields
Attempting to write a task without the required `priority` parameter.
```json
{
  "id": "task111",
  "title": "Partially Formed Project",
  "status": "Pendente",
  "completed": false,
  "date": "2026-06-04T03:30:00Z",
  "userId": "current_user_uid"
}
```

### Payload 7: Type Poisoning (String as Boolean)
Passing a string `"true"` instead of a boolean value for checking task completion.
```json
{
  "id": "task112",
  "title": "Type-broken study",
  "priority": "Baixa",
  "status": "Pendente",
  "completed": "true",
  "date": "2026-06-04T03:00:00Z",
  "userId": "current_user_uid"
}
```

### Payload 8: Value Out of Boundary / Bad Enum Values
Constructing an idea payload with an invalid priority option string like `"Imediata"` (not in enum).
```json
{
  "id": "idea444",
  "title": "Creative concept",
  "description": "Innovative app design details",
  "priority": "Imediata",
  "date": "2026-06-04T03:00:00Z",
  "userId": "current_user_uid"
}
```

### Payload 9: Rogue ID Character Injection (ID Poisoning)
Exploiting URL parsing or causing database errors by injecting bad character patterns as document ID.
```json
// Document ID target: "note$$__attacker--inject//"
{
  "id": "note$$__attacker--inject//",
  "title": "Poison ID",
  "category": "Trabalho",
  "content": "Malicious doc title ID tests",
  "favorite": false,
  "date": "2026-06-04T03:00:00Z",
  "userId": "current_user_uid"
}
```

### Payload 10: Omission of Valid Array Types
Attempting to write a note with `tags` assigned to a string instead of a structured array / collection.
```json
{
  "id": "note456",
  "title": "Bad Tags Type",
  "category": "Estudos",
  "content": "Review links",
  "tags": "not_an_array_string",
  "favorite": false,
  "date": "2026-06-04T03:00:00Z",
  "userId": "current_user_uid"
}
```

### Payload 11: Vault Type Poisoning
Attempting to create a secret vault item with type `"Não_Confidencial"` (invalid enum).
```json
{
  "id": "vlt999",
  "title": "Rogue credentials",
  "type": "Não_Confidencial",
  "content": "unprotected text content",
  "date": "2026-06-04T03:00:00Z",
  "userId": "current_user_uid"
}
```

### Payload 12: Blanket List Query Bypass
Executing an unbounded directory-wide matching request to scrape all notes across all users.
```javascript
// Scrape request without filtering by userId == request.auth.uid
firestore.collection("notes").get(); // Rejected by rules checking resource.data.userId == request.auth.uid
```

---

## 3. Security Rule Verification Map
All rules constructed in `/firestore.rules` will be mapped specifically to block these 12 vectors through explicit structural, type-safe, and identity check blocks.
