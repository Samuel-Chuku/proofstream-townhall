import assert from 'node:assert/strict';
import { test } from 'node:test';
import { balanceAt, balanceOf, history, transfer, type Account, type TransferRecord } from './ledger';

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
