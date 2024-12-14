import { describe, expect, test } from "bun:test";

import BTreeSet from "./BTreeSet.js"


describe("", () => {
  test("", async () => {
    const key = x => [x] // to not use primitives
    const db = {
      "1": {
        // type: branch
        level: 1,
        keys: [key(2), key(4), key(6)],
        addresses: ["2", "3", "4"],
      },
      "2": {
        level: 0,
        keys: [key(1), key(2)],
      },
      "3": {
        level: 0,
        keys: [key(3), key(4)],
      },
      "4": {
        level: 0,
        keys: [key(5), key(6)],
      },
    }

    const loader = async (address) => db[address]

    const root = "1"

    const set = new BTreeSet(root, loader)

    const all = []
    for await (const i of set.seek()) {
      all.push(i)
    }


    expect(all).toEqual([
      key(1),
      key(2),
      key(3),
      key(4),
      key(5),
      key(6),
    ]);
  });
});
