import { describe, expect, test } from "bun:test";

import Index from "./Index.js"

const root = "1"
const db = {
  // 2 4 6
  "1": {
    // type: branch
    level: 1,
    keys: [2, 4, 6],
    addresses: ["2", "3", "4"],
  },
  "2": {
    level: 0,
    keys: [2],
  },
  "3": {
    level: 0,
    keys: [4],
  },
  "4": {
    level: 0,
    keys: [6],
  },
}

async function loader(address) {
  return db[address]
}

function cmp(a, b) {
  return a - b
}

const set = new Index(loader, cmp, root,)

describe("seek", () => {
  test("no args", async () => {
    expect(
      await Array.fromAsync(set.seek())
    ).toEqual([2, 4, 6]);
  });

  test("x >= from", async () => {
    expect(
      await Array.fromAsync(set.seek(4))
    ).toEqual([4, 6]);

    expect(
      await Array.fromAsync(set.seek(3))
    ).toEqual([4, 6]);
  });

  test("not in a set", async () => {
    expect(
      await Array.fromAsync(set.seek(7))
    ).toEqual([]);
  });
});

describe("rseek", () => {
  test("no args", async () => {
    expect(
      await Array.fromAsync(set.rseek())
    ).toEqual([6, 4, 2]);
  });

  test("x <= from", async () => {
    expect(
      await Array.fromAsync(set.rseek(4))
    ).toEqual([4, 2]);

    expect(
      await Array.fromAsync(set.rseek(5))
    ).toEqual([4, 2]);
  });

  test("not in a set", async () => {
    expect(
      await Array.fromAsync(set.rseek(1))
    ).toEqual([]);
  });
});

const setTail = new Index(
  loader, cmp, root,
  [1, 3, 3.5, 7],
  [4]
)

describe("seek with tail", () => {
  test("no args", async () => {
    expect(
      await Array.fromAsync(setTail.seek())
    ).toEqual([1, 2, 3, 3.5,    6, 7]);
    //        [   2,         4, 6]
  });
});
