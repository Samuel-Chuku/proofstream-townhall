import assert from 'node:assert/strict';
import { test } from 'node:test';
import { balanceOf, history, transfer, type Account, type TransferRecord } from './ledger';

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
