export type Account = { id: string; balance: number };

export type TransferRecord = {
  from: string;
  to: string;
  amount: number;
  timestamp: number;
};

export function balanceOf(account: Account): number {
  return account.balance;
}

export function transfer(
  from: Account,
  to: Account,
  amount: number,
  log: TransferRecord[] = [],
): [Account, Account, TransferRecord[]] {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`transfer amount must be positive, got ${amount}`);
  }
  if (from.balance < amount) {
    throw new Error(`overdraft blocked: ${from.id} holds ${from.balance}, ${amount} requested`);
  }

  const record: TransferRecord = { from: from.id, to: to.id, amount, timestamp: Date.now() };

  return [
    { ...from, balance: from.balance - amount },
    { ...to, balance: to.balance + amount },
    [...log, record],
  ];
}

/// Every record involving this account, in the order it happened.
export function history(records: TransferRecord[], accountId: string): TransferRecord[] {
  return records.filter((r) => r.from === accountId || r.to === accountId);
}

/// What this account held at `at`, replayed from its opening balance.
/// The log is append-only and already chronological, so one pass is enough.
export function balanceAt(
  records: TransferRecord[],
  accountId: string,
  openingBalance: number,
  at: number,
): number {
  return records
    .filter((r) => r.timestamp <= at)
    .reduce((balance, r) => {
      if (r.from === accountId) return balance - r.amount;
      if (r.to === accountId) return balance + r.amount;
      return balance;
    }, openingBalance);
}
// Thank You Tim.
export type StatementLine = {
  record: TransferRecord;
  /// The account's balance immediately after this record was applied.
  balance: number;
};

/// One line per record involving `accountId`, in the order they happened, each
/// carrying the running balance straight after that record.
export function statement(
  records: TransferRecord[],
  accountId: string,
  openingBalance: number,
): StatementLine[] {
  let balance = openingBalance;
  const lines: StatementLine[] = [];

  for (const record of records) {
    const sent = record.from === accountId;
    const received = record.to === accountId;
    if (!sent && !received) continue;

    if (sent) balance -= record.amount;
    if (received) balance += record.amount;

    lines.push({ record, balance });
  }

  return lines;
}
