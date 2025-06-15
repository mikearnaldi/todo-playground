import { describe, it, expect } from "@effect/vitest";
import { FastCheck, Schema } from "effect";
import { ConcurrencySchema } from "../src/cmd/syncTodos.js";

// Helper to decode with ConcurrencySchema
const decode = (input: unknown) =>
  Schema.decodeUnknownSync(ConcurrencySchema)(input);

describe("ConcurrencySchema", () => {
  it("accepts 'unbounded'", () => {
    expect(() => decode("unbounded")).not.toThrow();
    expect(decode("unbounded")).toBe("unbounded");
  });

  it("accepts positive integer strings", () => {
    FastCheck.assert(
      FastCheck.property(
        FastCheck.integer({ min: 1, max: 10000 }),
        (n: number) => {
          const str = n.toString();
          expect(decode(str)).toBe(n);
        }
      )
    );
  });

  it("rejects zero, negative, and non-integer strings", () => {
    const badInputs = [
      "0",
      "-1",
      "-100",
      "1.5",
      "abc",
      "",
      "Infinity",
      "NaN",
      " ",
      null,
      undefined,
      {},
      [],
    ];
    for (const input of badInputs) {
      expect(() => decode(input)).toThrow();
    }
  });

  it("rejects other strings", () => {
    const badStrings = ["unbound", "unboundedness", "bounded", "none", "all"];
    for (const input of badStrings) {
      expect(() => decode(input)).toThrow();
    }
  });
});
