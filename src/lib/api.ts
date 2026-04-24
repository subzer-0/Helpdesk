import type { Message, Ticket, TicketPriority, TicketStatus, User, UserRole } from "./types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:4000";
const ACCESS_KEY = "helpdesk_access_token";
const REFRESH_KEY = "helpdesk_refresh_token";

type ApiErrorShape = { error?: { message?: string } };

type BackendRole = "ADMIN" | "AGENT" | "CUSTOMER";
type BackendTicketStatus = "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";
type BackendTicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type BackendUser = {
  id: string;
  email: string;
  name: string;
  role: BackendRole;
  isActive?: boolean;
  createdAt: string;
};

type BackendTicket = {
  id: string;
  subject: string;
  description: string;
  status: BackendTicketStatus;
  priority: BackendTicketPriority;
  requesterId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  requester: BackendUser;
  assignee: BackendUser | null;
};

type BackendMessage = {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
  author: BackendUser;
};

const toUserRole = (role: BackendRole): UserRole => role.toLowerCase() as UserRole;
const toTicketStatus = (status: BackendTicketStatus): TicketStatus => status.toLowerCase() as TicketStatus;
const toTicketPriority = (priority: BackendTicketPriority): TicketPriority => priority.toLowerCase() as TicketPriority;

const mapUser = (u: BackendUser): User => ({
  id: u.id,
  name: u.name,
  email: u.email,
  password: "",
  role: toUserRole(u.role),
  avatarColor: "#64748b",
  createdAt: u.createdAt,
});

const mapTicket = (t: BackendTicket): Ticket => ({
  id: t.id,
  subject: t.subject,
  status: toTicketStatus(t.status),
  priority: toTicketPriority(t.priority),
  category: "general",
  customerId: t.requester.id,
  customerName: t.requester.name,
  customerEmail: t.requester.email,
  assigneeId: t.assignee?.id ?? null,
  assigneeName: t.assignee?.name ?? null,
  tags: [],
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
  source: "web",
  satisfactionScore: null,
});

const mapMessage = (m: BackendMessage): Message => ({
  id: m.id,
  ticketId: m.ticketId,
  authorId: m.authorId,
  authorName: m.author.name,
  authorRole: toUserRole(m.author.role),
  body: m.body,
  createdAt: m.createdAt,
  channel: m.isInternal ? "web" : "email",
  internal: m.isInternal,
});

function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function parseError(resp: Response) {
  try {
    const body = (await resp.json()) as ApiErrorShape;
    return body.error?.message ?? `Request failed (${resp.status})`;
  } catch {
    return `Request failed (${resp.status})`;
  }
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  const resp = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!resp.ok) {
    clearTokens();
    return false;
  }
  const data = (await resp.json()) as { accessToken: string; refreshToken: string };
  setTokens(data.accessToken, data.refreshToken);
  return true;
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const token = getAccessToken();
  const resp = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (resp.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return request<T>(path, init, false);
  }

  if (!resp.ok) throw new Error(await parseError(resp));
  if (resp.status === 204) return undefined as T;
  return (await resp.json()) as T;
}

export const api = {
  clearTokens,

  async login(email: string, password: string) {
    const data = await request<{ user: BackendUser; accessToken: string; refreshToken: string }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false,
    );
    setTokens(data.accessToken, data.refreshToken);
    return mapUser(data.user);
  },

  async me() {
    const user = await request<BackendUser>("/api/auth/me", { method: "GET" });
    return mapUser(user);
  },

  async logout() {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await request<void>(
          "/api/auth/logout",
          { method: "POST", body: JSON.stringify({ refreshToken }) },
          false,
        );
      }
    } finally {
      clearTokens();
    }
  },

  async listUsers() {
    const data = await request<{ items: BackendUser[] }>("/api/users?page=1&pageSize=100", { method: "GET" });
    return data.items.map(mapUser);
  },

  async listTickets(params?: { q?: string; status?: TicketStatus; priority?: TicketPriority; assigneeId?: string }) {
    const query = new URLSearchParams({ page: "1", pageSize: "100" });
    if (params?.q) query.set("q", params.q);
    if (params?.status) query.set("status", params.status.toUpperCase());
    if (params?.priority) query.set("priority", params.priority.toUpperCase());
    if (params?.assigneeId) query.set("assigneeId", params.assigneeId);
    const data = await request<{ items: BackendTicket[] }>(`/api/tickets?${query.toString()}`, { method: "GET" });
    return data.items.map(mapTicket);
  },

  async getTicket(id: string) {
    const data = await request<BackendTicket>(`/api/tickets/${id}`, { method: "GET" });
    return mapTicket(data);
  },

  async createTicket(input: {
    subject: string;
    description: string;
    priority: TicketPriority;
    requesterId?: string;
  }) {
    const data = await request<BackendTicket>("/api/tickets", {
      method: "POST",
      body: JSON.stringify({
        subject: input.subject,
        description: input.description,
        priority: input.priority.toUpperCase(),
        requesterId: input.requesterId,
      }),
    });
    return mapTicket(data);
  },

  async updateTicket(id: string, patch: {
    status?: TicketStatus;
    priority?: TicketPriority;
    assigneeId?: string | null;
  }) {
    const body: Record<string, unknown> = {};
    if (patch.status) body.status = patch.status.toUpperCase();
    if (patch.priority) body.priority = patch.priority.toUpperCase();
    if (patch.assigneeId !== undefined) body.assigneeId = patch.assigneeId;
    const data = await request<BackendTicket>(`/api/tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return mapTicket(data);
  },

  async deleteTicket(id: string) {
    await request<void>(`/api/tickets/${id}`, { method: "DELETE" });
  },

  async listMessages(ticketId: string) {
    const data = await request<BackendMessage[]>(`/api/tickets/${ticketId}/messages`, { method: "GET" });
    return data.map(mapMessage);
  },

  async createMessage(ticketId: string, input: { body: string; isInternal: boolean }) {
    const data = await request<BackendMessage>(`/api/tickets/${ticketId}/messages`, {
      method: "POST",
      body: JSON.stringify(input),
    });
    return mapMessage(data);
  },
};
