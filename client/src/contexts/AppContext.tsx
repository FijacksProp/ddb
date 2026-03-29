import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiService } from "@/services/api";

type KycTier = "Tier 1" | "Tier 2" | "Tier 3";
type RiskBand = "Low" | "Medium" | "High";
type LoanDecision = "approved" | "manual_review" | "declined";
type LoanStatus = "disbursed" | "under_review" | "declined" | "repaid";
type InvestmentStatus = "active" | "matured" | "withdrawn";
type NotificationKind = "system" | "kyc" | "transaction" | "loan" | "investment";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  accountNumber: string;
  bvn: string;
  nin?: string;
  isBvnVerified: boolean;
  isPhoneVerified: boolean;
  kycTier: KycTier;
  segment: "Retail" | "SME" | "Agriculture" | "Corporate";
  businessName?: string;
  sector: string;
  monthlyRevenue: number;
  walletBalance: number;
  riskBand: RiskBand;
  joinedAt: string;
  lastLoginAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  direction: "credit" | "debit";
  amount: number;
  description: string;
  counterpartyName: string;
  counterpartyAccount?: string;
  channel: "wallet_transfer" | "loan_disbursement" | "investment" | "top_up" | "yield";
  status: "completed" | "pending" | "failed";
  reference: string;
  createdAt: string;
}

export interface LoanApplication {
  id: string;
  userId: string;
  productName: string;
  purpose: string;
  amountRequested: number;
  amountApproved: number;
  interestRate: number;
  tenureMonths: number;
  monthlyRepayment: number;
  outstandingBalance: number;
  decision: LoanDecision;
  status: LoanStatus;
  score: number;
  scoreBreakdown: Array<{ label: string; value: number; max?: number }>;
  scoreCategories: Array<{ label: string; value: number; max: number }>;
  createdAt: string;
  nextRepaymentAt?: string;
}

export interface InvestmentPosition {
  id: string;
  userId: string;
  productName: string;
  amount: number;
  annualYield: number;
  dailyYield: number;
  yieldAccrued: number;
  liquidityDays: number;
  maturityDate: string;
  createdAt: string;
  status: InvestmentStatus;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  kind: NotificationKind;
  read: boolean;
  createdAt: string;
}

interface LoanProduct {
  id: string;
  name: string;
}

interface InvestmentProduct {
  id: string;
  name: string;
  annualYield: number;
  tenureDays: number;
  liquidityDays: number;
}

interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  pin: string;
  businessName?: string;
  sector: string;
  monthlyRevenue: number;
  segment: "Retail" | "SME";
}

interface TransferPayload {
  recipientAccountNumber: string;
  amount: number;
  narration: string;
}

interface LoanPayload {
  productName: string;
  purpose: string;
  amount: number;
  tenureMonths: number;
}

interface InvestmentPayload {
  productName: string;
  amount: number;
  annualYield: number;
  tenureDays: number;
  liquidityDays: number;
}

interface AppContextType {
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  user: User | null;
  users: User[];
  transactions: Transaction[];
  loans: LoanApplication[];
  investments: InvestmentPosition[];
  notifications: AppNotification[];
  contacts: User[];
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (payload: SignupPayload) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  topUpWallet: (amount: number) => Promise<{ success: boolean; message: string }>;
  transferFunds: (payload: TransferPayload) => Promise<{ success: boolean; message: string }>;
  requestLoan: (payload: LoanPayload) => Promise<{ success: boolean; message: string; application?: LoanApplication }>;
  createInvestment: (payload: InvestmentPayload) => Promise<{ success: boolean; message: string }>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  getUnreadCount: () => number;
  verifyBvn: (bvn: string) => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function toTitleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function computeNextRepaymentAt(raw: any): string | undefined {
  if (raw.next_repayment_at) return String(raw.next_repayment_at);
  if (raw.status !== "disbursed") return undefined;
  const createdAt = new Date(raw.created_at || Date.now());
  if (Number.isNaN(createdAt.getTime())) return undefined;
  const tenureMonths = Math.max(Number(raw.tenure_months || 1), 1);
  const now = new Date();
  const daysElapsed = Math.max(0, Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));
  const elapsedInstallments = Math.min(Math.floor(daysElapsed / 30), tenureMonths - 1);
  const nextInstallmentIndex = elapsedInstallments + 1;
  const nextDue = new Date(createdAt.getTime() + nextInstallmentIndex * 30 * 24 * 60 * 60 * 1000);
  return nextDue.toISOString();
}

