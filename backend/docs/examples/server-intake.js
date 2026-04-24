/**
 * Server-side integration example (Node.js).
 *
 * Your partner server receives its own form submission, then signs and
 * forwards the normalized payload to the helpdesk's /api/complaints/intake
 * endpoint.
 *
 * The signature is hex(HMAC-SHA256(rawBody, FORM_WEBHOOK_SECRET)) and is
 * sent in the X-Webhook-Signature header. The body we sign MUST be exactly
 * the same bytes we POST — so we build the body string first, then hash it.
 */
const crypto = require("node:crypto");

const HELPDESK_ENDPOINT = "https://helpdesk.example.com/api/complaints/intake";
const FORM_WEBHOOK_SECRET = process.env.HELPDESK_FORM_WEBHOOK_SECRET;

/**
 * @param {{
 *   email: string,
 *   name?: string,
 *   contact?: string,
 *   subject?: string,
 *   description: string,
 *   priority?: "LOW"|"MEDIUM"|"HIGH"|"URGENT",
 *   source?: string,
 *   metadata?: Record<string, unknown>
 * }} payload
 */
async function submitComplaint(payload) {
  if (!FORM_WEBHOOK_SECRET) {
    throw new Error("HELPDESK_FORM_WEBHOOK_SECRET not set");
  }

  const body = JSON.stringify(payload);
  const signature = crypto
    .createHmac("sha256", FORM_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  const res = await fetch(HELPDESK_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Webhook-Signature": signature,
    },
    body,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Helpdesk rejected submission (${res.status}): ${err?.error?.message ?? res.statusText}`);
  }
  return res.json(); // { ticketId, requesterId, source }
}

// Example usage
if (require.main === module) {
  submitComplaint({
    email: "jane@example.com",
    name: "Jane Doe",
    contact: "+1-555-0101",
    subject: "Order #1234 never arrived",
    description: "I placed an order on 2026-04-10 and it has not been delivered...",
    priority: "HIGH",
    source: "shop-contact-form-v3",
    metadata: { orderId: "1234", region: "EU" },
  })
    .then((r) => console.log("Created:", r))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = { submitComplaint };
