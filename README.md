# ProofStream: live demo

A tiny ledger module. A ProofStream milestone is open against this repository,
and an autonomous agent judges every merge into `main` against it.

## The milestone

> A caller should be able to find out what an account balance was at an earlier
> point in time, using the transfer history that `src/ledger.ts` already keeps.
> Cover it with unit tests in `src/ledger.test.ts`, including an account that
> both sent and received.

Two things are asked for: the function, and the tests.

## What to watch

| PR | What it contains | What the agents should say |
| --- | --- | --- |
| #1 | `balanceAt`, and no tests | partially done — the function is there, the tests are not |
| #2 | the tests | done |


```bash
npm install && npm test
```
