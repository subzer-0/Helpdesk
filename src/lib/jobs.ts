import { store } from "./store";
import * as ai from "./ai";

let started = false;

async function runOne(jobId: string) {
  const job = store.listJobs().find((j) => j.id === jobId);
  if (!job || job.status !== "queued") return;
  store.updateJob(jobId, {
    status: "running",
    attempts: job.attempts + 1,
    startedAt: new Date().toISOString(),
    log: [...job.log, `started at ${new Date().toLocaleTimeString()}`],
  });

  try {
    switch (job.type) {
      case "classify_ticket": {
        const ticketId = job.payload.ticketId as string;
        const ticket = store.getTicket(ticketId);
        if (ticket) {
          const messages = store.listMessages(ticketId);
          const customerMsg = messages.find((m) => m.authorRole === "customer")?.body ?? "";
          const result = await ai.classify(ticket.subject, customerMsg);
          store.updateTicket(ticketId, {
            category: result.category,
            priority: result.priority,
            aiConfidence: result.confidence,
          });
          store.updateJob(jobId, {
            log: [
              ...store.listJobs().find((j) => j.id === jobId)!.log,
              `classified as ${result.category}/${result.priority} (conf ${result.confidence.toFixed(2)})`,
            ],
          });
        }
        break;
      }
      case "summarize_ticket": {
        const ticketId = job.payload.ticketId as string;
        const ticket = store.getTicket(ticketId);
        if (ticket) {
          const messages = store.listMessages(ticketId);
          const summary = await ai.summarize(ticket, messages);
          store.updateTicket(ticketId, { aiSummary: summary });
        }
        break;
      }
      case "auto_resolve": {
        const ticketId = job.payload.ticketId as string;
        const ticket = store.getTicket(ticketId);
        if (ticket) {
          const messages = store.listMessages(ticketId);
          const last = messages.filter((m) => m.authorRole === "customer").slice(-1)[0]?.body ?? "";
          const result = await ai.autoResolve(ticket, last);
          if (result.canResolve && result.reply) {
            store.addMessage({
              ticketId,
              authorId: "ai",
              authorName: "HelpDesk AI",
              authorRole: "ai",
              body: result.reply,
              channel: "ai",
            });
            store.updateTicket(ticketId, { status: "resolved", aiConfidence: result.confidence });
          } else {
            store.updateTicket(ticketId, { aiConfidence: result.confidence });
          }
        }
        break;
      }
      case "send_email": {
        await new Promise((r) => setTimeout(r, 600));
        break;
      }
      case "ingest_email": {
        await new Promise((r) => setTimeout(r, 400));
        break;
      }
      case "polish_reply": {
        await new Promise((r) => setTimeout(r, 500));
        break;
      }
    }

    store.updateJob(jobId, {
      status: "succeeded",
      finishedAt: new Date().toISOString(),
      log: [
        ...store.listJobs().find((j) => j.id === jobId)!.log,
        `succeeded at ${new Date().toLocaleTimeString()}`,
      ],
    });
  } catch (err) {
    store.updateJob(jobId, {
      status: "failed",
      finishedAt: new Date().toISOString(),
      log: [
        ...store.listJobs().find((j) => j.id === jobId)!.log,
        `failed: ${(err as Error).message}`,
      ],
    });
  }
}

export function startWorker() {
  if (started) return;
  started = true;
  setInterval(() => {
    const queued = store.listJobs().filter((j) => j.status === "queued");
    queued.slice(0, 2).forEach((j) => runOne(j.id));
  }, 1500);
}
