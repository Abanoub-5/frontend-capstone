import test from "node:test";
import assert from "node:assert/strict";
import {
  escapeHtml,
  parseSSE,
  getRemainingBuffer,
  httpError,
  getErrorDetails,
} from "../src/chatUtils.js";

test("escapeHtml escapes special characters", () => {
  assert.equal(escapeHtml(`<script>alert("x")</script>`), "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  assert.equal(escapeHtml("a&b'c"), "a&amp;b&#039;c");
  assert.equal(escapeHtml("plain text"), "plain text");
});

test("parseSSE parses complete events and ignores incomplete chunks", () => {
  const buffer = `data: {"type":"tool-input-available","input":{"companySize":150}}\n\ndata: {"type":"text-delta","delta":"Hi"}\n\ndata: {"type":"partial"`;

  const events = parseSSE(buffer);

  assert.equal(events.length, 2);
  assert.equal(events[0].type, "tool-input-available");
  assert.equal(events[0].input.companySize, 150);
  assert.equal(events[1].type, "text-delta");
});

test("parseSSE ignores non-JSON events", () => {
  const buffer = `data: not-json\n\ndata: {"type":"text-delta","delta":"ok"}\n\n`;

  const events = parseSSE(buffer);

  assert.equal(events.length, 1);
  assert.equal(events[0].delta, "ok");
});

test("parseSSE returns an empty array for empty input", () => {
  assert.deepEqual(parseSSE(""), []);
});

test("getRemainingBuffer keeps the trailing incomplete chunk", () => {
  const buffer = `data: {"a":1}\n\ndata: {"par`;

  assert.equal(getRemainingBuffer(buffer), 'data: {"par');
});

test("httpError creates an error with a status code", () => {
  const error = httpError(429);

  assert.equal(error.status, 429);
  assert.match(error.message, /429/);
});

test("getErrorDetails maps HTTP statuses to friendly messages", () => {
  assert.equal(getErrorDetails(httpError(429)).title, "You're sending messages too quickly.");
  assert.equal(getErrorDetails(httpError(401)).title, "Something went wrong");
  assert.equal(getErrorDetails(httpError(400)).title, "We couldn't process that request.");
  assert.equal(getErrorDetails(httpError(404)).title, "Connection problem");
  assert.equal(getErrorDetails(httpError(500)).title, "Something went wrong");
});

test("getErrorDetails handles tool output errors", () => {
  const error = new Error("AI returned malformed JSON.");
  error.kind = "tool-output-error";

  const details = getErrorDetails(error);

  assert.equal(details.title, "Lead scoring failed");
  assert.equal(details.detail, "AI returned malformed JSON.");
});

test("getErrorDetails handles network errors", () => {
  const error = new TypeError("Failed to fetch");

  const details = getErrorDetails(error);

  assert.equal(details.title, "Connection problem");
});

test("getErrorDetails handles unknown errors gracefully", () => {
  const details = getErrorDetails(new Error("mystery"));

  assert.equal(details.title, "Something went wrong");
});