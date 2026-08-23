import assert from 'node:assert/strict';
import { test } from 'node:test';
import { balanceAt, balanceOf, history, statement, transfer, type Account, type StatementLine, type TransferRecord } from './ledger';

const alice = (): Account => ({ id: 'alice', balance: 100 });
const bob = (): Account => ({ id: 'bob', balance: 50 });

test('a transfer moves the amount', () => {
  const [from, to] = transfer(alice(), bob(), 30);
  assert.equal(balanceOf(from), 70);
  assert.equal(balanceOf(to), 80);
});

test('an overdraft is blocked', () => {
  assert.throws(() => transfer(alice(), bob(), 500), /overdraft/);
});

test('history returns only records involving the account', () => {
  const log: TransferRecord[] = [
    { from: 'alice', to: 'bob', amount: 30, timestamp: 100 },
    { from: 'carol', to: 'dave', amount: 5, timestamp: 200 },
  ];
  assert.equal(history(log, 'alice').length, 1);
});

const log: TransferRecord[] = [
  { from: 'alice', to: 'bob', amount: 30, timestamp: 100 },
  { from: 'carol', to: 'alice', amount: 10, timestamp: 200 },
  { from: 'alice', to: 'bob', amount: 5, timestamp: 300 },
];

test('balanceAt reconstructs a balance for an account that both sent and received', () => {
  assert.equal(balanceAt(log, 'alice', 100, 150), 70);
  assert.equal(balanceAt(log, 'alice', 100, 250), 80);
  assert.equal(balanceAt(log, 'alice', 100, 999), 75);
});

test('balanceAt before any activity is the opening balance', () => {
  assert.equal(balanceAt(log, 'alice', 100, 50), 100);
});

test('balanceAt ignores accounts it was not asked about', () => {
  assert.equal(balanceAt(log, 'dave', 40, 999), 40);
});

test('statement returns one line per record involving the account', () => {
  const lines = statement(log, 'alice', 100);
  assert.equal(lines.length, 3);
  assert.deepEqual(lines.map((l) => l.balance), [70, 80, 75]);
});

test('statement is chronological and carries the record itself', () => {
  const lines = statement(log, 'alice', 100);
  assert.deepEqual(lines.map((l) => l.record.timestamp), [100, 200, 300]);
  assert.equal(lines[1].record.from, 'carol');
});

test('an account with no records has an empty statement', () => {
  assert.deepEqual(statement(log, 'dave', 40), []);
});

test('a transfer to self nets to zero but still appears', () => {
  const selfPay: TransferRecord[] = [{ from: 'alice', to: 'alice', amount: 25, timestamp: 400 }];
  const lines = statement(selfPay, 'alice', 100);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].balance, 100);
});

test('the final statement balance agrees with balanceAt', () => {
  const lines = statement(log, 'alice', 100);
  assert.equal(lines[lines.length - 1].balance, balanceAt(log, 'alice', 100, 999));
});
