# Branch Naming Prompt

Based on this prompt: "{USER_PROMPT}", generate a git branch name following standard naming conventions.

Use one of these prefixes based on the type of work:
- **feat/** - for new features or enhancements that add functionality
- **fix/** - for bug fixes and corrections
- **chore/** - only when the work is truly behind-the-scenes (maintenance, refactoring, tooling updates, etc.)

**Important:** Use chore/ only when the work is truly behind-the-scenes. If the change adds a new feature or fixes a bug, use feat/ or fix/ instead.

## Format
`<prefix>/<short-descriptive-name>`

## Rules
- Use lowercase letters and hyphens only
- Keep the description part under 25 characters
- Be descriptive but concise

## Examples
- `feat/user-authentication`
- `feat/payment-integration`
- `fix/header-styling-issue`
- `fix/login-validation-bug`
- `chore/update-dependencies`
- `chore/refactor-utils`

## Common Branch Prefixes Reference
- **feat/** - New features, enhancements, or functionality additions
- **fix/** - Bug fixes, corrections, patches
- **chore/** - Maintenance tasks, dependency updates, refactoring, tooling
- **docs/** - Documentation updates only
- **style/** - Code style changes (formatting, missing semicolons, etc.)
- **refactor/** - Code refactoring without changing functionality
- **test/** - Adding or updating tests
- **perf/** - Performance improvements

Return ONLY the complete branch name with prefix, nothing else. 