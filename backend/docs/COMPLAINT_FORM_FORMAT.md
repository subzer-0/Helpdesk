# Complaint Form Format — integrator spec

Partner websites submit customer complaints to this helpdesk via a standardised
HTTPS endpoint. Tickets created this way land in the same inbox agents and
admins use for email-sourced tickets.

Customers do not log into the helpdesk. They submit a form on the partner site
and receive a ticket ID as a reference; further communication happens over
email using the address they provided.

## Choose a mode

| Mode | Endpoint | Auth | Where the form lives |
|---|---|---|---|
| **Public (browser)** | `POST /api/complaints/public` | Rate limit + honeypot | Static HTML on the partner website, submitting via `fetch` from the browser |
| **Server-to-server** | `POST /api/complaints/intake` | HMAC-SHA256 signature | Partner backend receives its own form and forwards to us |

Both return the same response shape. Use the public mode for simple sites with
no backend. Use server-to-server for higher-trust integrations that want
end-to-end idempotency and abuse control on their own side.

---

## Public mode — `POST /api/complaints/public`

### Request

```
POST https://helpdesk.example.com/api/complaints/public
Content-Type: application/json
```

Body:

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✓ | Up to 120 chars |
| `email` | string | ✓ | Valid email — replies are sent here |
| `contact` | string | ✓ | Phone or other contact method, up to 60 chars |
| `body` | string | ✓ | 10–10 000 chars — the complaint text |
| `website` | string | ✗ | **Honeypot** — must be absent or empty. Non-empty value rejects the submission silently. |

### Response

**201 Created**

```json
{
  "ticketId": "ckxyz9a...",
  "requesterId": "ckabc1b...",
  "source": "public-form"
}
```

Show `ticketId` to the user. Instruct them to quote it in any follow-up email.

### Error responses

| Status | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION` | Missing/invalid field — see `details` |
| 400 | `BAD_REQUEST` | Honeypot triggered |
| 429 | `TOO_MANY_REQUESTS` | Rate limit (5 submissions/minute per IP) |
| 500 | `INTERNAL` | Server error |

Error body shape:

```json
{ "error": { "code": "VALIDATION", "message": "Invalid input", "details": { ... } } }
```

### Rate limits

- **5 submissions per minute per IP** on the public endpoint.
- Clients receive `RateLimit-*` headers (IETF draft-7) and `Retry-After` on 429.

### Anti-abuse

- **Honeypot** — the `website` field must be absent or empty string. The spec
  requires that partner sites render an input named `website` that is hidden
  from humans (visually hidden + `tabindex="-1"` + `autocomplete="off"`).
- **Rate limit** — as above.
- Partners SHOULD additionally add a CAPTCHA (hCaptcha, Turnstile) if they see
  abuse. That check runs on the partner side before submission.

### CORS

The endpoint responds with permissive CORS so any origin may POST. The preflight
(`OPTIONS`) is handled. `credentials: "include"` is not supported — do not send
cookies.

---

## Server-to-server mode — `POST /api/complaints/intake`

For integrators with a backend. The partner's server receives its own form
submission, then signs and forwards the payload to us.

### Request

```
POST https://helpdesk.example.com/api/complaints/intake
Content-Type: application/json
X-Webhook-Signature: <hex HMAC-SHA256 of the exact request body using FORM_WEBHOOK_SECRET>
```

Body:

| Field | Type | Required | Notes |
|---|---|---|---|
| `email` | string | ✓ | Requester email |
| `name` | string | ✗ | Defaults to email local-part if omitted |
| `contact` | string | ✗ | Phone or alternate contact |
| `subject` | string | ✗ | If omitted, derived from first line of `description` |
| `description` | string | ✓ | Complaint text, up to 10 000 chars |
| `priority` | string | ✗ | `LOW` \| `MEDIUM` \| `HIGH` \| `URGENT` (default `MEDIUM`) |
| `source` | string | ✗ | Integrator label, e.g. `website-form-v2` |
| `metadata` | object | ✗ | Arbitrary key/value pairs — appended to ticket description |

### Response

**201 Created**

```json
{
  "ticketId": "ckxyz9a...",
  "requesterId": "ckabc1b...",
  "source": "website-form-v2"
}
```

### Signature

The signature is a **hex-encoded HMAC-SHA256** of the raw request body, keyed
by the shared `FORM_WEBHOOK_SECRET` value (provided out of band). See the
Node.js example in `examples/server-intake.js`.

---

## What happens after submission

1. The helpdesk finds-or-creates a `User` record (role `CUSTOMER`) keyed by
   email. This customer never logs in; the record exists so the ticket has a
   requester.
2. A `Ticket` is opened, assigned priority (default `MEDIUM`), and inserted
   into the agents' inbox.
3. Agents/admins see the ticket immediately in the helpdesk UI. They reply
   by email to the address provided.
4. Further emails from that address with the subject line containing
   `[#<ticketId>]` append to the same ticket.

---

## Examples

See the `examples/` directory:

- [`embed.html`](examples/embed.html) — copy-paste HTML form for a partner site
  (browser-only, no backend required).
- [`embed.js`](examples/embed.js) — drop-in script that progressively enhances
  a form element with submission handling.
- [`server-intake.js`](examples/server-intake.js) — Node.js HMAC signer and
  request forwarder.
