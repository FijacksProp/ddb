import React, { createContext, useContext, useEffect, useState } from "react";

type KycTier = "Tier 1" | "Tier 2" | "Tier 3";
type RiskBand = "Low" | "Medium" | "High";
type LoanDecision = "approved" | "manual_review" | "declined";
type LoanStatus = "disbursed" | "under_review" | "declined" | "repaid";
type InvestmentStatus = "active" | "matured" | "withdrawn";
type NotificationKind = "system" | "kyc" | "transaction" | "loan" | "investment";

interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  pin: string;
  accountNumber: string;
  bvn: string;
  nin?: string;
  kycTier: KycTier;
  segment: "Retail" | "SME";
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
  scoreBreakdown: Array<{ label: string; value: number }>;
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

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  accountNumber: string;
  bvn: string;
  nin?: string;
  kycTier: KycTier;
  segment: "Retail" | "SME";
  businessName?: string;
  sector: string;
  monthlyRevenue: number;
  walletBalance: number;
  riskBand: RiskBand;
  joinedAt: string;
  lastLoginAt: string;
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

interface AppState {
  users: StoredUser[];
  currentUserId: string | null;
  transactions: Transaction[];
  loans: LoanApplication[];
  investments: InvestmentPosition[];
  notifications: AppNotification[];
}

interface AppContextType {
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  transactions: Transaction[];
  loans: LoanApplication[];
  investments: InvestmentPosition[];
  notifications: AppNotification[];
  contacts: User[];
  login: (email: string, password: string) => { success: boolean; message: string };
  signup: (payload: SignupPayload) => { success: boolean; message: string };
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  topUpWallet: (amount: number) => void;
  transferFunds: (payload: TransferPayload) => { success: boolean; message: string };
  requestLoan: (payload: LoanPayload) => { success: boolean; message: string; application?: LoanApplication };
  createInvestment: (payload: InvestmentPayload) => { success: boolean; message: string };
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  getUnreadCount: () => number;
}

const STORAGE_KEY = "ddb_bank_state_v2";

