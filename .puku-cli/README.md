# Puku-CLI Configuration (`.puku-cli/`)

This directory mirrors the AWS AI-DLC (AI-Driven Development Life Cycle)
configuration from `.claude/`, but is hosted under the **Puku-CLI** harness so
that all slash commands, agents, hooks, skills, scopes, sensors, rules and
tools load automatically when using `puku-cli`.

> The `.claude/` folder is the canonical source. This mirror lets the same
> AIDLC workflow run under Puku-CLI without modifying the original folder.

## Layout

| Folder | Contents |
|---|---|
| `settings.json` | Main settings: `companyAnnouncements`, `permissions`, `hooks`, `statusLine`, `env` |
| `settings.local.json` | Per-user overrides (gitignored). Pre-existing permissions preserved. |
| `settings.local.json.example` | Template for personal overrides |
| `agents/` | 14 AIDLC agent definitions (architect, AWS platform, developer, etc.) |
| `hooks/` | 19 lifecycle hooks (`session-start`, `state-transition-guard`, `review-freeze`, …) |
| `skills/` | 42 slash commands (`/aidlc`, `/aidlc-init`, `/aidlc-mvp`, `/aidlc-bugfix`, …) |
| `scopes/` | 11 workflow scope definitions (`classic`, `feature`, `mvp`, `poc`, …) |
| `sensors/` | 6 artifact quality sensors (lint, traceability, type-check, …) |
| `rules/` | AIDLC rule file |
| `knowledge/` | 16 agent knowledge folders |
| `tools/` | ~80 AIDLC engine TypeScript modules |
| `aidlc-common/` | Shared conductor + protocol + stage definitions |
| `CLAUDE.md` | Original Claude AIDLC project notes |

## Available Slash Commands

Run any of these in Puku-CLI as `/aidlc-<name>`:

- `/aidlc` — start/resume a workflow
- `/aidlc-init` — initialize a new project
- `/aidlc-replay` — replay a prior workflow
- `/aidlc-reverse-engineering` — analyze existing codebase
- `/aidlc-mvp` — minimal viable product flow
- `/aidlc-practices-discovery` — discover team practices
- `/aidlc-requirements-analysis` — analyze requirements
- `/aidlc-user-stories` — generate user stories
- `/aidlc-domain-design` — design domain model
- `/aidlc-units-generation` — generate units
- `/aidlc-contract-design` — design contracts
- `/aidlc-delivery-planning` — plan delivery
- `/aidlc-functional-design` — design functionality
- `/aidlc-nfr-design` — design non-functional requirements
- `/aidlc-nfr-requirements` — NFR requirements
- `/aidlc-infrastructure-design` — design infrastructure
- `/aidlc-code-generation` — generate code
- `/aidlc-build-and-test` — build and test
- `/aidlc-ci-pipeline` — set up CI
- `/aidlc-deployment-pipeline` — deployment pipeline
- `/aidlc-deployment-execution` — execute deployment
- `/aidlc-environment-provisioning` — provision environments
- `/aidlc-observability-setup` — setup observability
- `/aidlc-incident-response` — incident response
- `/aidlc-performance-validation` — validate performance
- `/aidlc-feedback-optimization` — feedback and optimization
- `/aidlc-bugfix` — bug fix workflow
- `/aidlc-security-patch` — security patch workflow
- `/aidlc-feature` — feature workflow
- `/aidlc-express` — express flow
- `/aidlc-compose` — compose intent
- `/aidlc-session-cost` — session cost report
- `/aidlc-knowledge` — knowledge base
- `/aidlc-team-formation` — team formation
- `/aidlc-intent-capture` — capture intent
- `/aidlc-market-research` — market research
- `/aidlc-feasibility` — feasibility study
- `/aidlc-scope-definition` — define scope
- `/aidlc-rough-mockups` — rough mockups
- `/aidlc-refined-mockups` — refined mockups
- `/aidlc-approval-handoff` — approval handoff
- `/aidlc-outcomes-pack` — outcomes pack

Plus `/login` and other Puku-CLI built-ins.

## Environment Variables

| Var | Purpose |
|---|---|
| `PUKU_CLI_HOME` | `.puku-cli` (set in `settings.json`) |
| `AWS_AIDLC_DEFAULT_SCOPE` | Default scope for `/aidlc` (currently `classic`) |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | Auto-compact at 85 % |
| `AIDLC_DISABLE_USAGE_TRACKING` | Set to `1` to hide cost segment in statusline |

## Hooks

All hooks are dispatched through the `aidlc engine` CLI (the engine is shared
between `.claude/` and `.puku-cli/`). The 19 hooks wired up here cover:

- `PreToolUse`: `fold-usage`, `deliver-stage-rules`, `state-transition-guard`,
  `reviewer-scope`, `review-freeze`, `plan-approval-guard`
- `UserPromptSubmit`: `record-human-turn`
- `SessionStart` / `SessionEnd`: `session-start`, `session-end`
- `PostToolUse`: `write-audit-log`, `run-sensors`, `sync-workflow-state`,
  `record-human-turn`, `rebuild-stage-graph`, `deliver-stage-rules`, `fold-usage`
- `PreCompact`: `validate-state`
- `SubagentStop`: `log-subagent`
- `Stop`: `continue-workflow`

## Notes

- The existing `.puku-cli/settings.local.json` (created 2026-09-06) is
  preserved. It contains your personal permission allow-list.
- `skills-lock.json` at the project root is the central skill registry; it
  already points to skills from `.claude/` and these will work transparently.
- Run `aidlc doctor` (or `aidlc doctor --verbose`) to verify the engine sees
  this folder.
