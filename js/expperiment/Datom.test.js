import { describe, expect, test } from "bun:test"

import Datom from "./Datom.js"

describe("Datom", () => {
  test("", () => {
    const d = new Datom(1, "attr", "value")

    expect(d.e).toBe(1)
    expect(d.a).toBe("attr")
    expect(d.v).toBe("value")

    const [e, a, v] = d;

    expect(e).toBe(1)
    expect(a).toBe("attr")
    expect(v).toBe("value")
  });
});
