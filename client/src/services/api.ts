import axios, { type AxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
}

class ApiService {
  private client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
  });

  setToken(token: string) {
    localStorage.setItem("auth_token", token);
    this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  clearToken() {
    localStorage.removeItem("auth_token");
    delete this.client.defaults.headers.common.Authorization;
  }

  initTokenFromStorage() {
    const token = localStorage.getItem("auth_token");
    if (token) {
      this.setToken(token);
    }
    return token;
  }

  private normalizeError(error: unknown): string {
    const fallback = "Something went wrong on the server. Please try again.";
    const sanitize = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const looksLikeHtml = (value: string) =>
      /<!doctype html|<html|<head|<body|django/i.test(value);

    if (axios.isAxiosError(error)) {
      const payload = error.response?.data;
      if (typeof payload === "string") {
        if (looksLikeHtml(payload)) {
          return fallback;
        }
        const cleaned = sanitize(payload);
        return cleaned || fallback;
      }
      if (payload?.detail) {
        return String(payload.detail);
      }
      if (payload?.error) {
        return String(payload.error);
      }
      if (payload?.message) {
        return String(payload.message);
      }
      if (payload && typeof payload === "object") {
        const first = Object.values(payload)[0];
        if (Array.isArray(first) && first.length > 0) {
          return String(first[0]);
        }
        if (typeof first === "string") {
          return looksLikeHtml(first) ? fallback : first;
        }
      }
      return error.message || fallback;
    }
    return fallback;
  }

  private async request<T>(url: string, config: AxiosRequestConfig = {}): Promise<ApiResult<T>> {
    try {
      const response = await this.client({ url, ...config });
      return { data: response.data as T, error: null };
    } catch (error) {
      return { data: null, error: this.normalizeError(error) };
    }
  }

  login(email: string, password: string) {
    return this.request<{ access: string; refresh: string }>("/auth/token/", {
      method: "POST",
      data: { email, password },
    });
  }

  register(payload: Record<string, unknown>) {
    return this.request<Record<string, unknown>>("/auth/register/", {
      method: "POST",
      data: payload,
    });
  }

  getCurrentUser() {
    return this.request<Record<string, unknown>>("/auth/me/");
  }

  getUsers() {
    return this.request<Array<Record<string, unknown>>>("/auth/users/");
  }

  verifyBvn(bvn: string) {
    return this.request<{ message: string; user: Record<string, unknown> }>("/auth/bvn/verify-bvn/", {
      method: "POST",
      data: { bvn },
    });
  }

  getWallet() {
    return this.request<Record<string, unknown>>("/wallet/");
  }

  topUpWallet(amount: number) {
    return this.request<Record<string, unknown>>("/wallet/", {
      method: "POST",
      data: { amount },
    });
  }

  getLedger() {
    return this.request<Array<Record<string, unknown>>>("/ledger/");
  }

  getTransfers() {
    return this.request<Array<Record<string, unknown>>>("/transfers/");
  }

  createTransfer(payload: { recipient_account_number: string; amount: number; narration: string }) {
    return this.request<Record<string, unknown>>("/transfers/", {
      method: "POST",
      data: payload,
    });
  }

  getLoanProducts() {
    return this.request<Array<Record<string, unknown>>>("/loan-products/");
  }

  getLoanApplications() {
    return this.request<Array<Record<string, unknown>>>("/loan-applications/");
  }

  createLoanApplication(payload: { product: string; amount_requested: number; tenure_months: number; purpose: string }) {
    return this.request<Record<string, unknown>>("/loan-applications/", {
      method: "POST",
      data: payload,
    });
  }

  getInvestmentProducts() {
    return this.request<Array<Record<string, unknown>>>("/investment-products/");
  }

  getInvestmentHoldings() {
    return this.request<Array<Record<string, unknown>>>("/investment-holdings/");
  }

  createInvestmentHolding(payload: { product: string; amount: number }) {
    return this.request<Record<string, unknown>>("/investment-holdings/", {
      method: "POST",
      data: payload,
    });
  }

  getNotifications() {
    return this.request<Array<Record<string, unknown>>>("/notifications/");
  }

  markNotificationAsRead(id: string) {
    return this.request<Record<string, unknown>>(`/notifications/${id}/`, {
      method: "PATCH",
      data: { read: true },
    });
  }
}

export const apiService = new ApiService();