const now = () => new Date().toISOString();
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const ref = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}${Date.now().toString().slice(-4)}`;

function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    accountNumber: user.accountNumber,
    bvn: user.bvn,
    nin: user.nin,
    kycTier: user.kycTier,
    segment: user.segment,
    businessName: user.businessName,
    sector: user.sector,
    monthlyRevenue: user.monthlyRevenue,
    walletBalance: user.walletBalance,
    riskBand: user.riskBand,
    joinedAt: user.joinedAt,
    lastLoginAt: user.lastLoginAt,
  };
}

function nextAccountNumber(size: number) {
  return String(1023000000 + size).padStart(10, "0");
}

function seedState(): AppState {
  const adebayoId = "user-adebayo";
  const chiomaId = "user-chioma";
  const timestamp = now();
  return {
    currentUserId: adebayoId,
    users: [
      {
        id: adebayoId,
        fullName: "Adebayo Oluwaseun",
        email: "adebayo@ddb.ng",
        phoneNumber: "08012345678",
        password: "demo1234",
        pin: "1234",
        accountNumber: "1023000001",
        bvn: "22345678901",
        nin: "12345678901",
        kycTier: "Tier 2",
        segment: "SME",
        businessName: "Adebayo Agro Supplies",
        sector: "Agriculture",
        monthlyRevenue: 480000,
        walletBalance: 127450,
        riskBand: "Low",
        joinedAt: timestamp,
        lastLoginAt: timestamp,
      },
      {
        id: chiomaId,
        fullName: "Chioma Okafor",
        email: "chioma@ddb.ng",
        phoneNumber: "08087654321",
        password: "demo1234",
        pin: "1234",
        accountNumber: "1023000002",
        bvn: "32345678901",
        nin: "22345678901",
        kycTier: "Tier 3",
        segment: "Retail",
        sector: "Digital Services",
        monthlyRevenue: 250000,
        walletBalance: 892000,
        riskBand: "Medium",
        joinedAt: timestamp,
        lastLoginAt: timestamp,
      },
    ],
    transactions: [
      {
        id: uid(),
        userId: adebayoId,
        direction: "credit",
        amount: 150000,
        description: "Working capital inflow",
        counterpartyName: "DDB Treasury",
        channel: "top_up",
        status: "completed",
        reference: ref("TOP"),
        createdAt: timestamp,
      },
      {
        id: uid(),
        userId: adebayoId,
        direction: "debit",
        amount: 20000,
        description: "Transfer to Chioma Okafor",
        counterpartyName: "Chioma Okafor",
        counterpartyAccount: "1023000002",
        channel: "wallet_transfer",
        status: "completed",
        reference: ref("TRF"),
        createdAt: timestamp,
      },
      {
        id: uid(),
        userId: chiomaId,
        direction: "credit",
        amount: 20000,
        description: "Transfer from Adebayo Oluwaseun",
        counterpartyName: "Adebayo Oluwaseun",
        counterpartyAccount: "1023000001",
        channel: "wallet_transfer",
        status: "completed",
        reference: ref("TRF"),
        createdAt: timestamp,
      },
      {
        id: uid(),
        userId: adebayoId,
        direction: "credit",
        amount: 1250,
        description: "Daily investment yield",
        counterpartyName: "DDB Yield Engine",
        channel: "yield",
        status: "completed",
        reference: ref("YLD"),
        createdAt: timestamp,
      },
    ],
    loans: [
      {
        id: uid(),
        userId: adebayoId,
        productName: "SME Working Capital",
        purpose: "Inventory restock before planting season",
        amountRequested: 200000,
        amountApproved: 200000,
        interestRate: 14.5,
        tenureMonths: 3,
        monthlyRepayment: 76333.33,
        outstandingBalance: 140000,
        decision: "approved",
        status: "disbursed",
        score: 82,
        scoreBreakdown: [
          { label: "KYC strength", value: 18 },
          { label: "Cash flow footprint", value: 22 },
          { label: "Wallet activity", value: 16 },
          { label: "Risk adjustment", value: -4 },
        ],
        createdAt: timestamp,
        nextRepaymentAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    investments: [
      {
        id: uid(),
        userId: adebayoId,
        productName: "Treasury Income Vault",
        amount: 50000,
        annualYield: 12,
        dailyYield: 16.44,
        yieldAccrued: 1250,
        liquidityDays: 1,
        maturityDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: timestamp,
        status: "active",
      },
    ],
    notifications: [
      {
        id: uid(),
        userId: adebayoId,
        title: "KYC upgrade available",
        message: "Move to Tier 3 to unlock larger transfer and lending limits.",
        kind: "kyc",
        read: false,
        createdAt: timestamp,
      },
      {
        id: uid(),
        userId: adebayoId,
        title: "Loan repayment due soon",
        message: "Your SME Working Capital repayment is due in 4 days.",
        kind: "loan",
        read: false,
        createdAt: timestamp,
      },
    ],
  };
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return seedState();
  }
  try {
    return JSON.parse(stored) as AppState;
  } catch {
    return seedState();
  }
}

function evaluateLoan(user: StoredUser, userTransactions: Transaction[], amount: number) {
  const kycScore = user.kycTier === "Tier 3" ? 22 : user.kycTier === "Tier 2" ? 14 : 8;
  const revenueScore = Math.min(Math.floor(user.monthlyRevenue / 50000), 22);
  const activityScore = Math.min(userTransactions.length * 2, 18);
  const walletScore = Math.min(Math.floor(user.walletBalance / 25000), 16);
  const riskPenalty = user.riskBand === "Low" ? 2 : user.riskBand === "Medium" ? 8 : 16;
  const score = 24 + kycScore + revenueScore + activityScore + walletScore - riskPenalty;
  const maxEligible = Math.round(user.monthlyRevenue * 0.65 + user.walletBalance * 0.25);
  const breakdown = [
    { label: "KYC strength", value: kycScore },
    { label: "Cash flow footprint", value: revenueScore },
    { label: "Wallet activity", value: activityScore + walletScore },
    { label: "Risk adjustment", value: -riskPenalty },
  ];
  let decision: LoanDecision = "declined";
  if (score >= 72 && amount <= maxEligible) {
    decision = "approved";
  } else if (score >= 58) {
    decision = "manual_review";
  }
  return { score, decision, maxEligible, breakdown };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const currentUser = state.users.find((item) => item.id === state.currentUserId) ?? null;
  const publicUsers = state.users.map(toPublicUser);
  const transactions = currentUser ? state.transactions.filter((item) => item.userId === currentUser.id) : [];
  const loans = currentUser ? state.loans.filter((item) => item.userId === currentUser.id) : [];
  const investments = currentUser ? state.investments.filter((item) => item.userId === currentUser.id) : [];
  const notifications = currentUser ? state.notifications.filter((item) => item.userId === currentUser.id) : [];
  const contacts = currentUser ? publicUsers.filter((item) => item.id !== currentUser.id) : [];

  const addNotification = (userId: string, title: string, message: string, kind: NotificationKind) => ({
    id: uid(),
    userId,
    title,
    message,
    kind,
    read: false,
    createdAt: now(),
  });

  const login = (email: string, password: string) => {
    const user = state.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      return { success: false, message: "Invalid email or password." };
    }
    setState((prev) => ({
      ...prev,
      currentUserId: user.id,
      users: prev.users.map((item) =>
        item.id === user.id ? { ...item, lastLoginAt: now() } : item,
      ),
    }));
    return { success: true, message: "Signed in successfully." };
  };

  const signup = (payload: SignupPayload) => {
    if (state.users.some((item) => item.email.toLowerCase() === payload.email.toLowerCase())) {
      return { success: false, message: "An account with that email already exists." };
    }
    if (state.users.some((item) => item.phoneNumber === payload.phoneNumber)) {
      return { success: false, message: "That phone number is already in use." };
    }
    const fullName = `${payload.firstName} ${payload.lastName}`.trim();
    const user: StoredUser = {
      id: uid(),
      fullName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      password: payload.password,
      pin: payload.pin,
      accountNumber: nextAccountNumber(state.users.length + 1),
      bvn: "",
      kycTier: "Tier 1",
      segment: payload.segment,
      businessName: payload.businessName,
      sector: payload.sector,
      monthlyRevenue: payload.monthlyRevenue,
      walletBalance: 50000,
      riskBand: payload.segment === "SME" ? "Medium" : "Low",
      joinedAt: now(),
      lastLoginAt: now(),
    };
    setState((prev) => ({
      ...prev,
      currentUserId: user.id,
      users: [...prev.users, user],
      notifications: [
        addNotification(user.id, "Welcome to DDB", "Your wallet is active. Complete KYC to unlock higher limits.", "system"),
        ...prev.notifications,
      ],
    }));
    return { success: true, message: "Account created successfully." };
  };

  const logout = () => {
    setState((prev) => ({ ...prev, currentUserId: null }));
  };

  const updateUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    setState((prev) => ({
      ...prev,
      users: prev.users.map((item) =>
        item.id === currentUser.id ? { ...item, ...updates } : item,
      ),
    }));
  };

  const topUpWallet = (amount: number) => {
    if (!currentUser || amount <= 0) return;
    setState((prev) => ({
      ...prev,
      users: prev.users.map((item) =>
        item.id === currentUser.id ? { ...item, walletBalance: item.walletBalance + amount } : item,
      ),
      transactions: [
        {
          id: uid(),
          userId: currentUser.id,
          direction: "credit",
          amount,
          description: "Wallet top up",
          counterpartyName: "DDB Funding Rail",
          channel: "top_up",
          status: "completed",
          reference: ref("TOP"),
          createdAt: now(),
        },
        ...prev.transactions,
      ],
    }));
  };

  const transferFunds = (payload: TransferPayload) => {
    if (!currentUser) {
      return { success: false, message: "You need to sign in first." };
    }
    const recipient = state.users.find((item) => item.accountNumber === payload.recipientAccountNumber);
    if (!recipient) {
      return { success: false, message: "Recipient account not found." };
    }
    if (recipient.id === currentUser.id) {
      return { success: false, message: "You cannot transfer to your own account." };
    }
    if (payload.amount <= 0) {
      return { success: false, message: "Enter a valid transfer amount." };
    }
    if (currentUser.walletBalance < payload.amount) {
      return { success: false, message: "Insufficient wallet balance." };
    }
    const reference = ref("TRF");
    setState((prev) => ({
      ...prev,
      users: prev.users.map((item) => {
        if (item.id === currentUser.id) {
          return { ...item, walletBalance: item.walletBalance - payload.amount };
        }
        if (item.id === recipient.id) {
          return { ...item, walletBalance: item.walletBalance + payload.amount };
        }
        return item;
      }),
      transactions: [
        {
          id: uid(),
          userId: currentUser.id,
          direction: "debit",
          amount: payload.amount,
          description: payload.narration || `Transfer to ${recipient.fullName}`,
          counterpartyName: recipient.fullName,
          counterpartyAccount: recipient.accountNumber,
          channel: "wallet_transfer",
          status: "completed",
          reference,
          createdAt: now(),
        },
        {
          id: uid(),
          userId: recipient.id,
          direction: "credit",
          amount: payload.amount,
          description: payload.narration || `Transfer from ${currentUser.fullName}`,
          counterpartyName: currentUser.fullName,
          counterpartyAccount: currentUser.accountNumber,
          channel: "wallet_transfer",
          status: "completed",
          reference,
          createdAt: now(),
        },
        ...prev.transactions,
      ],
      notifications: [
        addNotification(currentUser.id, "Transfer completed", `₦${payload.amount.toLocaleString()} sent to ${recipient.fullName}.`, "transaction"),
        addNotification(recipient.id, "Wallet credited", `₦${payload.amount.toLocaleString()} received from ${currentUser.fullName}.`, "transaction"),
        ...prev.notifications,
      ],
    }));
    return { success: true, message: `Transfer sent to ${recipient.fullName}.` };
  };

  const requestLoan = (payload: LoanPayload) => {
    if (!currentUser) {
      return { success: false, message: "You need to sign in first." };
    }
    const evaluation = evaluateLoan(currentUser, transactions, payload.amount);
    const amountApproved =
      evaluation.decision === "approved" ? Math.min(payload.amount, evaluation.maxEligible) : 0;
    const monthlyRepayment =
      amountApproved > 0 ? (amountApproved * 1.145) / Math.max(payload.tenureMonths, 1) : 0;
    const application: LoanApplication = {
      id: uid(),
      userId: currentUser.id,
      productName: payload.productName,
      purpose: payload.purpose,
      amountRequested: payload.amount,
      amountApproved,
      interestRate: 14.5,
      tenureMonths: payload.tenureMonths,
      monthlyRepayment,
      outstandingBalance: amountApproved > 0 ? amountApproved * 1.145 : 0,
      decision: evaluation.decision,
      status:
        evaluation.decision === "approved"
          ? "disbursed"
          : evaluation.decision === "manual_review"
            ? "under_review"
            : "declined",
      score: evaluation.score,
      scoreBreakdown: evaluation.breakdown,
      createdAt: now(),
      nextRepaymentAt:
        evaluation.decision === "approved"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
    };

    setState((prev) => ({
      ...prev,
      users:
        evaluation.decision === "approved"
          ? prev.users.map((item) =>
              item.id === currentUser.id ? { ...item, walletBalance: item.walletBalance + amountApproved } : item,
            )
          : prev.users,
      loans: [application, ...prev.loans],
      transactions:
        evaluation.decision === "approved"
          ? [
              {
                id: uid(),
                userId: currentUser.id,
                direction: "credit",
                amount: amountApproved,
                description: `${payload.productName} disbursement`,
                counterpartyName: "DDB Credit Engine",
                channel: "loan_disbursement",
                status: "completed",
                reference: ref("LOAN"),
                createdAt: now(),
              },
              ...prev.transactions,
            ]
          : prev.transactions,
      notifications: [
        addNotification(
          currentUser.id,
          evaluation.decision === "approved" ? "Loan approved" : evaluation.decision === "manual_review" ? "Loan under review" : "Loan request declined",
          evaluation.decision === "approved"
            ? `₦${amountApproved.toLocaleString()} has been disbursed to your wallet.`
            : evaluation.decision === "manual_review"
              ? "Your application has enough promise for manual underwriting review."
              : "Your current data footprint does not yet meet this product threshold.",
          "loan",
        ),
        ...prev.notifications,
      ],
    }));

    return {
      success: evaluation.decision !== "declined",
      message:
        evaluation.decision === "approved"
          ? "Loan approved and disbursed."
          : evaluation.decision === "manual_review"
            ? "Loan submitted for manual review."
            : "Loan application declined.",
      application,
    };
  };

  const createInvestment = (payload: InvestmentPayload) => {
    if (!currentUser) {
      return { success: false, message: "You need to sign in first." };
    }
    if (payload.amount < 500) {
      return { success: false, message: "Investment minimum is ₦500." };
    }
    if (currentUser.walletBalance < payload.amount) {
      return { success: false, message: "Insufficient wallet balance." };
    }
    const investment: InvestmentPosition = {
      id: uid(),
      userId: currentUser.id,
      productName: payload.productName,
      amount: payload.amount,
      annualYield: payload.annualYield,
      dailyYield: Number(((payload.amount * payload.annualYield) / 100 / 365).toFixed(2)),
      yieldAccrued: 0,
      liquidityDays: payload.liquidityDays,
      maturityDate: new Date(Date.now() + payload.tenureDays * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now(),
      status: "active",
    };
    setState((prev) => ({
      ...prev,
      users: prev.users.map((item) =>
        item.id === currentUser.id ? { ...item, walletBalance: item.walletBalance - payload.amount } : item,
      ),
      investments: [investment, ...prev.investments],
      transactions: [
        {
          id: uid(),
          userId: currentUser.id,
          direction: "debit",
          amount: payload.amount,
          description: `${payload.productName} subscription`,
          counterpartyName: "DDB Investment Desk",
          channel: "investment",
          status: "completed",
          reference: ref("INV"),
          createdAt: now(),
        },
        ...prev.transactions,
      ],
      notifications: [
        addNotification(currentUser.id, "Investment booked", `${payload.productName} has been added to your portfolio.`, "investment"),
        ...prev.notifications,
      ],
    }));
    return { success: true, message: "Investment created successfully." };
  };

  const markNotificationAsRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      ),
    }));
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) =>
        item.userId === currentUser.id ? { ...item, read: true } : item,
      ),
    }));
  };

  const getUnreadCount = () => notifications.filter((item) => !item.read).length;

  return (
    <AppContext.Provider
      value={{
        isAuthenticated: Boolean(currentUser),
        user: currentUser ? toPublicUser(currentUser) : null,
        users: publicUsers,
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
        getUnreadCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