function mapUser(raw: any, walletBalance = 0): User {
  return {
    id: String(raw.id),
    fullName: raw.full_name || "",
    email: raw.email || "",
    phoneNumber: raw.phone_number || "",
    accountNumber: raw.account_number || "",
    bvn: raw.bvn || "",
    nin: raw.nin || "",
    isBvnVerified: Boolean(raw.is_bvn_verified),
    isPhoneVerified: Boolean(raw.is_phone_verified),
    kycTier: (toTitleCase(raw.kyc_tier || "tier_1") as KycTier) || "Tier 1",
    segment: (toTitleCase(raw.segment || "retail") as User["segment"]) || "Retail",
    businessName: raw.business_name || "",
    sector: raw.sector || "",
    monthlyRevenue: Number(raw.monthly_revenue || 0),
    walletBalance: Number(walletBalance || 0),
    riskBand: (toTitleCase(raw.risk_band || "medium") as RiskBand) || "Medium",
    joinedAt: raw.date_joined || new Date().toISOString(),
    lastLoginAt: raw.last_login || new Date().toISOString(),
  };
}

function mapLedgerEntry(entry: any, userId: string): Transaction {
  const category = String(entry.category || "wallet_transfer");
  let channel: Transaction["channel"] = "wallet_transfer";
  if (category.includes("loan")) channel = "loan_disbursement";
  else if (category.includes("investment")) channel = "investment";
  else if (category.includes("top")) channel = "top_up";
  else if (category.includes("yield")) channel = "yield";
  const description = String(entry.description || "");
  const fallbackName = description.includes(" to ") ? description.split(" to ").pop() : description.includes(" from ") ? description.split(" from ").pop() : "DDB Counterparty";
  return {
    id: String(entry.id),
    userId,
    direction: entry.entry_type === "credit" ? "credit" : "debit",
    amount: Number(entry.amount || 0),
    description,
    counterpartyName: entry.counterparty_name || fallbackName || "DDB Counterparty",
    channel,
    status: "completed",
    reference: entry.reference || "",
    createdAt: entry.created_at || new Date().toISOString(),
  };
}

function mapLoan(app: any): LoanApplication {
  const breakdown = Array.isArray(app.score_payload?.breakdown)
    ? app.score_payload.breakdown.map((item: any) => ({
        label: String(item.label || item.factor || "factor"),
        value: Number(item.value || 0),
        max: item.max !== undefined ? Number(item.max) : undefined,
      }))
    : [];
  const categories = Array.isArray(app.score_payload?.category_scores)
    ? app.score_payload.category_scores.map((item: any) => ({
        label: String(item.label || item.category || "Category"),
        value: Number(item.value || 0),
        max: Number(item.max || 0),
      }))
    : [];
  return {
    id: String(app.id),
    userId: String(app.user),
    productName: app.product_name || app.product_label || "Loan Product",
    purpose: app.purpose || "",
    amountRequested: Number(app.amount_requested || 0),
    amountApproved: Number(app.amount_approved || 0),
    interestRate: Number(app.interest_rate || 0),
    tenureMonths: Number(app.tenure_months || 0),
    monthlyRepayment: Number(app.monthly_repayment || 0),
    outstandingBalance: Number(app.outstanding_balance || 0),
    decision: (app.decision as LoanDecision) || "manual_review",
    status: app.status === "applied" ? "under_review" : app.status === "rejected" ? "declined" : (app.status as LoanStatus),
    score: Number(app.credit_score || 0),
    scoreBreakdown: breakdown.map((item: { label: string; value: number; max?: number }) => ({ label: item.label, value: item.value, max: item.max })),
    scoreCategories: categories,
    createdAt: app.created_at || new Date().toISOString(),
    nextRepaymentAt: computeNextRepaymentAt(app),
  };
}

