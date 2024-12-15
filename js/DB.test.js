import { describe, expect, test } from "bun:test";
import DB from "./DB.js"

/*
  (for [i (range 4)
        j (range 4)]
    {:i i
     :j j})
*/

import ij from "./ij.json"
const t = ij[0]["max-tx"] // они все в одной транзакции, не отфльтровал я t в clj

async function loader(addr) {
  return ij[addr]
}

const db = new DB(
  {
    eav: ij[0].eavt,
  },
  loader,
)

describe("eav.datoms", () => {
  test("", async () => {
    expect(
      await Array.fromAsync(db.eav.datoms())
    ).toEqual([
      [1,  "i", 0, t],
      [1,  "j", 0, t],
      [2,  "i", 0, t],
      [2,  "j", 1, t],
      [3,  "i", 0, t],
      [3,  "j", 2, t],
      [4,  "i", 0, t],
      [4,  "j", 3, t],
      [5,  "i", 1, t],
      [5,  "j", 0, t],
      [6,  "i", 1, t],
      [6,  "j", 1, t],
      [7,  "i", 1, t],
      [7,  "j", 2, t],
      [8,  "i", 1, t],
      [8,  "j", 3, t],
      [9,  "i", 2, t],
      [9,  "j", 0, t],
      [10, "i", 2, t],
      [10, "j", 1, t],
      [11, "i", 2, t],
      [11, "j", 2, t],
      [12, "i", 2, t],
      [12, "j", 3, t],
      [13, "i", 3, t],
      [13, "j", 0, t],
      [14, "i", 3, t],
      [14, "j", 1, t],
      [15, "i", 3, t],
      [15, "j", 2, t],
      [16, "i", 3, t],
      [16, "j", 3, t],
    ]);
  });

  test("e", async () => {
    expect(
      await Array.fromAsync(db.eav.datoms(0))
    ).toEqual([
    ]);

    expect(
      await Array.fromAsync(db.eav.datoms(1))
    ).toEqual([
      [1,  "i", 0, t],
      [1,  "j", 0, t],
    ]);

    expect(
      await Array.fromAsync(db.eav.datoms(2))
    ).toEqual([
      [2,  "i", 0, t],
      [2,  "j", 1, t],
    ]);

    expect(
      await Array.fromAsync(db.eav.datoms(16))
    ).toEqual([
      [16, "i", 3, t],
      [16, "j", 3, t],
    ]);

    expect(
      await Array.fromAsync(db.eav.datoms(17))
    ).toEqual([
    ]);
  });

  test("ea", async () => {
    expect(
      await Array.fromAsync(db.eav.datoms(0, "a"))
    ).toEqual([
    ]);

    expect(
      await Array.fromAsync(db.eav.datoms(1, "i"))
    ).toEqual([
      [1,  "i", 0, t],
    ]);

    expect(
      await Array.fromAsync(db.eav.datoms(17, "z"))
    ).toEqual([
    ]);
  });

  test("eav", async () => {
    expect(
      await Array.fromAsync(db.eav.datoms(0, "a", 0))
    ).toEqual([
    ]);

    expect(
      await Array.fromAsync(db.eav.datoms(1, "i", 0))
    ).toEqual([
      [1,  "i", 0, t],
    ]);

    expect(
      await Array.fromAsync(db.eav.datoms(17, "z", 9))
    ).toEqual([
    ]);
  });
});
