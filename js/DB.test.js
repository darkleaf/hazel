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
    aev: ij[0].aevt,
    ave: ij[0].avet,
  },
  loader,
)

function testIdx(idx, method, cases) {
  describe(idx + "." + method, () => {
    test.each(cases)("%p", async (components, expected) => {
      expect(
        await Array.fromAsync(db[idx][method](...components))
      ).toEqual(expected)
    })
  })
}

testIdx("eav", "datoms", [
  [[], [
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
  ]],

  [[0], [
  ]],

  [[1], [
    [1,  "i", 0, t],
    [1,  "j", 0, t],
  ]],

  [[2], [
    [2,  "i", 0, t],
    [2,  "j", 1, t],
  ]],

  [[16], [
    [16, "i", 3, t],
    [16, "j", 3, t],
  ]],

  [[17], [
  ]],

  [[0, "a"], [
  ]],

  [[1, "i"], [
    [1,  "i", 0, t],
  ]],

  [[17, "z"], [
  ]],

  [[0, "a", 0], [
  ]],

  [[1, "i", 0], [
    [1,  "i", 0, t],
  ]],

  [[17, "z", 9], [
  ]],

])

testIdx("aev", "datoms", [
  [[], [
    [1,  "i", 0, t],
    [2,  "i", 0, t],
    [3,  "i", 0, t],
    [4,  "i", 0, t],
    [5,  "i", 1, t],
    [6,  "i", 1, t],
    [7,  "i", 1, t],
    [8,  "i", 1, t],
    [9,  "i", 2, t],
    [10, "i", 2, t],
    [11, "i", 2, t],
    [12, "i", 2, t],
    [13, "i", 3, t],
    [14, "i", 3, t],
    [15, "i", 3, t],
    [16, "i", 3, t],
    [1,  "j", 0, t],
    [2,  "j", 1, t],
    [3,  "j", 2, t],
    [4,  "j", 3, t],
    [5,  "j", 0, t],
    [6,  "j", 1, t],
    [7,  "j", 2, t],
    [8,  "j", 3, t],
    [9,  "j", 0, t],
    [10, "j", 1, t],
    [11, "j", 2, t],
    [12, "j", 3, t],
    [13, "j", 0, t],
    [14, "j", 1, t],
    [15, "j", 2, t],
    [16, "j", 3, t],
  ]],

  [["a"], [
  ]],

  [["i"], [
    [1,  "i", 0, t],
    [2,  "i", 0, t],
    [3,  "i", 0, t],
    [4,  "i", 0, t],
    [5,  "i", 1, t],
    [6,  "i", 1, t],
    [7,  "i", 1, t],
    [8,  "i", 1, t],
    [9,  "i", 2, t],
    [10, "i", 2, t],
    [11, "i", 2, t],
    [12, "i", 2, t],
    [13, "i", 3, t],
    [14, "i", 3, t],
    [15, "i", 3, t],
    [16, "i", 3, t],
  ]],

  [["j"], [
    [1,  "j", 0, t],
    [2,  "j", 1, t],
    [3,  "j", 2, t],
    [4,  "j", 3, t],
    [5,  "j", 0, t],
    [6,  "j", 1, t],
    [7,  "j", 2, t],
    [8,  "j", 3, t],
    [9,  "j", 0, t],
    [10, "j", 1, t],
    [11, "j", 2, t],
    [12, "j", 3, t],
    [13, "j", 0, t],
    [14, "j", 1, t],
    [15, "j", 2, t],
    [16, "j", 3, t],
  ]],

  [["z"], [
  ]],

  [["a", 0], [
  ]],

  [["i", 1], [
    [1, "i", 0, t],
  ]],

  [["z", 17], [
  ]],

  [["a", 0, 0], [
  ]],

  [["i", 1, 0], [
    [1, "i", 0, t],
  ]],

  [["z", 17, 0], [
  ]],
])

testIdx("ave", "datoms", [
  [[], [
    [1,  "i", 0, t],
    [2,  "i", 0, t],
    [3,  "i", 0, t],
    [4,  "i", 0, t],
    [5,  "i", 1, t],
    [6,  "i", 1, t],
    [7,  "i", 1, t],
    [8,  "i", 1, t],
    [9,  "i", 2, t],
    [10, "i", 2, t],
    [11, "i", 2, t],
    [12, "i", 2, t],
    [13, "i", 3, t],
    [14, "i", 3, t],
    [15, "i", 3, t],
    [16, "i", 3, t],
    [1,  "j", 0, t],
    [5,  "j", 0, t],
    [9,  "j", 0, t],
    [13, "j", 0, t],
    [2,  "j", 1, t],
    [6,  "j", 1, t],
    [10, "j", 1, t],
    [14, "j", 1, t],
    [3,  "j", 2, t],
    [7,  "j", 2, t],
    [11, "j", 2, t],
    [15, "j", 2, t],
    [4,  "j", 3, t],
    [8,  "j", 3, t],
    [12, "j", 3, t],
    [16, "j", 3, t],
  ]],

  [["a"], [
  ]],

  [["i"], [
    [1,  "i", 0, t],
    [2,  "i", 0, t],
    [3,  "i", 0, t],
    [4,  "i", 0, t],
    [5,  "i", 1, t],
    [6,  "i", 1, t],
    [7,  "i", 1, t],
    [8,  "i", 1, t],
    [9,  "i", 2, t],
    [10, "i", 2, t],
    [11, "i", 2, t],
    [12, "i", 2, t],
    [13, "i", 3, t],
    [14, "i", 3, t],
    [15, "i", 3, t],
    [16, "i", 3, t],
  ]],

  [["j"], [
    [1,  "j", 0, t],
    [5,  "j", 0, t],
    [9,  "j", 0, t],
    [13, "j", 0, t],
    [2,  "j", 1, t],
    [6,  "j", 1, t],
    [10, "j", 1, t],
    [14, "j", 1, t],
    [3,  "j", 2, t],
    [7,  "j", 2, t],
    [11, "j", 2, t],
    [15, "j", 2, t],
    [4,  "j", 3, t],
    [8,  "j", 3, t],
    [12, "j", 3, t],
    [16, "j", 3, t],
  ]],

  [["z"], [
  ]],


  [["a", -1], [
  ]],

  [["i", 0], [
    [1,  "i", 0, t],
    [2,  "i", 0, t],
    [3,  "i", 0, t],
    [4,  "i", 0, t],
  ]],

  [["j", 1], [
    [2,  "j", 1, t],
    [6,  "j", 1, t],
    [10, "j", 1, t],
    [14, "j", 1, t],
  ]],

  [["z", 9], [
  ]],


  [["a", -1, 0], [
  ]],

  [["i", 0, 1], [
    [1,  "i", 0, t],
  ]],

  [["j", 1, 6], [
    [6,  "j", 1, t],
  ]],

  [["z", 9, 0], [
  ]],
])
