import { describe, expect, test } from "bun:test";

import Tree from './Tree';
import PatchedTree from './PatchedTree';

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

// числу нельзя приклеить ops,
// для теста ок
const patchAndOps = new Map([
  [4, false],
  [1, true],
  [3, true],
  [3.5, true],
  [7, true]
]);
const patch = patchAndOps.keys().toArray();
function op(key) {
  return patchAndOps.get(key);
}

const baseSet = new Tree(loader, cmp, root);
const set     = new PatchedTree(baseSet, cmp, patch, op);

describe("seek", () => {
  test("no args", async () => {
    expect(
      await Array.fromAsync(set.seek())
    ).toEqual([1, 2, 3, 3.5,    6, 7]);
    //        [   2,         4, 6]
  });
});

// todo: more tests
