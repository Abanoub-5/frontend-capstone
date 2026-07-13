# Workflow Comparison

## Feature

For this exercise, I implemented a Settings page that allows users to update their profile information, including their name, email address, and preferred theme. The feature includes client-side validation and accessibility improvements while following the existing project structure.

## Round One

For the first attempt, I intentionally used a vague prompt:

> "Create a settings page."

The AI generated a basic interface that displayed the required fields, but the implementation was incomplete. Validation was either missing or inconsistent, accessibility features such as proper labels and error states were not included, and the generated code required significant manual review. Because the prompt was so general, the AI made assumptions that did not fully match the project's requirements.

## Round Two

For the second attempt, I used a much more detailed prompt. I referenced the existing project files, required the AI to reuse current components, specified validation rules, requested accessibility improvements, and asked it to inspect the project, create an implementation plan, write the code, verify the results, and summarize the changes.

The second implementation was noticeably better. The generated code followed the existing project structure, included inline validation messages, disabled the Save button until the form was valid, and used accessibility attributes such as `aria-invalid` with properly associated labels.

## Specific Differences

The detailed version introduced several concrete improvements over the vague version:

- Added inline validation for required fields.
- Improved email validation logic.
- Added `aria-invalid` to invalid inputs.
- Disabled the Save button until validation passed.
- Reused the existing UI components instead of creating unnecessary duplicates.
- Followed the project's folder organization and coding style more closely.

## AI Mistake I Caught

One mistake I identified was that the AI accepted whitespace-only input as a valid name. I corrected the validation by trimming the input before checking whether it was empty. This prevented invalid data from being submitted.

## Review Effort

The vague prompt required much more manual review because I had to identify missing validation, accessibility issues, and project-specific inconsistencies myself. The detailed prompt produced a solution that was much closer to the expected result, reducing review time and making verification easier. This exercise demonstrated that providing clear requirements, constraints, and verification steps leads to more reliable AI-generated code.