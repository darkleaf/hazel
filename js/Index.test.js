import { describe, expect, test } from "bun:test";

import Index from "./Index.js"

describe("", () => {
  test("", async () => {
    const db = {
      "1": {
        // type: branch
        level: 1,
        keys: [2, 4, 6],
        addresses: ["2", "3", "4"],
      },
      "2": {
        level: 0,
        keys: [1, 2],
      },
      "3": {
        level: 0,
        keys: [3, 4],
      },
      "4": {
        level: 0,
        keys: [5, 6],
      },
    }

    const loader = async (address) => db[address]

    const root = "1"

    const set = new Index(root, loader)

    expect(
      await Array.fromAsync(set.seek())
    ).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
