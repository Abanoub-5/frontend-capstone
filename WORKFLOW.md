# Workflow Comparison

## Feature

Implemented a Settings page with validation.

## Round One

Used a single vague prompt:

"Create a settings page."

Results:

- Generated working UI
- Missing validation
- No accessibility
- No tests
- Required manual fixes

## Round Two

Used a structured prompt including:

- project file references
- validation requirements
- accessibility
- testing
- implementation plan
- verification

Results:

- Correct validation
- Accessible labels
- Inline errors
- Unit tests
- Better code organization

## Specific Differences

- Added aria-invalid
- Added disabled Save button
- Added email regex validation
- Added Settings.test.tsx
- Reused existing Button component
- Followed project folder structure

## AI Mistake I Caught

The AI initially forgot to trim whitespace before validation, allowing `"   "` as a valid name. I corrected this by trimming input values before checking for emptiness.

## Review Effort

The vague version required significantly more manual review because every requirement had to be checked manually. The detailed version mostly required verifying implementation against the prompt.