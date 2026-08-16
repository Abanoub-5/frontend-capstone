import test from "node:test";
import assert from "node:assert/strict";
import { validators } from "../src/validation.js";

test("username validation", () => {
  assert.equal(validators.username(""), "Username is required");
  assert.equal(validators.username("ab"), "Username must be at least 3 characters");
  assert.equal(
    validators.username("a".repeat(21)),
    "Username must be no more than 20 characters",
  );
  assert.equal(
    validators.username("has space"),
    "Username can only contain letters, numbers, and underscores",
  );
  assert.equal(validators.username("valid_user1"), null);
});

test("email validation", () => {
  assert.equal(validators.email(""), "Email is required");
  assert.equal(validators.email("not-an-email"), "Please enter a valid email address");
  assert.equal(validators.email("user@example.com"), null);
});

test("display name validation", () => {
  assert.equal(validators.displayName("a".repeat(51)), "Display name must be no more than 50 characters");
  assert.equal(validators.displayName(""), null);
  assert.equal(validators.displayName("Ada"), null);
});

test("bio validation", () => {
  assert.equal(validators.bio("a".repeat(201)), "Bio must be no more than 200 characters");
  assert.equal(validators.bio("short bio"), null);
});

test("avatar URL validation", () => {
  assert.equal(
    validators.avatar("javascript:alert(1)"),
    "Please enter a valid URL starting with http:// or https://",
  );
  assert.equal(validators.avatar("https://example.com/avatar.png"), null);
});

test("new password validation", () => {
  assert.equal(validators.newPassword("short"), "Password must be at least 8 characters");
  assert.equal(
    validators.newPassword("alllowercase1"),
    "Password must contain uppercase, lowercase, and number",
  );
  assert.equal(validators.newPassword("Password1"), null);
  assert.equal(validators.newPassword(""), null);
});

test("confirm password validation", () => {
  const formData = { newPassword: "Password1" };
  assert.equal(
    validators.confirmPassword("Different1", formData),
    "Passwords do not match",
  );
  assert.equal(validators.confirmPassword("Password1", formData), null);
  assert.equal(validators.confirmPassword("", formData), null);
});