import test from "node:test";
import assert from "node:assert/strict";
import { scoreLead } from "../server/tools/scoreLead.js";

test("scoreLead scores a strong lead as Hot", async () => {
  const result = await scoreLead.execute({
    companySize: 150,
    budget: 15000,
    engagement: "high",
  });

  assert.equal(result.category, "Hot");
  assert.equal(result.score, 100);
});

test("scoreLead scores a mid-size lead as Warm", async () => {
  const result = await scoreLead.execute({
    companySize: 60,
    budget: 6000,
    engagement: "medium",
  });

  assert.equal(result.category, "Warm");
  assert.equal(result.score, 65);
});

test("scoreLead scores a small lead as Cold", async () => {
  const result = await scoreLead.execute({
    companySize: 10,
    budget: 1000,
    engagement: "low",
  });

  assert.equal(result.category, "Cold");
  assert.equal(result.score, 30);
});

test("scoreLead echoes the validated input back", async () => {
  const result = await scoreLead.execute({
    companySize: 200,
    budget: 50000,
    engagement: "high",
  });

  assert.equal(result.companySize, 200);
  assert.equal(result.budget, 50000);
  assert.equal(result.engagement, "high");
});

test("scoreLead accepts the minimum valid input", async () => {
  const result = await scoreLead.execute({
    companySize: 1,
    budget: 0,
    engagement: "low",
  });

  assert.equal(result.score, 30);
  assert.equal(result.category, "Cold");
});

test("scoreLead schema rejects invalid engagement values", () => {
  const parsed = scoreLead.inputSchema.safeParse({
    companySize: 100,
    budget: 10000,
    engagement: "very-high",
  });

  assert.equal(parsed.success, false);
});

test("scoreLead schema rejects non-integer company size", () => {
  const parsed = scoreLead.inputSchema.safeParse({
    companySize: 10.5,
    budget: 10000,
    engagement: "high",
  });

  assert.equal(parsed.success, false);
});

test("scoreLead schema rejects missing budget", () => {
  const parsed = scoreLead.inputSchema.safeParse({
    companySize: 100,
    engagement: "high",
  });

  assert.equal(parsed.success, false);
});