function mapInvestment(holding: any, products: InvestmentProduct[]): InvestmentPosition {
  const product = products.find((item) => item.id === String(holding.product));
  const annualYield = Number(holding.annual_yield || product?.annualYield || 0);
  const amount = Number(holding.amount || 0);
  return {
    id: String(holding.id),
    userId: String(holding.user),
    productName: product?.name || "Investment Product",
    amount,
    annualYield,
    dailyYield: Number(((amount * annualYield) / 100 / 365).toFixed(2)),
    yieldAccrued: Number(holding.yield_accrued || 0),
    liquidityDays: Number(product?.liquidityDays || 1),
    maturityDate: holding.maturity_date || new Date().toISOString(),
    createdAt: holding.created_at || new Date().toISOString(),
    status: (holding.status as InvestmentStatus) || "active",
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(apiService.initTokenFromStorage());
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([]);
  const [investmentProducts, setInvestmentProducts] = useState<InvestmentProduct[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [investments, setInvestments] = useState<InvestmentPosition[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refreshCore = async () => {
    const [walletRes, meRes, usersRes, ledgerRes, loanProductsRes, loanAppsRes, investProductsRes, investHoldingsRes, notificationsRes] =
      await Promise.all([
        apiService.getWallet(),
        apiService.getCurrentUser(),
        apiService.getUsers(),
        apiService.getLedger(),
        apiService.getLoanProducts(),
        apiService.getLoanApplications(),
        apiService.getInvestmentProducts(),
        apiService.getInvestmentHoldings(),
        apiService.getNotifications(),
      ]);

    if (!meRes.data || !walletRes.data) {
      throw new Error(meRes.error || walletRes.error || "Failed to load account");
    }

    const me = mapUser(meRes.data, Number((walletRes.data as any).available_balance || 0));
    setUser(me);

    const directory = Array.isArray(usersRes.data) ? usersRes.data.map((item: any) => mapUser(item, 0)) : [];
    setUsers(directory);

    const ledgerItems = Array.isArray(ledgerRes.data) ? ledgerRes.data : [];
    setTransactions(ledgerItems.map((entry: any) => mapLedgerEntry(entry, me.id)));

    const loanProductItems = Array.isArray(loanProductsRes.data)
      ? loanProductsRes.data.map((item: any) => ({ id: String(item.id), name: String(item.name || "") }))
      : [];
    setLoanProducts(loanProductItems);

    const loanItems = Array.isArray(loanAppsRes.data) ? loanAppsRes.data : [];
    const resolvedLoans = loanItems.map((item: any) => {
      const mapped = mapLoan(item);
      const product = loanProductItems.find((lp) => lp.id === String(item.product));
      return product ? { ...mapped, productName: product.name } : mapped;
    });
    setLoans(resolvedLoans);

    const investProductItems = Array.isArray(investProductsRes.data)
      ? investProductsRes.data.map((item: any) => ({
          id: String(item.id),
          name: String(item.name || ""),
          annualYield: Number(item.annual_yield || 0),
          tenureDays: Number(item.tenure_days || 0),
          liquidityDays: Number(item.liquidity_days || 1),
        }))
      : [];
    setInvestmentProducts(investProductItems);

    const holdingItems = Array.isArray(investHoldingsRes.data) ? investHoldingsRes.data : [];
    setInvestments(holdingItems.map((holding: any) => mapInvestment(holding, investProductItems)));

    const notifItems = Array.isArray(notificationsRes.data)
      ? notificationsRes.data.map((item: any) => ({
          id: String(item.id),
          userId: String(item.user),
          title: String(item.title || ""),
          message: String(item.message || ""),
          kind: ((item.kind || "system") as NotificationKind),
          read: Boolean(item.read),
          createdAt: item.created_at || new Date().toISOString(),
        }))
      : [];
    setNotifications(notifItems);
  };

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    refreshCore()
      .catch(() => {
        setToken(null);
        setUser(null);
        apiService.clearToken();
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const result = await apiService.login(email, password);
    if (!result.data?.access) {
      setIsLoading(false);
      return { success: false, message: result.error || "Invalid credentials" };
    }
    apiService.setToken(result.data.access);
    setToken(result.data.access);
    try {
      await refreshCore();
      return { success: true, message: "Signed in successfully." };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Failed to load account data." };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (payload: SignupPayload) => {
    setIsLoading(true);
    const registerRes = await apiService.register({
      email: payload.email,
      password: payload.password,
      full_name: `${payload.firstName} ${payload.lastName}`.trim(),
      phone_number: payload.phoneNumber,
      segment: payload.segment.toLowerCase(),
      business_name: payload.businessName || "",
      sector: payload.sector,
      monthly_revenue: payload.monthlyRevenue,
    });
    if (!registerRes.data) {
      setIsLoading(false);
      return { success: false, message: registerRes.error || "Signup failed" };
    }
    const loginRes = await login(payload.email, payload.password);
    setIsLoading(false);
    return loginRes;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setUsers([]);
    setTransactions([]);
    setLoans([]);
    setInvestments([]);
    setNotifications([]);
    apiService.clearToken();
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  const topUpWallet = async (amount: number) => {
    if (amount <= 0) return { success: false, message: "Amount must be greater than zero." };
    setIsLoading(true);
    const result = await apiService.topUpWallet(amount);
    if (!result.data) {
      setIsLoading(false);
      return { success: false, message: result.error || "Top up failed." };
    }
    await refreshCore();
    setIsLoading(false);
    return { success: true, message: "Wallet topped up." };
  };

  const transferFunds = async (payload: TransferPayload) => {
    setIsLoading(true);
    const result = await apiService.createTransfer({
      recipient_account_number: payload.recipientAccountNumber,
      amount: payload.amount,
      narration: payload.narration,
    });
    if (!result.data) {
      setIsLoading(false);
      return { success: false, message: result.error || "Transfer failed." };
    }
    await refreshCore();
    setIsLoading(false);
    return { success: true, message: "Transfer completed successfully." };
  };

  const requestLoan = async (payload: LoanPayload) => {
    const product = loanProducts.find((item) => item.name === payload.productName) || loanProducts[0];
    if (!product) return { success: false, message: "No loan products available." };
    setIsLoading(true);
    const result = await apiService.createLoanApplication({
      product: product.id,
      amount_requested: payload.amount,
      tenure_months: payload.tenureMonths,
      purpose: payload.purpose,
    });
    if (!result.data) {
      setIsLoading(false);
      return { success: false, message: result.error || "Loan request failed." };
    }
    await refreshCore();
    setIsLoading(false);
    const created = mapLoan(result.data);
    created.productName = product.name;
    const success = created.decision !== "declined";
    return {
      success,
      message:
        created.decision === "approved"
          ? "Loan approved and disbursed."
          : created.decision === "manual_review"
            ? "Loan submitted for manual review."
            : "Loan application declined.",
      application: created,
    };
  };

  const createInvestment = async (payload: InvestmentPayload) => {
    const product = investmentProducts.find((item) => item.name === payload.productName) || investmentProducts[0];
    if (!product) return { success: false, message: "No investment products available." };
    setIsLoading(true);
    const result = await apiService.createInvestmentHolding({ product: product.id, amount: payload.amount });
    if (!result.data) {
      setIsLoading(false);
      return { success: false, message: result.error || "Investment booking failed." };
    }
    await refreshCore();
    setIsLoading(false);
    return { success: true, message: "Investment created successfully." };
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
    void apiService.markNotificationAsRead(id);
  };

  const markAllNotificationsAsRead = () => {
    const unreadIds = notifications.filter((item) => !item.read).map((item) => item.id);
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    unreadIds.forEach((id) => {
      void apiService.markNotificationAsRead(id);
    });
  };

  const verifyBvn = async (bvn: string) => {
    const result = await apiService.verifyBvn(bvn);
    if (!result.data?.user) {
      return { success: false, message: result.error || "BVN verification failed." };
    }
    setUser((prev) => (prev ? mapUser(result.data!.user, prev.walletBalance) : prev));
    return { success: true, message: result.data.message || "BVN verified successfully." };
  };

  const contacts = useMemo(() => users.filter((item) => item.id !== user?.id), [users, user?.id]);

  const value: AppContextType = {
    isAuthenticated: Boolean(token && user),
    token,
    isLoading,
    user,
    users,
    transactions,
    loans,
    investments,
    notifications,
    contacts,
    login,
    signup,
    logout,
    updateUser,
    topUpWallet,
    transferFunds,
    requestLoan,
    createInvestment,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadCount: () => notifications.filter((item) => !item.read).length,
    verifyBvn,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
