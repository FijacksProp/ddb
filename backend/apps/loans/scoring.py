from datetime import timedelta
from decimal import Decimal

from django.utils import timezone


def _score_by_ratio(current: float, target: float, max_points: int) -> int:
    if target <= 0:
        return 0
    ratio = max(0.0, min(current / target, 1.0))
    return int(round(ratio * max_points))


def _month_key(dt):
    return f"{dt.year}-{dt.month:02d}"


def evaluate_loan_eligibility(user, wallet, transfers, ledger_entries):
    now = timezone.now()
    thirty_days_ago = now - timedelta(days=30)

    transfer_count = transfers.count()
    recent_login_days = (now - (user.last_login or user.date_joined)).days

    credit_entries = ledger_entries.filter(entry_type="credit")
    debit_entries = ledger_entries.filter(entry_type="debit")

    total_inflow = sum((entry.amount for entry in credit_entries if entry.category != "loan_disbursement"), Decimal("0.00"))
    total_outflow = sum((entry.amount for entry in debit_entries), Decimal("0.00"))
    avg_monthly_inflow = total_inflow / Decimal("3.00")

    months = {_month_key(now), _month_key(now - timedelta(days=31)), _month_key(now - timedelta(days=62))}
    inflow_by_month = {month: Decimal("0.00") for month in months}
    for entry in credit_entries:
        if entry.category == "loan_disbursement":
            continue
        inflow_by_month[_month_key(entry.created_at)] = inflow_by_month.get(_month_key(entry.created_at), Decimal("0.00")) + entry.amount
    consistent_income_months = sum(1 for amount in inflow_by_month.values() if amount >= Decimal("25000.00"))
    consistent_income_score = _score_by_ratio(float(consistent_income_months), 3.0, 15)

    recent_balances = [
        entry.running_balance for entry in ledger_entries.filter(created_at__gte=thirty_days_ago).only("running_balance")
    ]
    average_recent_balance = (sum(recent_balances, Decimal("0.00")) / Decimal(len(recent_balances))) if recent_balances else Decimal(wallet.available_balance)
    retention_target = max(avg_monthly_inflow * Decimal("0.35"), Decimal("25000.00"))
    savings_retention_score = _score_by_ratio(float(average_recent_balance), float(retention_target), 10)

    if total_inflow <= 0:
        outflow_to_inflow_score = 0
    else:
        ratio = float(total_outflow / total_inflow)
        if ratio <= 0.65:
            outflow_to_inflow_score = 10
        elif ratio >= 1.10:
            outflow_to_inflow_score = 0
        else:
            outflow_to_inflow_score = int(round((1.10 - ratio) / 0.45 * 10))

    cash_flow_total = consistent_income_score + savings_retention_score + outflow_to_inflow_score

    account_age_days = max((now - user.date_joined).days, 0)
    account_tenure_score = _score_by_ratio(float(account_age_days), 730.0, 15)

    bill_keywords = ("airtime", "data", "electricity", "utility", "water", "dstv", "gotv", "subscription", "bill")
    bill_transfer_count = 0
    for transfer in transfers:
        if transfer.sender_id != user.id:
            continue
        narration = (transfer.narration or "").lower()
        if any(keyword in narration for keyword in bill_keywords):
            bill_transfer_count += 1
    bill_ledger_count = debit_entries.filter(category__in=["bill_payment", "airtime", "utility", "subscription"]).count()
    consistent_bill_payment_score = _score_by_ratio(float(bill_transfer_count + bill_ledger_count), 6.0, 10)

    transaction_frequency_score = _score_by_ratio(float(transfer_count), 30.0, 10)
    account_behavior_total = account_tenure_score + consistent_bill_payment_score + transaction_frequency_score

    kyc_base = {"tier_1": 6, "tier_2": 10, "tier_3": 12}.get(user.kyc_tier, 4)
    verification_bonus = 0
    verification_bonus += 1 if user.is_bvn_verified else 0
    verification_bonus += 1 if bool(user.nin) else 0
    verification_bonus += 1 if getattr(user, "government_id_verified", False) else 0
    verification_bonus += 1 if getattr(user, "biometric_verified", False) else 0
    verification_bonus += 1 if getattr(user, "proof_of_address_verified", False) else 0
    kyc_identity_score = min(kyc_base + verification_bonus, 15)

    if recent_login_days <= 2:
        login_score = 4
    elif recent_login_days <= 7:
        login_score = 3
    elif recent_login_days <= 30:
        login_score = 2
    elif recent_login_days <= 90:
        login_score = 1
    else:
        login_score = 0
    security_score = int(round(max(min(getattr(user, "security_profile_score", 7), 10), 0) * 0.6))
    app_engagement_score = min(login_score + security_score, 10)

    profile_signals = [
        bool(user.full_name),
        bool(user.phone_number),
        bool(user.email),
        bool(user.sector),
        bool(user.bvn),
        bool(user.nin),
        bool(getattr(user, "next_of_kin_name", "")),
        bool(getattr(user, "profile_photo_url", "")),
        bool(getattr(user, "linked_cards_count", 0) > 0),
    ]
    profile_completeness_score = _score_by_ratio(float(sum(profile_signals)), float(len(profile_signals)), 5)
    digital_footprint_total = kyc_identity_score + app_engagement_score + profile_completeness_score

    total_score = max(min(cash_flow_total + account_behavior_total + digital_footprint_total, 100), 0)

    if total_score >= 75:
        decision = "approved"
        multiplier = Decimal("0.65")
    elif total_score >= 55:
        decision = "manual_review"
        multiplier = Decimal("0.40")
    else:
        decision = "declined"
        multiplier = Decimal("0.00")

    risk_band_adjustment = {"low": Decimal("1.00"), "medium": Decimal("0.90"), "high": Decimal("0.78")}.get(user.risk_band, Decimal("0.85"))
    max_amount = (
        (Decimal(user.monthly_revenue or 0) * multiplier)
        + (Decimal(wallet.available_balance) * Decimal("0.20"))
    ) * risk_band_adjustment

    category_scores = [
        {"category": "cash_flow_capacity", "label": "Cash Flow & Capacity", "value": cash_flow_total, "max": 35},
        {"category": "account_behavior_reliability", "label": "Account Behavior & Reliability", "value": account_behavior_total, "max": 35},
        {"category": "digital_footprint_security", "label": "Digital Footprint & Security", "value": digital_footprint_total, "max": 30},
    ]

    breakdown = [
        {"factor": "consistent_income_deposits", "category": "cash_flow_capacity", "label": "Consistent Income/Deposits", "value": consistent_income_score, "max": 15},
        {"factor": "savings_retention", "category": "cash_flow_capacity", "label": "Savings Retention", "value": savings_retention_score, "max": 10},
        {"factor": "outflow_to_inflow_ratio", "category": "cash_flow_capacity", "label": "Outflow-to-Inflow Ratio", "value": outflow_to_inflow_score, "max": 10},
        {"factor": "account_tenure", "category": "account_behavior_reliability", "label": "Account Tenure", "value": account_tenure_score, "max": 15},
        {"factor": "consistent_bill_payments", "category": "account_behavior_reliability", "label": "Consistent Bill Payments", "value": consistent_bill_payment_score, "max": 10},
        {"factor": "transaction_frequency", "category": "account_behavior_reliability", "label": "Transaction Frequency", "value": transaction_frequency_score, "max": 10},
        {"factor": "kyc_identity_verification", "category": "digital_footprint_security", "label": "KYC & Identity Verification", "value": kyc_identity_score, "max": 15},
        {"factor": "app_engagement_security", "category": "digital_footprint_security", "label": "App Engagement & Security", "value": app_engagement_score, "max": 10},
        {"factor": "profile_completeness", "category": "digital_footprint_security", "label": "Profile Completeness", "value": profile_completeness_score, "max": 5},
    ]

    return {
        "score": total_score,
        "decision": decision,
        "max_amount": max(max_amount, Decimal("0.00")),
        "category_scores": category_scores,
        "breakdown": breakdown,
    }
