// Client for the contract in contract-summary.md (C1, C2, C3). Every error has code, message, fieldErrors.

export type ApiErrorBody = { code: string; message: string; fieldErrors: { field: string; message: string }[] };

export class ApiError extends Error {
  constructor(public status: number, public body: ApiErrorBody) {
    super(body.message);
  }
}

const TOKEN_KEY = "civic.staff.token";
export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) =>
  t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY);

const TIMEOUT_MS = 10_000;

async function request<T>(path: string, init: RequestInit = {}, retryRead = false): Promise<T> {
  const attempt = async (): Promise<T> => {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(path, { ...init, signal: ctl.signal });
      if (res.status === 204) return undefined as T;
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok) {
        const body: ApiErrorBody =
          json && json.code ? json : { code: "error", message: "Something went wrong.", fieldErrors: [] };
        throw new ApiError(res.status, body);
      }
      return json as T;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(0, {
        code: "network",
        message: "We could not reach the service. Please check your connection and try again.",
        fieldErrors: [],
      });
    } finally {
      clearTimeout(timer);
    }
  };
  try {
    return await attempt();
  } catch (e) {
    // Reads are retried once automatically; actions are not (contract rule).
    if (retryRead && e instanceof ApiError && e.status === 0) return attempt();
    throw e;
  }
}

const authHeaders = (): Record<string, string> => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const json = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// ---- Types
export type Status = "Submitted" | "Acknowledged" | "In Progress" | "Resolved" | "Closed-Duplicate";
export const STATUSES: Status[] = ["Submitted", "Acknowledged", "In Progress", "Resolved", "Closed-Duplicate"];
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;

export type Category = { categoryCode: string; label: string };
export type SubmissionResult = {
  trackingId: string;
  submittedAt: string;
  confirmationText: string;
  emailNotice: "acknowledgement-will-be-sent" | "no-email-no-notifications";
};
export type TrackingView = {
  trackingId: string;
  category: string;
  submittedAt: string;
  status: Status;
  disputed: boolean;
  history: { status: Status; changedAt: string }[];
  description: string;
  location: { latitude: number; longitude: number };
  resolutionNote: string | null;
};
export type QueueRow = {
  trackingId: string;
  category: string;
  status: Status;
  priority: string;
  disputed: boolean;
  submittedAt: string;
  updatedAt: string;
};
export type QueuePage = { items: QueueRow[]; page: number; pageSize: number; total: number };
export type ReportDetail = QueueRow & {
  description: string;
  location: { latitude: number; longitude: number };
  contactEmail: string | null;
  resolutionNote: string | null;
  duplicateOfTrackingId: string | null;
  photoUrl: string | null;
  history: {
    sequence: number;
    fromStatus: string | null;
    toStatus: string;
    reason: string | null;
    changedAt: string;
    actorType: "staff" | "system";
    actorStaffId: string | null;
  }[];
  notes: { noteId: string; text: string; createdAt: string; authorStaffId: string }[];
};

// ---- Citizen (C1)
export const api = {
  categories: () => request<Category[]>("/v1/categories", {}, true),
  submit: (form: FormData, idempotencyKey: string) =>
    request<SubmissionResult>("/v1/reports", { method: "POST", body: form, headers: { "Idempotency-Key": idempotencyKey } }),
  track: (id: string) => request<TrackingView>(`/v1/reports/${encodeURIComponent(id.trim())}`, {}, true),
  dispute: (id: string) => request<void>(`/v1/reports/${encodeURIComponent(id)}/dispute`, { method: "POST" }),

  // ---- Staff (C3, C2)
  signIn: (email: string, password: string) => request<{ challengeId: string }>("/v1/staff/sign-in", json({ email, password })),
  secondFactor: (challengeId: string, code: string) =>
    request<{ accessToken: string; expiresAt: string }>("/v1/staff/sign-in/second-factor", json({ challengeId, code })),
  me: () => request<{ staffId: string; displayName: string; email: string }>("/v1/staff/me", { headers: authHeaders() }, true),
  signOut: () => request<void>("/v1/staff/sign-out", { method: "POST", headers: authHeaders() }),
  queue: (params: URLSearchParams) => request<QueuePage>(`/v1/staff/reports?${params}`, { headers: authHeaders() }, true),
  detail: (id: string) => request<ReportDetail>(`/v1/staff/reports/${encodeURIComponent(id)}`, { headers: authHeaders() }, true),
  acknowledge: (id: string) =>
    request<ReportDetail>(`/v1/staff/reports/${encodeURIComponent(id)}/acknowledge`, { method: "POST", headers: authHeaders() }),
  setPriority: (id: string, priority: string) =>
    request<ReportDetail>(`/v1/staff/reports/${encodeURIComponent(id)}/priority`, {
      method: "PUT",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ priority }),
    }),
  addNote: (id: string, text: string) =>
    request<void>(`/v1/staff/reports/${encodeURIComponent(id)}/notes`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }),
  changeStatus: (id: string, body: { toStatus: string; reason?: string; resolutionNote?: string; duplicateOfTrackingId?: string }) =>
    request<ReportDetail>(`/v1/staff/reports/${encodeURIComponent(id)}/status`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  photoBlobUrl: async (url: string): Promise<string> => {
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) throw new ApiError(res.status, { code: "photo", message: "The photo could not be loaded.", fieldErrors: [] });
    return URL.createObjectURL(await res.blob());
  },
};

export const formatTime = (iso: string) => new Date(iso).toLocaleString();
